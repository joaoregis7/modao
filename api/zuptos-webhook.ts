import { createHash } from 'node:crypto';
import { db, endpoint, jsonBody, method, reply, webhookAuth } from '../server/access.js';
import { mappingConfigured, normalizeEvent } from '../server/zuptos.js';

export default endpoint(async (req, res) => {
  method(req, 'POST');
  webhookAuth(req);
  const payload = await jsonBody(req);
  const receipt = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  // Caixa privada de recebimento permite descobrir o formato e reprocessar depois.
  await db('webhook_inbox?on_conflict=id', {
    method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates' },
    body: JSON.stringify({ id: receipt, payload }),
  });
  if (!mappingConfigured()) {
    reply(res, 202, { received: true, pending_configuration: true });
    return;
  }
  const event = normalizeEvent(payload);
  if (!event) { reply(res, 200, { received: true, ignored: true }); return; }
  await db('rpc/apply_purchase_event', { method: 'POST', body: JSON.stringify({ p_receipt: receipt, p_event: event }) });
  reply(res, 200, { received: true });
});
