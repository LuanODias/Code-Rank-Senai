const jwt = require('jsonwebtoken');

const TEST_SECRET = 'test-admin-secret';

jest.mock('../../config/env', () => ({
  env: { ADMIN_SECRET: 'test-admin-secret' },
}));

jest.mock('better-auth/node', () => ({
  fromNodeHeaders: jest.fn((headers) => headers),
}));

const { requireAdminAccess } = require('../../middlewares/requireAdminAccess');

describe('requireAdminAccess middleware', () => {
  const makeAuth = (session) => ({
    api: {
      getSession: jest.fn().mockResolvedValue(session),
    },
  });

  const makeSut = (authorizationHeader, session) => {
    const auth = makeAuth(session);
    const middleware = requireAdminAccess(auth);
    const req = {
      headers: authorizationHeader
        ? { authorization: authorizationHeader }
        : {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    return { auth, middleware, req, res, next };
  };

  describe('JWT token path', () => {
    it('should call next and set req.user when token is valid api_token', async () => {
      // arrange
      const token = jwt.sign({ type: 'api_token', label: 'test' }, TEST_SECRET);
      const { middleware, req, res, next } = makeSut(`Bearer ${token}`, null);

      // act
      await middleware(req, res, next);

      // assert
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toEqual(expect.objectContaining({ role: 'admin' }));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when token type is not api_token', async () => {
      // arrange
      const token = jwt.sign({ type: 'other_type' }, TEST_SECRET);
      const { middleware, req, res, next } = makeSut(`Bearer ${token}`, null);

      // act
      await middleware(req, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token type' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      // arrange
      const { middleware, req, res, next } = makeSut(
        'Bearer invalid.token.here',
        null,
      );

      // act
      await middleware(req, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      // arrange
      const token = jwt.sign({ type: 'api_token' }, TEST_SECRET, {
        expiresIn: -1,
      });
      const { middleware, req, res, next } = makeSut(`Bearer ${token}`, null);

      // act
      await middleware(req, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('session path', () => {
    it('should call next and set req.user when session has admin role', async () => {
      // arrange
      const session = { user: { id: '123', role: 'admin' } };
      const { middleware, req, res, next } = makeSut(null, session);

      // act
      await middleware(req, res, next);

      // assert
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toEqual(session.user);
    });

    it('should call next when session has developer role', async () => {
      // arrange
      const session = { user: { id: '123', role: 'developer' } };
      const { middleware, req, res, next } = makeSut(null, session);

      // act
      await middleware(req, res, next);

      // assert
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 401 when there is no session', async () => {
      // arrange
      const { middleware, req, res, next } = makeSut(null, null);

      // act
      await middleware(req, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when session user has teacher role', async () => {
      // arrange
      const session = { user: { id: '123', role: 'teacher' } };
      const { middleware, req, res, next } = makeSut(null, session);

      // act
      await middleware(req, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
