const { errorHandler } = require('../../middlewares/errorHandler');
const { AppError } = require('../../utils/AppError');

describe('errorHandler middleware', () => {
  const makeSut = () => {
    const req = { method: 'GET', path: '/api/test' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    return { req, res, next };
  };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should return the AppError statusCode and message', () => {
    // arrange
    const { req, res, next } = makeSut();
    const err = new AppError(404, 'Resource not found');

    // act
    errorHandler(err, req, res, next);

    // assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Resource not found' });
  });

  it('should return 409 for AppError with conflict status', () => {
    // arrange
    const { req, res, next } = makeSut();
    const err = new AppError(409, 'Email already in use');

    // act
    errorHandler(err, req, res, next);

    // assert
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email already in use' });
  });

  it('should return 500 for generic errors', () => {
    // arrange
    const { req, res, next } = makeSut();
    const err = new Error('Unexpected failure');

    // act
    errorHandler(err, req, res, next);

    // assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Internal Server Error' }),
    );
  });

  it('should include message and stack in response when NODE_ENV is not production', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const { req, res, next } = makeSut();
    const err = new Error('Something went wrong');

    // act
    errorHandler(err, req, res, next);

    // assert
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal Server Error',
        message: err.message,
        stack: err.stack,
      }),
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('should not include message and stack in response when NODE_ENV is production', () => {
    // arrange
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const { req, res, next } = makeSut();
    const err = new Error('Something went wrong');

    // act
    errorHandler(err, req, res, next);

    // assert
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });

    process.env.NODE_ENV = originalEnv;
  });

  it('should log the request method and path for generic errors', () => {
    // arrange
    const { req, res, next } = makeSut();
    const err = new Error('Log this');

    // act
    errorHandler(err, req, res, next);

    // assert
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('GET'));
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
    );
  });
});
