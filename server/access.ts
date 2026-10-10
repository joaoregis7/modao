import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export type Request = IncomingMessage & { body?: unknown };
export type Response = ServerResponse;
export type Product = { id: string; name: string; description: string; checkout_url: string | null; is_platform: boolean; active: boolean };
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function required(name: string) {
  const value = process.env[name];
  if (!value) throw new HttpError(503, 'O acesso ainda está sendo configurado. Tente novamente mais tarde.');
  return value;
}

export async function db<T>(resource: string, options: RequestInit = {}): Promise<T> {
  const key = required('SUPABASE_SERVICE_ROLE_KEY');
  const result = await fetch(`${required('SUPABASE_URL').replace(/\/$/, '')}/rest/v1/${resource}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...options.headers },
    signal: AbortSignal.timeout(15000),
  });
  if (!result.ok) throw new HttpError(503, 'Não foi possível consultar o acesso. Tente novamente.');
  const text = await result.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function reply(res: Response, status: number, body: unknown) {
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

export function endpoint(handler: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try { await handler(req, res); }
    catch (error) {
      reply(res, error instanceof HttpError ? error.status : 503, {
        error: error instanceof HttpError ? error.message : 'Serviço temporariamente indisponível. Tente novamente.',
      });
    }
  };
}

export function method(req: Request, expected: string) {
  if (req.method !== expected) throw new HttpError(405, 'Método não permitido.');
}

export function sameOrigin(req: Request) {
  const expected = new URL(required('APP_URL')).origin;
  if (req.headers.origin !== expected) throw new HttpError(403, 'Origem não permitida.');
}

export async function jsonBody(req: Request): Promise<Record<string, unknown>> {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new HttpError(415, 'Envie JSON.');
  let body = req.body;
  if (body === undefined) {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      const buffer = Buffer.from(chunk);
      size += buffer.length;
      if (size > 128 * 1024) throw new HttpError(413, 'Notificação muito grande.');
      chunks.push(buffer);
    }
    body = Buffer.concat(chunks).toString('utf8');
  }
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    try { body = JSON.parse(body.toString()); }
    catch { throw new HttpError(400, 'JSON inválido.'); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'JSON inválido.');
  if (Buffer.byteLength(JSON.stringify(body)) > 128 * 1024) throw new HttpError(413, 'Notificação muito grande.');
  return body as Record<string, unknown>;
}

export function emailAddress(input: unknown) {
  if (typeof input !== 'string') throw new HttpError(400, 'Informe o e-mail utilizado na compra.');
  const email = input.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Informe um e-mail válido.');
  return email;
}

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const cookieName = 'modao_session';
const cookie = (token: string, age: number) => `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(required('APP_URL')).protocol === 'https:' ? '; Secure' : ''}`;

export function sessionHash(req: Request) {
  const token = req.headers.cookie?.split(';').map(item => item.trim()).find(item => item.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? hash(token) : null;
}

export async function createSession(res: Response, email: string) {
  const token = randomBytes(32).toString('hex');
  const age = 60 * 60 * 24 * 30;
  await db('access_sessions', { method: 'POST', body: JSON.stringify({ token_hash: hash(token), email, expires_at: new Date(Date.now() + age * 1000).toISOString() }) });
  res.setHeader('Set-Cookie', cookie(token, age));
}

export function clearCookie(res: Response) { res.setHeader('Set-Cookie', cookie('', 0)); }

export async function accessFor(email: string) {
  const [products, purchases] = await Promise.all([
    db<Product[]>('products?active=eq.true&select=id,name,description,checkout_url,is_platform,active&order=is_platform.desc,name.asc'),
    db<{ product_id: string }[]>(`purchases?email=eq.${encodeURIComponent(email)}&status=eq.approved&select=product_id`),
  ]);
  const ids = new Set(purchases.map(p => p.product_id));
  const platform = products.some(p => p.is_platform && ids.has(p.id));
  return { email, platform, products: products.map(p => ({ ...p, owned: ids.has(p.id) })) };
}

export async function sessionAccess(req: Request) {
  const token = sessionHash(req);
  if (!token) throw new HttpError(401, 'Entre com o e-mail da compra.');
  const sessions = await db<{ email: string }[]>(`access_sessions?token_hash=eq.${token}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=email&limit=1`);
  if (!sessions[0]) throw new HttpError(401, 'Sua sessão expirou. Entre novamente.');
  const access = await accessFor(sessions[0].email);
  if (!access.platform) throw new HttpError(403, 'Não há uma compra aprovada da plataforma para este e-mail.');
  return access;
}

export function webhookAuth(req: Request) {
  const secret = required('ZUPTOS_WEBHOOK_TOKEN');
  const header = process.env.ZUPTOS_TOKEN_HEADER?.toLowerCase() || 'authorization';
  const raw = req.headers[header];
  const supplied = typeof raw === 'string' ? raw.replace(/^Bearer\s+/i, '') : '';
  // A URL com token atende provedores que não permitem configurar o header.
  const urlToken = new URL(req.url || '/', required('APP_URL')).searchParams.get('token') || '';
  const equal = (value: string) => timingSafeEqual(Buffer.from(hash(value)), Buffer.from(hash(secret)));
  if (!equal(supplied) && !equal(urlToken)) throw new HttpError(401, 'Token inválido.');
}
