import { next } from '@vercel/functions';
import { HttpError, sessionAccess, type Request as ServerRequest } from './server/access.js';

// Protege também o arquivo de áudio, preservando Range/streaming do CDN.
export const config = { matcher: ['/musicas/:path*'], runtime: 'nodejs' };

export default async function middleware(request: Request) {
  try {
    await sessionAccess({ headers: { cookie: request.headers.get('cookie') || '' } } as ServerRequest);
    return next({ headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return new Response(null, { status: error instanceof HttpError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
