import 'dotenv/config';
import { db } from '../server/access';
import { mappingConfigured, normalizeEvent } from '../server/zuptos';

if (!mappingConfigured()) throw new Error('Configure os caminhos reais e o mapa de status no .env antes de reprocessar.');
const rows = await db<{ id: string; payload: Record<string, unknown> }[]>('webhook_inbox?processed_at=is.null&select=id,payload&order=received_at.asc&limit=100');
let processed = 0;
for (const row of rows) {
  const event = normalizeEvent(row.payload);
  if (!event) {
    await db(`webhook_inbox?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ processed_at: new Date().toISOString() }) });
    continue;
  }
  await db('rpc/apply_purchase_event', { method: 'POST', body: JSON.stringify({ p_receipt: row.id, p_event: event }) });
  processed++;
}
console.log(`${processed} notificações processadas. Execute novamente se houver mais de 100 notificações pendentes.`);
