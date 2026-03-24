jest.mock('better-auth/node', () => ({
  fromNodeHeaders: jest.fn((h) => h),
}));

jest.mock('../../config/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

const mockController = {
  getStudents: jest.fn(),
  getTurmas: jest.fn(),
};

jest.mock('../../factories/ranking.factory', () => ({
  makeRankingController: jest.fn(() => mockController),
}));

const mockRequireAuth = jest.fn((req, res, next) => next());
jest.mock('../../middlewares/requireAuth', () => ({
  requireAuth: jest.fn(() => mockRequireAuth),
}));

const router = require('../../routes/ranking.routes');

const findRoute = (path, method) =>
  router.stack
    .filter((l) => l.route?.path === path)
    .find((l) => l.route.methods[method])?.route;

describe('ranking.routes', () => {
  describe('router-level middleware', () => {
    it('should apply requireAuth to all routes via router.use', () => {
      const layer = router.stack.find(
        (l) => !l.route && l.handle === mockRequireAuth,
      );
      expect(layer).toBeDefined();
    });
  });

  describe('GET /students', () => {
    it('should register the route', () => {
      const route = findRoute('/students', 'get');
      expect(route).toBeDefined();
    });

    it('should call controller.getStudents', () => {
      const route = findRoute('/students', 'get');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();
      handler(req, res, next);
      expect(mockController.getStudents).toHaveBeenCalledWith(req, res, next);
    });
  });

  describe('GET /turmas', () => {
    it('should register the route', () => {
      const route = findRoute('/turmas', 'get');
      expect(route).toBeDefined();
    });

    it('should call controller.getTurmas', () => {
      const route = findRoute('/turmas', 'get');
      const handler = route.stack[route.stack.length - 1].handle;
      const req = {};
      const res = {};
      const next = jest.fn();
      handler(req, res, next);
      expect(mockController.getTurmas).toHaveBeenCalledWith(req, res, next);
    });
  });
});
