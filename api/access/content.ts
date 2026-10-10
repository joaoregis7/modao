import { db, endpoint, HttpError, method, reply, required, sessionAccess } from '../../server/access.js';

export default endpoint(async (req, res) => {
  method(req, 'GET');
  const access = await sessionAccess(req);
  const id = new URL(req.url || '/', required('APP_URL')).searchParams.get('product');
  const product = access.products.find(p => p.id === id && p.owned && !p.is_platform);
  if (!product) throw new HttpError(403, 'Este produto não está liberado para sua conta.');
  const contents = await db<{ content_url: string | null; storage_path: string | null }[]>(`product_contents?product_id=eq.${encodeURIComponent(product.id)}&select=content_url,storage_path&limit=1`);
  const content = contents[0];
  if (!content) throw new HttpError(404, 'O conteúdo deste produto ainda não foi cadastrado.');
  if (content.storage_path) {
    const path = content.storage_path.split('/').map(encodeURIComponent).join('/');
    const response = await fetch(`${required('SUPABASE_URL').replace(/\/$/, '')}/storage/v1/object/sign/${path}`, {
      method: 'POST', headers: { Authorization: `Bearer ${required('SUPABASE_SERVICE_ROLE_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn: 120 }), signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new HttpError(503, 'Não foi possível abrir o conteúdo. Tente novamente.');
    const { signedURL } = await response.json();
    reply(res, 200, { url: `${required('SUPABASE_URL').replace(/\/$/, '')}/storage/v1${signedURL}` });
  } else if (content.content_url?.startsWith('https://')) {
    reply(res, 200, { url: content.content_url });
  } else throw new HttpError(404, 'Conteúdo indisponível.');
});
