const { requireRole } = require('../middlewares/requireRole');

describe('requireRole middleware', () => {
  const makeSut = (roles, user) => {
    const middleware = requireRole(roles);
    const req = { user };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    return { middleware, req, res, next };
  };

  it('should call next when user has an allowed role', () => {
    // arrange
    const { middleware, req, res, next } = makeSut(['admin', 'developer'], {
      id: '123',
      role: 'admin',
    });

    // act
    middleware(req, res, next);

    // assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 403 when user role is not in allowed roles', () => {
    // arrange
    const { middleware, req, res, next } = makeSut(['admin', 'developer'], {
      id: '123',
      role: 'teacher',
    });

    // act
    middleware(req, res, next);

    // assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when req.user is undefined', () => {
    // arrange
    const { middleware, req, res, next } = makeSut(['admin'], undefined);

    // act
    middleware(req, res, next);

    // assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow developer role when included in allowed roles', () => {
    // arrange
    const { middleware, req, res, next } = makeSut(['admin', 'developer'], {
      id: '123',
      role: 'developer',
    });

    // act
    middleware(req, res, next);

    // assert
    expect(next).toHaveBeenCalledTimes(1);
  });
});
