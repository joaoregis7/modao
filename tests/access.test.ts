import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { accessFor, emailAddress, HttpError, sessionAccess, webhookAuth, type Request, type Response } from '../server/access';
import { field, normalizeEvent } from '../server/zuptos';
import login from '../api/access/login';
import content from '../api/access/content';
import webhook from '../api/zuptos-webhook';
import middleware from '../middleware';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
process.env.APP_URL = 'https://app.radiomodao.online';
process.env.SUPABASE_URL = 'https://database.example';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-key';
process.env.ZUPTOS_WEBHOOK_TOKEN = 'test-secret';

function response() {
  const headers: Record<string, string> = {};
  const state = { statusCode: 0, body: '', headers, setHeader: (key: string, value: string) => { headers[key] = value; }, end: (body: string) => { state.body = body; } };
  return state;
}
function request(overrides: Partial<Request> = {}) {
  return { method: 'POST', headers: { origin: process.env.APP_URL, 'content-type': 'application/json' }, socket: { remoteAddress: '127.0.0.1' }, body: { email: 'CLIENTE@EXEMPLO.COM' }, ...overrides } as Request;
}
const products = [{ id: 'radio-modao', name: 'Rádio Modão', description: '', checkout_url: null, is_platform: true, active: true }, { id: 'extra', name: 'Extra', description: '', checkout_url: null, is_platform: false, active: true }];
function stubAccess(owned: string[]) {
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes('access_sessions?')) return new Response(JSON.stringify([{ email: 'cliente@exemplo.com' }]));
    if (url.includes('products?')) return new Response(JSON.stringify(products));
    if (url.includes('purchases?')) return new Response(JSON.stringify(owned.map(product_id => ({ product_id }))));
    if (url.includes('access_rate_limit')) return new Response('1');
    if (url.endsWith('access_sessions')) return new Response(null, { status: 201 });
    throw new Error(`Unexpected request: ${url}`);
  };
}

