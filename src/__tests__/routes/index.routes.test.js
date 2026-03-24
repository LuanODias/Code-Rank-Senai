const mockAuthRouter = jest.fn();
const mockAdminRouter = jest.fn();
const mockTeacherRouter = jest.fn();
const mockChallengeRouter = jest.fn();
const mockStudentRouter = jest.fn();
const mockSubmissionRouter = jest.fn();
const mockTurmaRouter = jest.fn();
const mockRankingRouter = jest.fn();

jest.mock('../../routes/auth.routes', () => mockAuthRouter);
jest.mock('../../routes/admin.routes', () => mockAdminRouter);
jest.mock('../../routes/teacher.routes', () => mockTeacherRouter);
jest.mock('../../routes/challenge.routes', () => mockChallengeRouter);
jest.mock('../../routes/student.routes', () => mockStudentRouter);
jest.mock('../../routes/submission.routes', () => mockSubmissionRouter);
jest.mock('../../routes/turma.routes', () => mockTurmaRouter);
jest.mock('../../routes/ranking.routes', () => mockRankingRouter);

const router = require('../../routes/index');

describe('index.routes', () => {
  describe('GET /health', () => {
    it('should register the route', () => {
      const route = router.stack.find(
        (l) => l.route?.path === '/health',
      )?.route;
      expect(route).toBeDefined();
      expect(route.methods.get).toBe(true);
    });

    it('should return { status: "ok" }', () => {
      const route = router.stack.find(
        (l) => l.route?.path === '/health',
      )?.route;
      const handler = route.stack[0].handle;
      const res = { json: jest.fn() };

      handler({}, res);

      expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
    });
  });

  describe('sub-routers', () => {
    it('should mount auth routes at /', () => {
      const layer = router.stack.find((l) => l.handle === mockAuthRouter);
      expect(layer).toBeDefined();
    });

    it('should mount admin routes at /admin', () => {
      const layer = router.stack.find((l) => l.handle === mockAdminRouter);
      expect(layer).toBeDefined();
    });

    it('should mount teacher routes at /teachers', () => {
      const layer = router.stack.find((l) => l.handle === mockTeacherRouter);
      expect(layer).toBeDefined();
    });

    it('should mount challenge routes at /challenges', () => {
      const layer = router.stack.find((l) => l.handle === mockChallengeRouter);
      expect(layer).toBeDefined();
    });

    it('should mount student routes at /students', () => {
      const layer = router.stack.find((l) => l.handle === mockStudentRouter);
      expect(layer).toBeDefined();
    });

    it('should mount submission routes at /submissions', () => {
      const layer = router.stack.find((l) => l.handle === mockSubmissionRouter);
      expect(layer).toBeDefined();
    });

    it('should mount turma routes at /turmas', () => {
      const layer = router.stack.find((l) => l.handle === mockTurmaRouter);
      expect(layer).toBeDefined();
    });

    it('should mount ranking routes at /rankings', () => {
      const layer = router.stack.find((l) => l.handle === mockRankingRouter);
      expect(layer).toBeDefined();
    });
  });
});
