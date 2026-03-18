const jwt = require('jsonwebtoken');
const { fromNodeHeaders } = require('better-auth/node');
const { env } = require('../config/env');

const requireAdminAccess = (auth) => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, env.ADMIN_SECRET);
        if (payload.type !== 'api_token') {
          res.status(401).json({ error: 'Invalid token type' });
          return;
        }
        req.user = { id: payload.sub, role: 'admin' };
        next();
        return;
      } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!['admin', 'developer'].includes(session.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    req.user = session.user;
    next();
  };
};

module.exports = { requireAdminAccess };
