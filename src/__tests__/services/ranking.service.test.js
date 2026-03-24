const { faker } = require('@faker-js/faker');
const { RankingService } = require('../../services/ranking.service');
const { AppError } = require('../../utils/AppError');

describe('RankingService', () => {
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
    students: [
      { submissions: [{ points: 10 }, { points: 20 }] },
      { submissions: [{ points: 5 }] },
    ],
    ...overrides,
  });

  class RankingRepositoryStub {
    async findStudentsWithPoints() {
      return [
        makeStudentRecord({ submissions: [{ points: 10 }, { points: 5 }] }),
        makeStudentRecord({ submissions: [{ points: 30 }] }),
        makeStudentRecord({ submissions: [] }),
      ];
    }

    async findTurmasWithPoints() {
      return [
        makeTurmaRecord({
          students: [
            { submissions: [{ points: 10 }] },
            { submissions: [{ points: 5 }] },
          ],
        }),
        makeTurmaRecord({
          students: [{ submissions: [{ points: 30 }] }],
        }),
      ];
    }

    async findTurmaById() {
      return { id: faker.string.uuid(), name: 'Turma A' };
    }
  }

  const makeSut = () => {
    const rankingRepository = new RankingRepositoryStub();
    const sut = new RankingService(rankingRepository);
    return { sut, rankingRepository };
  };

  describe('getStudentRanking', () => {
    it('should return students sorted by totalPoints descending', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getStudentRanking();

      // assert
      expect(result[0].totalPoints).toBeGreaterThanOrEqual(
        result[1].totalPoints,
      );
      expect(result[1].totalPoints).toBeGreaterThanOrEqual(
        result[2].totalPoints,
      );
    });

    it('should assign sequential rank numbers starting at 1', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getStudentRanking();

      // assert
      result.forEach((entry, i) => {
        expect(entry.rank).toBe(i + 1);
      });
    });

    it('should include rank, id, name, turma and totalPoints in each entry', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getStudentRanking();

      // assert
      expect(result[0]).toEqual(
        expect.objectContaining({
          rank: expect.any(Number),
          id: expect.any(String),
          name: expect.any(String),
          totalPoints: expect.any(Number),
        }),
      );
    });

    it('should return ranking when turmaId is provided and turma exists', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getStudentRanking(faker.string.uuid());

      // assert
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw AppError 404 when turmaId is provided but turma is not found', async () => {
      // arrange
      const { sut, rankingRepository } = makeSut();
      jest
        .spyOn(rankingRepository, 'findTurmaById')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.getStudentRanking(faker.string.uuid())).rejects.toThrow(
        new AppError(404, 'Turma not found'),
      );
    });

    it('should pass since=null to repository when no period', async () => {
      // arrange
      const { sut, rankingRepository } = makeSut();
      const spy = jest.spyOn(rankingRepository, 'findStudentsWithPoints');

      // act
      await sut.getStudentRanking(null, null);

      // assert
      expect(spy).toHaveBeenCalledWith(null, null);
    });

    it('should pass a Date to repository when period is week', async () => {
      // arrange
      const { sut, rankingRepository } = makeSut();
      const spy = jest.spyOn(rankingRepository, 'findStudentsWithPoints');
      const before = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 - 1000);

      // act
      await sut.getStudentRanking(null, 'week');
      const after = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1000);

      // assert
      const since = spy.mock.calls[0][1];
      expect(since).toBeInstanceOf(Date);
      expect(since.getTime()).toBeGreaterThan(before.getTime());
      expect(since.getTime()).toBeLessThan(after.getTime());
    });

    it('should pass a Date to repository when period is month', async () => {
      // arrange
      const { sut, rankingRepository } = makeSut();
      const spy = jest.spyOn(rankingRepository, 'findStudentsWithPoints');
      const before = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 - 1000);

      // act
      await sut.getStudentRanking(null, 'month');
      const after = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 1000);

      // assert
      const since = spy.mock.calls[0][1];
      expect(since).toBeInstanceOf(Date);
      expect(since.getTime()).toBeGreaterThan(before.getTime());
      expect(since.getTime()).toBeLessThan(after.getTime());
    });

    it('should throw AppError 400 when period is invalid', async () => {
      // arrange
      const { sut } = makeSut();

      // act / assert
      await expect(sut.getStudentRanking(null, 'year')).rejects.toThrow(
        new AppError(400, 'Period must be week or month'),
      );
    });

    it('should set turma to null when student has no turma', async () => {
      // arrange
      const { sut, rankingRepository } = makeSut();
      jest
        .spyOn(rankingRepository, 'findStudentsWithPoints')
        .mockResolvedValueOnce([
          makeStudentRecord({ turma: null, submissions: [] }),
        ]);

      // act
      const result = await sut.getStudentRanking();

      // assert
      expect(result[0].turma).toBeNull();
    });

    it('should handle students with no submissions (0 points)', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getStudentRanking();

      // assert
      const last = result[result.length - 1];
      expect(last.totalPoints).toBe(0);
    });
  });

  describe('getTurmaRanking', () => {
    it('should return turmas sorted by totalPoints descending', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getTurmaRanking();

      // assert
      expect(result[0].totalPoints).toBeGreaterThanOrEqual(
        result[1].totalPoints,
      );
    });

    it('should assign sequential rank numbers starting at 1', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getTurmaRanking();

      // assert
      result.forEach((entry, i) => {
        expect(entry.rank).toBe(i + 1);
      });
    });

    it('should include rank, id, name, teacher, studentCount and totalPoints', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getTurmaRanking();

      // assert
      expect(result[0]).toEqual(
        expect.objectContaining({
          rank: expect.any(Number),
          id: expect.any(String),
          name: expect.any(String),
          teacher: expect.objectContaining({ id: expect.any(String) }),
          studentCount: expect.any(Number),
          totalPoints: expect.any(Number),
        }),
      );
    });

    it('should aggregate all student submission points per turma', async () => {
      // arrange
      const { sut, rankingRepository } = makeSut();
      jest
        .spyOn(rankingRepository, 'findTurmasWithPoints')
        .mockResolvedValueOnce([
          makeTurmaRecord({
            students: [{ submissions: [{ points: 10 }, { points: 20 }] }],
          }),
        ]);

      // act
      const result = await sut.getTurmaRanking();

      // assert
      expect(result[0].totalPoints).toBe(30);
    });

    it('should pass since=null to repository when no period', async () => {
      // arrange
      const { sut, rankingRepository } = makeSut();
      const spy = jest.spyOn(rankingRepository, 'findTurmasWithPoints');

      // act
      await sut.getTurmaRanking(null);

      // assert
      expect(spy).toHaveBeenCalledWith(null);
    });

    it('should pass a Date to repository when period is week', async () => {
      // arrange
      const { sut, rankingRepository } = makeSut();
      const spy = jest.spyOn(rankingRepository, 'findTurmasWithPoints');

      // act
      await sut.getTurmaRanking('week');

      // assert
      const since = spy.mock.calls[0][0];
      expect(since).toBeInstanceOf(Date);
    });

    it('should pass a Date to repository when period is month', async () => {
      // arrange
      const { sut, rankingRepository } = makeSut();
      const spy = jest.spyOn(rankingRepository, 'findTurmasWithPoints');

      // act
      await sut.getTurmaRanking('month');

      // assert
      const since = spy.mock.calls[0][0];
      expect(since).toBeInstanceOf(Date);
    });

    it('should throw AppError 400 when period is invalid', async () => {
      // arrange
      const { sut } = makeSut();

      // act / assert
      await expect(sut.getTurmaRanking('year')).rejects.toThrow(
        new AppError(400, 'Period must be week or month'),
      );
    });
  });
});
