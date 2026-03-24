const { faker } = require('@faker-js/faker');
const { RankingRepository } = require('../../repositories/ranking.repository');

describe('RankingRepository', () => {
  const makeStudentRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    user: { name: faker.person.fullName() },
    turma: { id: faker.string.uuid(), name: 'Turma A' },
    submissions: [{ points: 10 }, { points: 20 }],
    ...overrides,
  });

  const makeTurmaRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    name: 'Turma A',
    teacher: {
      id: faker.string.uuid(),
      user: { name: faker.person.fullName() },
    },
    students: [makeStudentRecord()],
    ...overrides,
  });

  const makePrisma = () => ({
    student: { findMany: jest.fn() },
    turma: { findMany: jest.fn(), findUnique: jest.fn() },
  });

  const makeSut = () => {
    const prisma = makePrisma();
    const sut = new RankingRepository(prisma);
    return { sut, prisma };
  };

  describe('findStudentsWithPoints', () => {
    it('should call prisma.student.findMany without filter when no turmaId or since', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const students = [makeStudentRecord()];
      prisma.student.findMany.mockResolvedValueOnce(students);

      // act
      const result = await sut.findStudentsWithPoints();

      // assert
      expect(prisma.student.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: { select: { name: true } },
          turma: { select: { id: true, name: true } },
          submissions: { where: {}, select: { points: true } },
        },
      });
      expect(result).toEqual(students);
    });

    it('should filter by turmaId when provided', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const turmaId = faker.string.uuid();
      prisma.student.findMany.mockResolvedValueOnce([]);

      // act
      await sut.findStudentsWithPoints(turmaId);

      // assert
      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { turmaId } }),
      );
    });

    it('should filter submissions by createdAt when since is provided', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const since = new Date('2026-03-01');
      prisma.student.findMany.mockResolvedValueOnce([]);

      // act
      await sut.findStudentsWithPoints(null, since);

      // assert
      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            submissions: {
              where: { createdAt: { gte: since } },
              select: { points: true },
            },
          }),
        }),
      );
    });

    it('should apply both turmaId and since when provided', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const turmaId = faker.string.uuid();
      const since = new Date('2026-03-01');
      prisma.student.findMany.mockResolvedValueOnce([]);

      // act
      await sut.findStudentsWithPoints(turmaId, since);

      // assert
      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { turmaId },
          include: expect.objectContaining({
            submissions: {
              where: { createdAt: { gte: since } },
              select: { points: true },
            },
          }),
        }),
      );
    });
  });

  describe('findTurmasWithPoints', () => {
    it('should call prisma.turma.findMany with nested includes and no filter', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const turmas = [makeTurmaRecord()];
      prisma.turma.findMany.mockResolvedValueOnce(turmas);

      // act
      const result = await sut.findTurmasWithPoints();

      // assert
      expect(prisma.turma.findMany).toHaveBeenCalledWith({
        include: {
          teacher: { include: { user: { select: { name: true } } } },
          students: {
            include: {
              submissions: { where: {}, select: { points: true } },
            },
          },
        },
      });
      expect(result).toEqual(turmas);
    });

    it('should filter submissions by createdAt when since is provided', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const since = new Date('2026-03-01');
      prisma.turma.findMany.mockResolvedValueOnce([]);

      // act
      await sut.findTurmasWithPoints(since);

      // assert
      expect(prisma.turma.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            students: {
              include: {
                submissions: {
                  where: { createdAt: { gte: since } },
                  select: { points: true },
                },
              },
            },
          }),
        }),
      );
    });
  });

  describe('findTurmaById', () => {
    it('should call prisma.turma.findUnique with id', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      const id = faker.string.uuid();
      const turma = { id, name: 'Turma A' };
      prisma.turma.findUnique.mockResolvedValueOnce(turma);

      // act
      const result = await sut.findTurmaById(id);

      // assert
      expect(prisma.turma.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(turma);
    });

    it('should return null when turma is not found', async () => {
      // arrange
      const { sut, prisma } = makeSut();
      prisma.turma.findUnique.mockResolvedValueOnce(null);

      // act
      const result = await sut.findTurmaById(faker.string.uuid());

      // assert
      expect(result).toBeNull();
    });
  });
});
