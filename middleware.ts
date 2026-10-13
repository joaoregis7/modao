import { next } from '@vercel/functions';

// Acesso direto às músicas, preservando Range/streaming do CDN.
export const config = { matcher: ['/musicas/:path*'], runtime: 'nodejs' };

export default async function middleware(_request: Request) {
  return next({ headers: { 'Cache-Control': 'private, no-store' } });
}
