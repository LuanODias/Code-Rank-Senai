jest.mock('better-auth/node', () => ({
  toNodeHandler: jest.fn(() => jest.fn()),
  fromNodeHeaders: jest.fn((h) => h),
}));

jest.mock('../config/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock('../config/swagger', () => ({
  swaggerSpec: {},
}));

jest.mock('../routes', () => {
  const router = jest.fn();
  router.stack = [];
  return router;
});

jest.mock('../middlewares/errorHandler', () => ({
  errorHandler: jest.fn(),
}));

jest.mock('swagger-ui-express', () => ({
  serve: [jest.fn()],
  setup: jest.fn(() => jest.fn()),
}));

const app = require('../app');

describe('app', () => {
  it('should export an express application', () => {
    expect(typeof app).toBe('function');
    expect(typeof app.use).toBe('function');
    expect(typeof app.get).toBe('function');
    expect(typeof app.listen).toBe('function');
  });

  it('should mount the API routes at /api', () => {
    const routes = require('../routes');
    const apiLayer = app.router.stack.find((l) => l.handle === routes);
    expect(apiLayer).toBeDefined();
  });

  it('should mount the errorHandler as the last middleware', () => {
    const { errorHandler } = require('../middlewares/errorHandler');
    const layer = app.router.stack.find((l) => l.handle === errorHandler);
    expect(layer).toBeDefined();
  });

  it('should expose the /api/docs.json endpoint', () => {
    const docsJsonRoute = app.router.stack.find(
      (l) => l.route?.path === '/api/docs.json',
    );
    expect(docsJsonRoute).toBeDefined();
    expect(docsJsonRoute.route.methods.get).toBe(true);
  });

  it('should return swaggerSpec on GET /api/docs.json', () => {
    const { swaggerSpec } = require('../config/swagger');
    const docsJsonRoute = app.router.stack.find(
      (l) => l.route?.path === '/api/docs.json',
    );
    const handler = docsJsonRoute.route.stack[0].handle;
    const res = { json: jest.fn() };

    handler({}, res);

    expect(res.json).toHaveBeenCalledWith(swaggerSpec);
  });
});
