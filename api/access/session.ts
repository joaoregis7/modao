import { endpoint, method, reply, sessionAccess } from '../../server/access.js';

export default endpoint(async (req, res) => {
  method(req, 'GET');
  reply(res, 200, await sessionAccess(req));
});