test('normaliza e-mail e rejeita valores inválidos', () => {
  assert.equal(emailAddress(' Cliente@Exemplo.com '), 'cliente@exemplo.com');
  assert.throws(() => emailAddress('não-é-email'), HttpError);
});
test('compra apenas do extra não concede acesso à plataforma', async () => {
  stubAccess(['extra']);
  const access = await accessFor('cliente@exemplo.com');
  assert.equal(access.platform, false);
  assert.equal(access.products.find(p => p.id === 'extra')?.owned, true);
});
test('login bloqueia não comprador sem criar cookie', async () => {
  stubAccess([]);
  const res = response();
  await login(request(), res as unknown as Response);
  assert.equal(res.statusCode, 403);
  assert.equal(res.headers['Set-Cookie'], undefined);
});
test('login cria sessão HttpOnly, Secure e não expõe token no JSON', async () => {
  stubAccess(['radio-modao']);
  const res = response();
  await login(request(), res as unknown as Response);
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Set-Cookie'], /HttpOnly; SameSite=Lax; Max-Age=2592000; Secure/);
  assert.equal(JSON.parse(res.body).email, 'cliente@exemplo.com');
  assert.equal(JSON.parse(res.body).token, undefined);
});
test('login rejeita origem diferente', async () => {
  const res = response();
  await login(request({ headers: { origin: 'https://outra.example' } }), res as unknown as Response);
  assert.equal(res.statusCode, 403);
});
test('limite de tentativas impede consulta de compra e criação de sessão', async () => {
  let requests = 0;
  globalThis.fetch = async () => { requests++; return new Response('31'); };
  const res = response();
  await login(request(), res as unknown as Response);
  assert.equal(res.statusCode, 429);
  assert.equal(requests, 1);
});
test('sessão expirada não libera acesso', async () => {
  globalThis.fetch = async () => new Response('[]');
  await assert.rejects(sessionAccess(request({ headers: { cookie: `modao_session=${'a'.repeat(64)}` } })), (error: HttpError) => error.status === 401);
});
test('sessão persistente perde acesso após revogação da compra', async () => {
  stubAccess([]);
  await assert.rejects(sessionAccess(request({ headers: { cookie: `modao_session=${'a'.repeat(64)}` } })), (error: HttpError) => error.status === 403);
});
test('conteúdo extra exige compra daquele produto', async () => {
  stubAccess(['radio-modao']);
  const res = response();
  await content(request({ method: 'GET', url: '/api/access/content?product=extra', headers: { cookie: `modao_session=${'a'.repeat(64)}` } }), res as unknown as Response);
  assert.equal(res.statusCode, 403);
});
test('conteúdo privado gera URL temporária apenas para comprador autorizado', async () => {
  stubAccess(['radio-modao', 'extra']);
  const accessFetch = globalThis.fetch;
  globalThis.fetch = async (input, options) => {
    const url = String(input);
    if (url.includes('product_contents?')) return new Response(JSON.stringify([{ content_url: null, storage_path: 'conteudos/extra.pdf' }]));
    if (url.includes('/storage/v1/object/sign/')) {
      assert.equal(JSON.parse(options?.body as string).expiresIn, 120);
      return new Response(JSON.stringify({ signedURL: '/object/sign/conteudos/extra.pdf?token=temporario' }));
    }
    return accessFetch(input, options);
  };
  const res = response();
  await content(request({ method: 'GET', url: '/api/access/content?product=extra', headers: { cookie: `modao_session=${'a'.repeat(64)}` } }), res as unknown as Response);
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).url, 'https://database.example/storage/v1/object/sign/conteudos/extra.pdf?token=temporario');
  assert.equal(res.headers['Cache-Control'], 'no-store, private');
});
test('middleware bloqueia áudio sem sessão e preserva fluxo autenticado', async () => {
  const unauthorized = await middleware(new Request('https://app.radiomodao.online/musicas/faixa.mp3'));
  assert.equal(unauthorized.status, 401);
  stubAccess(['radio-modao']);
  const allowed = await middleware(new Request('https://app.radiomodao.online/musicas/faixa.mp3', { headers: { cookie: `modao_session=${'a'.repeat(64)}`, Range: 'bytes=0-100' } }));
  assert.equal(allowed.headers.get('x-middleware-next'), '1');
  assert.equal(allowed.headers.get('cache-control'), 'private, no-store');
});
test('webhook exige segredo antes de persistir ou conceder acesso', async () => {
  globalThis.fetch = async () => { throw new Error('Não deveria acessar o banco'); };
  const res = response();
  await webhook(request({ headers: { 'content-type': 'application/json' } }), res as unknown as Response);
  assert.equal(res.statusCode, 401);
  assert.doesNotThrow(() => webhookAuth(request({ headers: { authorization: 'Bearer test-secret' } })));
});
test('webhook sem mapeamento guarda notificação sem liberar compra', async () => {
  const paths: string[] = [];
  globalThis.fetch = async input => { paths.push(String(input)); return new Response(null, { status: 201 }); };
  const res = response();
  await webhook(request({ headers: { authorization: 'Bearer test-secret', 'content-type': 'application/json' }, body: { exemplo: true } }), res as unknown as Response);
  assert.equal(res.statusCode, 202);
  assert.equal(paths.length, 1);
  assert.match(paths[0], /webhook_inbox/);
});
test('normalização configurável percorre produtos e ignora status não mapeados', () => {
  Object.assign(process.env, { ZUPTOS_EMAIL_PATH: 'buyer.email', ZUPTOS_ORDER_PATH: 'order', ZUPTOS_PRODUCTS_PATH: 'items.*.id', ZUPTOS_STATUS_PATH: 'status', ZUPTOS_DATE_PATH: 'date', ZUPTOS_STATUS_MAP: '{"pago":"approved","reembolsado":"refunded"}' });
  const payload = { buyer: { email: ' CLIENTE@EXEMPLO.COM ' }, order: 123, items: [{ id: 'a' }, { id: 'b' }, { id: 'a' }], status: 'pago', date: '2026-10-09T10:00:00Z' };
  assert.deepEqual(field(payload, 'items.*.id'), ['a', 'b', 'a']);
  assert.deepEqual(normalizeEvent(payload)?.external_product_ids, ['a', 'b']);
  assert.equal(normalizeEvent({ ...payload, status: 'aguardando' }), null);
  assert.throws(() => normalizeEvent({ ...payload, date: undefined }), HttpError);
  for (const key of ['ZUPTOS_EMAIL_PATH', 'ZUPTOS_ORDER_PATH', 'ZUPTOS_PRODUCTS_PATH', 'ZUPTOS_STATUS_PATH', 'ZUPTOS_DATE_PATH', 'ZUPTOS_STATUS_MAP']) delete process.env[key];
});
