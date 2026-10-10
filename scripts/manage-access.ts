import 'dotenv/config';
import { db, emailAddress } from '../server/access';

// Uso: npm run access:manage -- grant email produto pedido
// Para revogar, repita com revoke e o MESMO pedido.
const [action, rawEmail, product, order] = process.argv.slice(2);
if (!['grant', 'revoke'].includes(action) || !product || !order) {
  throw new Error('Uso: npm run access:manage -- grant|revoke email produto pedido');
}
const email = emailAddress(rawEmail);
const existing = await db<{ email: string }[]>(`purchases?provider=eq.manual&order_id=eq.${encodeURIComponent(order)}&product_id=eq.${encodeURIComponent(product)}&select=email`);
if (existing[0] && existing[0].email !== email) throw new Error('Este pedido já pertence a outro e-mail.');
await db('purchases?on_conflict=provider,order_id,product_id', {
  method: 'POST', headers: { Prefer: 'resolution=merge-duplicates' },
  body: JSON.stringify({ provider: 'manual', order_id: order, product_id: product, email, status: action === 'grant' ? 'approved' : 'refunded', occurred_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
});
console.log(action === 'grant' ? 'Acesso registrado.' : 'Compra manual revogada. Outras compras aprovadas continuam concedendo acesso.');
