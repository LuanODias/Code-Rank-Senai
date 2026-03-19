const { AppError } = require('../../utils/AppError');

describe('AppError', () => {
  it('should be an instance of Error', () => {
    const error = new AppError(404, 'Not found');
    expect(error).toBeInstanceOf(Error);
  });

  it('should set statusCode correctly', () => {
    const error = new AppError(400, 'Bad request');
    expect(error.statusCode).toBe(400);
  });

  it('should set message correctly', () => {
    const error = new AppError(500, 'Internal error');
    expect(error.message).toBe('Internal error');
  });

  it('should set name to AppError', () => {
    const error = new AppError(401, 'Unauthorized');
    expect(error.name).toBe('AppError');
  });

  it('should have a stack trace', () => {
    const error = new AppError(403, 'Forbidden');
    expect(error.stack).toBeDefined();
  });
});
