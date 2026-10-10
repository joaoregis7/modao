import { config } from 'dotenv';
import { createHash, randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { db, required } from '../server/access.js';

config({ path: '.env.production.local', quiet: true });
const base = required('APP_URL');
const unique = randomUUID();
const email = `verificacao-${unique}@example.com`;
const order = `verificacao-${unique}`;
const payload = { integration_test: unique };
const receipt = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
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

  const hook = await fetch(`${base}/api/zuptos-webhook`, {
    method: 'POST', headers: { Authorization: `Bearer ${required('ZUPTOS_WEBHOOK_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(20000),
  });
  assert.equal(hook.status, 202);
  const stored = await db<{ id: string }[]>(`webhook_inbox?id=eq.${receipt}&select=id`);
  assert.equal(stored[0]?.id, receipt);
  console.log('Produção: webhook autenticado recebe e guarda o evento para configurar o formato real.');
} finally {
  await db(`access_sessions?email=eq.${encodeURIComponent(email)}`, { method: 'DELETE' });
  await db(`purchases?provider=eq.manual&order_id=eq.${order}`, { method: 'DELETE' });
  await db(`webhook_inbox?id=eq.${receipt}`, { method: 'DELETE' });
  console.log('Dados temporários da verificação removidos.');
}
