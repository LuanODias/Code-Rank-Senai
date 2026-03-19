const { requireAuth } = require('../../middlewares/requireAuth');

jest.mock('better-auth/node', () => ({
  fromNodeHeaders: jest.fn((headers) => headers),
}));

describe('requireAuth middleware', () => {
  const makeAuth = (session) => ({
    api: {
      getSession: jest.fn().mockResolvedValue(session),
    },
  });

  const makeSut = (session) => {
    const auth = makeAuth(session);
    const middleware = requireAuth(auth);
    const req = { headers: { authorization: 'Bearer token' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    return { auth, middleware, req, res, next };
  };

  it('should call next and set req.user when session is valid', async () => {
    // arrange
    const session = { user: { id: '123', role: 'teacher' } };
    const { middleware, req, res, next } = makeSut(session);

    // act
    await middleware(req, res, next);

    // assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(session.user);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when session is null', async () => {
    // arrange
    const { middleware, req, res, next } = makeSut(null);

    // act
    await middleware(req, res, next);

    // assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call auth.api.getSession with request headers', async () => {
    // arrange
    const session = { user: { id: '123', role: 'admin' } };
    const { auth, middleware, req, res, next } = makeSut(session);

    // act
    await middleware(req, res, next);

    // assert
    expect(auth.api.getSession).toHaveBeenCalledTimes(1);
  });
});
