import { config } from 'dotenv';
import { createHash, randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { db, required } from '../server/access.js';
import { mappingConfigured } from '../server/zuptos.js';

config({ path: '.env.production.local', quiet: true });
const base = required('APP_URL');
const unique = randomUUID();
const email = `verificacao-${unique}@example.com`;
const order = `verificacao-${unique}`;
const payload: Record<string, unknown> = { integration_test: unique };
const receipts: string[] = [];
function setField(path: string, value: unknown) {
  const parts = path.split('.');
  let current: any = payload;
  parts.forEach((part, index) => {
    const key = part === '*' ? 0 : part;
    if (index === parts.length - 1) current[key] = value;
    else { current[key] ??= parts[index + 1] === '*' ? [] : {}; current = current[key]; }
  });
}
async function sendWebhook() {
  const body = JSON.stringify(payload);
  const receipt = createHash('sha256').update(body).digest('hex');
  receipts.push(receipt);
  const response = await fetch(`${base}/api/zuptos-webhook`, {
    method: 'POST', headers: { Authorization: `Bearer ${required('ZUPTOS_WEBHOOK_TOKEN')}`, 'Content-Type': 'application/json' },
    body, signal: AbortSignal.timeout(20000),
  });
  return { response, receipt };
}
const login = () => fetch(`${base}/api/access/login`, {
  method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }), signal: AbortSignal.timeout(20000),
});

try {
  assert.equal((await login()).status, 403);
  await db('purchases', { method: 'POST', body: JSON.stringify({ provider: 'manual', order_id: order, product_id: 'radio-modao', email, status: 'approved', occurred_at: new Date().toISOString() }) });
  const accepted = await login();
  assert.equal(accepted.status, 200);
  const cookieHeader = accepted.headers.get('set-cookie') || '';
  assert.match(cookieHeader, /HttpOnly/);
  assert.match(cookieHeader, /Secure/);
  const cookie = cookieHeader.split(';')[0];
  const session = await fetch(`${base}/api/access/session`, { headers: { Cookie: cookie } });
  assert.equal(session.status, 200);
  assert.equal((await session.json()).platform, true);
  console.log('Produção: e-mail sem compra bloqueado; compra aprovada e sessão autorizadas.');

  await db(`purchases?provider=eq.manual&order_id=eq.${order}`, { method: 'PATCH', body: JSON.stringify({ status: 'refunded' }) });
  assert.equal((await fetch(`${base}/api/access/session`, { headers: { Cookie: cookie } })).status, 403);
  assert.equal((await fetch(`${base}/api/access/logout`, { method: 'POST', headers: { Origin: base, Cookie: cookie } })).status, 200);
  console.log('Produção: revogação da compra bloqueia sessão existente; saída funciona.');

  assert.equal((await fetch(`${base}/api/zuptos-webhook`, { method: 'POST', headers: { Authorization: 'Bearer invalid-test-token', 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
  assert.equal((await fetch(`${base}/musicas/track-1.mp3`, { headers: { Range: 'bytes=0-100' } })).status, 401);
  console.log('Produção: webhook sem token válido e áudio local sem sessão bloqueados.');

  if (mappingConfigured()) {
    const mappings = await db<{ external_id: string }[]>('product_provider_ids?provider=eq.zuptos&product_id=eq.radio-modao&select=external_id&limit=1');
    assert.ok(mappings[0], 'Cadastre um produto Zuptos antes de verificar o webhook configurado.');
    const statuses: Record<string, string> = JSON.parse(required('ZUPTOS_STATUS_MAP'));
    const approved = Object.keys(statuses).find(key => statuses[key] === 'approved');
    assert.ok(approved);
    setField(required('ZUPTOS_EMAIL_PATH'), email);
    setField(required('ZUPTOS_ORDER_PATH'), order);
    setField(required('ZUPTOS_PRODUCTS_PATH'), mappings[0].external_id);
    setField(required('ZUPTOS_STATUS_PATH'), approved);
    setField(required('ZUPTOS_DATE_PATH'), new Date().toISOString());
    const { response, receipt } = await sendWebhook();
    assert.equal(response.status, 200);
    const stored = await db<{ processed_at: string | null }[]>(`webhook_inbox?id=eq.${receipt}&select=processed_at`);
    assert.ok(stored[0]?.processed_at);
    assert.equal((await sendWebhook()).response.status, 200);
    const query = `purchases?provider=eq.zuptos&order_id=eq.${order}&select=status`;
    const purchases = await db<{ status: string }[]>(query);
    assert.equal(purchases.length, 1);
    assert.equal(purchases[0].status, 'approved');
    console.log('Produção: webhook simulado concede a compra; repetição não duplica o registro.');
    const refund = Object.keys(statuses).find(key => statuses[key] === 'refunded');
    if (refund) {
      setField(required('ZUPTOS_STATUS_PATH'), refund);
      setField(required('ZUPTOS_DATE_PATH'), new Date().toISOString());
      assert.equal((await sendWebhook()).response.status, 200);
      assert.equal((await db<{ status: string }[]>(query))[0].status, 'refunded');
      assert.equal((await login()).status, 403);
      console.log('Produção: reembolso simulado via webhook revoga a compra e bloqueia a entrada.');
    }
  } else {
    const { response, receipt } = await sendWebhook();
    assert.equal(response.status, 202);
    assert.ok((await db<{ id: string }[]>(`webhook_inbox?id=eq.${receipt}&select=id`))[0]);
    console.log('Produção: webhook recebido e guardado para configurar o formato real.');
  }
} finally {
  await db(`access_sessions?email=eq.${encodeURIComponent(email)}`, { method: 'DELETE' });
  await db(`purchases?order_id=eq.${order}`, { method: 'DELETE' });
  for (const receipt of new Set(receipts)) await db(`webhook_inbox?id=eq.${receipt}`, { method: 'DELETE' });
  console.log('Dados temporários da verificação removidos.');
}
