jest.mock('../../config/env', () => ({
  env: { ADMIN_SECRET: 'test-secret' },
}));

const mockValidate = jest.fn((req, res, next) => next());
jest.mock('../../middlewares/validate', () => ({
  validate: jest.fn(() => mockValidate),
}));

jest.mock('../../config/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock('../../config/prisma', () => ({
  getPrismaClient: jest.fn(() => ({})),
}));

const mockController = {
  create: jest.fn(),
  remove: jest.fn(),
  generateToken: jest.fn(),
};

jest.mock('../../factories/admin.factory', () => ({
  makeAdminController: jest.fn(() => mockController),
}));

const router = require('../../routes/admin.routes');

const findRoute = (path, method) =>
  router.stack
    .filter((l) => l.route?.path === path)
    .find((l) => l.route.methods[method])?.route;

describe('admin.routes', () => {
  describe('POST /', () => {
    it('should register the route', () => {
      const route = findRoute('/', 'post');
      expect(route).toBeDefined();
      expect(route.methods.post).toBe(true);
    });

    it('should apply requireAdminSecret middleware', () => {
      const route = findRoute('/', 'post');
      // requireAdminSecret + validate + handler
      expect(route.stack).toHaveLength(3);
    });

    it('should return 401 when X-Admin-Secret is wrong', () => {
      const route = findRoute('/', 'post');
      const middleware = route.stack[0].handle;
      const req = { headers: { 'x-admin-secret': 'wrong' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid admin secret' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when X-Admin-Secret is correct', () => {
      const route = findRoute('/', 'post');
      const middleware = route.stack[0].handle;
      const req = { headers: { 'x-admin-secret': 'test-secret' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
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

  describe('DELETE /:userId', () => {
    it('should register the route', () => {
      const route = findRoute('/:userId', 'delete');
      expect(route).toBeDefined();
      expect(route.methods.delete).toBe(true);
    });

    it('should apply requireAdminSecret middleware', () => {
      const route = findRoute('/:userId', 'delete');
      expect(route.stack).toHaveLength(2);
    });

    it('should call controller.remove', () => {
      const route = findRoute('/:userId', 'delete');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.remove).toHaveBeenCalledWith(req, res, next);
    });
  });

  describe('POST /token', () => {
    it('should register the route', () => {
      const route = findRoute('/token', 'post');
      expect(route).toBeDefined();
      expect(route.methods.post).toBe(true);
    });

    it('should apply requireAdminSecret middleware', () => {
      const route = findRoute('/token', 'post');
      // requireAdminSecret + validate + handler
      expect(route.stack).toHaveLength(3);
    });

    it('should call controller.generateToken', () => {
      const route = findRoute('/token', 'post');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.generateToken).toHaveBeenCalledWith(req, res, next);
    });
  });
});
