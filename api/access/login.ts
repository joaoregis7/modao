import { accessFor, createSession, db, emailAddress, endpoint, HttpError, jsonBody, method, reply, sameOrigin } from '../../server/access.js';
import { createHash } from 'node:crypto';

export default endpoint(async (req, res) => {
  method(req, 'POST');
  sameOrigin(req);
  const email = emailAddress((await jsonBody(req)).email);
  // Contador no banco: funciona entre múltiplas instâncias serverless.
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress) || 'unknown';
  const bucket = createHash('sha256').update(`login:${ip}:${Math.floor(Date.now() / 600000)}`).digest('hex');
  const attempts = await db<number>('rpc/access_rate_limit', { method: 'POST', body: JSON.stringify({ p_key: bucket }) });
  if (attempts > 30) throw new HttpError(429, 'Muitas tentativas. Aguarde alguns minutos e tente novamente.');
  const access = await accessFor(email);
  if (!access.platform) throw new HttpError(403, 'Não encontramos uma compra aprovada da plataforma para este e-mail. Confira o e-mail da compra e aguarde a confirmação do pagamento.');
  await createSession(res, email);
  reply(res, 200, access);
});
