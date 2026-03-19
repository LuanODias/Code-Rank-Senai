jest.mock('dotenv', () => ({ config: jest.fn() }));

const REQUIRED_VARS = {
  DATABASE_URL: 'postgresql://localhost/test',
  BETTER_AUTH_SECRET: 'secret',
  BETTER_AUTH_URL: 'http://localhost:3000',
  ADMIN_SECRET: 'admin-secret',
};

describe('env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, ...REQUIRED_VARS };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should export env with all required variables', () => {
    const { env } = require('../../config/env');

    expect(env.DATABASE_URL).toBe(REQUIRED_VARS.DATABASE_URL);
    expect(env.BETTER_AUTH_SECRET).toBe(REQUIRED_VARS.BETTER_AUTH_SECRET);
    expect(env.BETTER_AUTH_URL).toBe(REQUIRED_VARS.BETTER_AUTH_URL);
    expect(env.ADMIN_SECRET).toBe(REQUIRED_VARS.ADMIN_SECRET);
  });

  it('should default PORT to 3000 when not set', () => {
    delete process.env.PORT;
    const { env } = require('../../config/env');
    expect(env.PORT).toBe(3000);
  });

  it('should parse PORT as a number', () => {
    process.env.PORT = '8080';
    const { env } = require('../../config/env');
    expect(env.PORT).toBe(8080);
    expect(typeof env.PORT).toBe('number');
  });

  it('should default NODE_ENV to development when not set', () => {
    delete process.env.NODE_ENV;
    const { env } = require('../../config/env');
    expect(env.NODE_ENV).toBe('development');
  });

  it('should throw when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;
    expect(() => require('../../config/env')).toThrow(
      'Environment variable DATABASE_URL is required',
    );
  });

  it('should throw when BETTER_AUTH_SECRET is missing', () => {
    delete process.env.BETTER_AUTH_SECRET;
    expect(() => require('../../config/env')).toThrow(
      'Environment variable BETTER_AUTH_SECRET is required',
    );
  });

  it('should throw when BETTER_AUTH_URL is missing', () => {
    delete process.env.BETTER_AUTH_URL;
    expect(() => require('../../config/env')).toThrow(
      'Environment variable BETTER_AUTH_URL is required',
    );
  });

  it('should throw when ADMIN_SECRET is missing', () => {
    delete process.env.ADMIN_SECRET;
    expect(() => require('../../config/env')).toThrow(
      'Environment variable ADMIN_SECRET is required',
    );
  });
});
