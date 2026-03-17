const { fromNodeHeaders } = require('better-auth/node');

const requireAuth = (auth) => {
  return async (req, res, next) => {
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
