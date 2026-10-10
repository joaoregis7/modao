import { HttpError, emailAddress, required } from './access.js';

// Campos definidos depois de observar um evento REAL da Zuptos.
// O caminho "items.*.id" extrai IDs de todos os itens de um array.
export function field(payload: unknown, path: string): unknown {
  const parts = path.split('.');
  const visit = (value: any, index: number): any => {
    if (index === parts.length) return value;
    if (parts[index] === '*') return Array.isArray(value) ? value.flatMap(item => visit(item, index + 1)).filter(item => item !== undefined) : undefined;
    return value && typeof value === 'object' ? visit(value[parts[index]], index + 1) : undefined;
  };
  return visit(payload, 0);
}

const fields = ['ZUPTOS_EMAIL_PATH', 'ZUPTOS_ORDER_PATH', 'ZUPTOS_PRODUCTS_PATH', 'ZUPTOS_STATUS_PATH', 'ZUPTOS_DATE_PATH', 'ZUPTOS_STATUS_MAP'];
export const mappingConfigured = () => fields.every(name => Boolean(process.env[name]));

export function normalizeEvent(payload: Record<string, unknown>) {
  const email = emailAddress(field(payload, required('ZUPTOS_EMAIL_PATH')));
  const order = field(payload, required('ZUPTOS_ORDER_PATH'));
  if ((typeof order !== 'string' && typeof order !== 'number') || !String(order).trim()) throw new HttpError(422, 'Pedido ausente.');
  const rawProducts = field(payload, required('ZUPTOS_PRODUCTS_PATH'));
  const ids = [...new Set((Array.isArray(rawProducts) ? rawProducts : [rawProducts]).map(id => {
    if ((typeof id !== 'string' && typeof id !== 'number') || !String(id).trim()) throw new HttpError(422, 'Produto ausente.');
    return String(id);
  }))];
  if (!ids.length) throw new HttpError(422, 'Produto ausente.');
  let statuses: Record<string, string>;
  try { statuses = JSON.parse(required('ZUPTOS_STATUS_MAP')); }
  catch { throw new HttpError(503, 'Mapeamento de eventos inválido.'); }
  const rawStatus = field(payload, required('ZUPTOS_STATUS_PATH'));
  const status = statuses[String(rawStatus)];
  if (!status) return null; // Eventos não mapeados não concedem acesso.
  if (!['approved', 'refunded', 'chargeback'].includes(status)) throw new HttpError(503, 'Status configurado inválido.');
  const rawDate = field(payload, required('ZUPTOS_DATE_PATH'));
  const date = typeof rawDate === 'string' ? new Date(rawDate) : new Date(NaN);
  if (Number.isNaN(date.getTime())) throw new HttpError(422, 'Data do evento ausente ou inválida. Use um campo ISO 8601.');
  return { email, order_id: String(order), external_product_ids: ids, status, occurred_at: date.toISOString() };
}
