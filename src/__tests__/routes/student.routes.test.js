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
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

jest.mock('../../factories/student.factory', () => ({
  makeStudentController: jest.fn(() => mockController),
}));

const mockRequireAuth = jest.fn((req, res, next) => next());
jest.mock('../../middlewares/requireAuth', () => ({
  requireAuth: jest.fn(() => mockRequireAuth),
}));

const mockRequireRole = jest.fn((req, res, next) => next());
jest.mock('../../middlewares/requireRole', () => ({
  requireRole: jest.fn(() => mockRequireRole),
}));

const router = require('../../routes/student.routes');

const findRoute = (path, method) =>
  router.stack
    .filter((l) => l.route?.path === path)
    .find((l) => l.route.methods[method])?.route;

describe('student.routes', () => {
  describe('router-level middleware', () => {
    it('should apply requireAuth to all routes via router.use', () => {
      const middlewareLayer = router.stack.find(
        (l) => !l.route && l.handle === mockRequireAuth,
      );
      expect(middlewareLayer).toBeDefined();
    });

    it('should apply requireRole to all routes via router.use', () => {
      const middlewareLayer = router.stack.find(
        (l) => !l.route && l.handle === mockRequireRole,
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

    it('should call controller.create', () => {
      const route = findRoute('/', 'post');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.create).toHaveBeenCalledWith(req, res, next);
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

  describe('PUT /:id', () => {
    it('should register the route', () => {
      const route = findRoute('/:id', 'put');
      expect(route).toBeDefined();
      expect(route.methods.put).toBe(true);
    });

    it('should call controller.update', () => {
      const route = findRoute('/:id', 'put');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.update).toHaveBeenCalledWith(req, res, next);
    });
  });

  describe('DELETE /:id', () => {
    it('should register the route', () => {
      const route = findRoute('/:id', 'delete');
      expect(route).toBeDefined();
      expect(route.methods.delete).toBe(true);
    });

    it('should call controller.remove', () => {
      const route = findRoute('/:id', 'delete');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.remove).toHaveBeenCalledWith(req, res, next);
    });
  });
});
