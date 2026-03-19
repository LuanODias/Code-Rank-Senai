jest.mock('better-auth/node', () => ({
  fromNodeHeaders: jest.fn((h) => h),
}));

jest.mock('../../config/env', () => ({
  env: { ADMIN_SECRET: 'test-secret' },
}));

jest.mock('../../config/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

const mockController = {
  login: jest.fn(),
  logout: jest.fn(),
  changePassword: jest.fn(),
};

jest.mock('../../factories/auth.factory', () => ({
  makeAuthController: jest.fn(() => mockController),
}));

const mockRequireAuth = jest.fn((req, res, next) => next());
jest.mock('../../middlewares/requireAuth', () => ({
  requireAuth: jest.fn(() => mockRequireAuth),
}));

const router = require('../../routes/auth.routes');

const findRoute = (path) =>
  router.stack.find((l) => l.route?.path === path)?.route;

describe('auth.routes', () => {
  describe('POST /login', () => {
    it('should register the route', () => {
      const route = findRoute('/login');
      expect(route).toBeDefined();
      expect(route.methods.post).toBe(true);
    });

    it('should not apply requireAuth middleware', () => {
      const route = findRoute('/login');
      // only the handler, no middleware
      expect(route.stack).toHaveLength(1);
    });

    it('should call controller.login', () => {
      const route = findRoute('/login');
      const handler = route.stack[0].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.login).toHaveBeenCalledWith(req, res, next);
    });
  });

  describe('POST /logout', () => {
    it('should register the route', () => {
      const route = findRoute('/logout');
      expect(route).toBeDefined();
      expect(route.methods.post).toBe(true);
    });

    it('should apply requireAuth middleware', () => {
      const route = findRoute('/logout');
      // middleware + handler
      expect(route.stack).toHaveLength(2);
      expect(route.stack[0].handle).toBe(mockRequireAuth);
    });

    it('should call controller.logout', () => {
      const route = findRoute('/logout');
      const handler = route.stack[1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.logout).toHaveBeenCalledWith(req, res, next);
    });
  });

  describe('POST /change-password', () => {
    it('should register the route', () => {
      const route = findRoute('/change-password');
      expect(route).toBeDefined();
      expect(route.methods.post).toBe(true);
    });

    it('should apply requireAuth middleware', () => {
      const route = findRoute('/change-password');
      expect(route.stack).toHaveLength(2);
      expect(route.stack[0].handle).toBe(mockRequireAuth);
    });

    it('should call controller.changePassword', () => {
      const route = findRoute('/change-password');
      const handler = route.stack[1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();

      handler(req, res, next);

      expect(mockController.changePassword).toHaveBeenCalledWith(
        req,
        res,
        next,
      );
    });
  });
});
