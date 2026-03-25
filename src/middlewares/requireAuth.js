const { fromNodeHeaders } = require('better-auth/node');
const { getPrismaClient } = require('../config/prisma');

const requireAuth = (auth) => {
  return async (req, res, next) => {
    const bearer = req.headers['authorization']?.startsWith('Bearer ')
      ? req.headers['authorization'].slice(7)
      : null;

    if (bearer) {
      const prisma = getPrismaClient();
      const session = await prisma.session.findUnique({
        where: { token: bearer },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      req.user = session.user;
      next();
      return;
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    req.user = session.user;
    next();
  };
};

module.exports = { requireAuth };
