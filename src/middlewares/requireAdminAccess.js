const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { getPrismaClient } = require('../config/prisma');

const requireAdminAccess = () => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);

      // Tenta validar como JWT de admin
      try {
        const payload = jwt.verify(token, env.ADMIN_SECRET);
        if (payload.type === 'api_token') {
          req.user = { role: 'admin' };
          next();
          return;
        }
      } catch {
        // Não é um JWT de admin — tenta como session token
      }

      // Tenta buscar como session token no banco
      const prisma = getPrismaClient();
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!['admin', 'developer'].includes(session.user.role)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      req.user = session.user;
      next();
      return;
    }

    res.status(401).json({ error: 'Unauthorized' });
  };
};

module.exports = { requireAdminAccess };
