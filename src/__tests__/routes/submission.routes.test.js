jest.mock('better-auth/node', () => ({
  fromNodeHeaders: jest.fn((h) => h),
}));

jest.mock('../../config/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

const mockValidate = jest.fn((req, res, next) => next());
jest.mock('../../middlewares/validate', () => ({
  validate: jest.fn(() => mockValidate),
}));

const mockController = {
  submit: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  evaluate: jest.fn(),
};

jest.mock('../../factories/submission.factory', () => ({
  makeSubmissionController: jest.fn(() => mockController),
}));

const mockRequireAuth = jest.fn((req, res, next) => next());
jest.mock('../../middlewares/requireAuth', () => ({
  requireAuth: jest.fn(() => mockRequireAuth),
}));

const router = require('../../routes/submission.routes');

const findRoute = (path, method) =>
  router.stack
    .filter((l) => l.route?.path === path)
    .find((l) => l.route.methods[method])?.route;

describe('submission.routes', () => {
  describe('router-level middleware', () => {
    it('should apply requireAuth to all routes via router.use', () => {
      const middlewareLayer = router.stack.find(
        (l) => !l.route && l.handle === mockRequireAuth,
      );
      expect(middlewareLayer).toBeDefined();
    });
  });

  describe('POST /', () => {
    it('should register the route', () => {
      const route = findRoute('/', 'post');
      expect(route).toBeDefined();
      expect(route.methods.post).toBe(true);
    });

    it('should call controller.submit', () => {
      const route = findRoute('/', 'post');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.submit).toHaveBeenCalledWith(req, res, next);
    });
  });

  describe('GET /', () => {
    it('should register the route', () => {
      const route = findRoute('/', 'get');
      expect(route).toBeDefined();
      expect(route.methods.get).toBe(true);
    });

    it('should call controller.getAll', () => {
      const route = findRoute('/', 'get');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.getAll).toHaveBeenCalledWith(req, res, next);
    });
  });

  describe('GET /:id', () => {
    it('should register the route', () => {
      const route = findRoute('/:id', 'get');
      expect(route).toBeDefined();
      expect(route.methods.get).toBe(true);
    });

    it('should call controller.getById', () => {
      const route = findRoute('/:id', 'get');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.getById).toHaveBeenCalledWith(req, res, next);
    });
  });

  describe('PUT /:id/evaluate', () => {
    it('should register the route', () => {
      const route = findRoute('/:id/evaluate', 'put');
      expect(route).toBeDefined();
      expect(route.methods.put).toBe(true);
    });

    it('should call controller.evaluate', () => {
      const route = findRoute('/:id/evaluate', 'put');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.evaluate).toHaveBeenCalledWith(req, res, next);
    });
  });
});
