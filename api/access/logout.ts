import { clearCookie, db, endpoint, method, reply, sameOrigin, sessionHash } from '../../server/access.js';

export default endpoint(async (req, res) => {
  method(req, 'POST');
  sameOrigin(req);
  const hash = sessionHash(req);
  if (hash) await db(`access_sessions?token_hash=eq.${hash}`, { method: 'DELETE' });
  clearCookie(res);
  reply(res, 200, { ok: true });
});
