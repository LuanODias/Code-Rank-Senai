const { faker } = require('@faker-js/faker');
const { RankingController } = require('../../controllers/ranking.controller');

describe('RankingController', () => {
  const makeStudentEntry = () => ({
    rank: 1,
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    turma: { id: faker.string.uuid(), name: 'Turma A' },
    totalPoints: faker.number.int({ min: 0, max: 100 }),
  });

  const makeTurmaEntry = () => ({
    rank: 1,
    id: faker.string.uuid(),
    name: 'Turma A',
    teacher: { id: faker.string.uuid(), name: faker.person.fullName() },
    studentCount: 5,
    totalPoints: faker.number.int({ min: 0, max: 500 }),
  });

  class RankingServiceStub {
    async getStudentRanking() {
      return [makeStudentEntry(), makeStudentEntry()];
    }

    async getTurmaRanking() {
      return [makeTurmaEntry(), makeTurmaEntry()];
    }
  }

  const makeSut = () => {
    const rankingService = new RankingServiceStub();
    const sut = new RankingController(rankingService);
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    return { rankingService, sut, res, next };
  };

  describe('getStudents', () => {
    it('should return 200 with student ranking', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.getStudents({ query: {} }, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ rank: expect.any(Number) }),
        ]),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call getStudentRanking with null, null when no query params', async () => {
      // arrange
      const { sut, rankingService, res, next } = makeSut();
      const spy = jest.spyOn(rankingService, 'getStudentRanking');

      // act
      await sut.getStudents({ query: {} }, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(null, null);
    });

    it('should pass turmaId when provided', async () => {
      // arrange
      const { sut, rankingService, res, next } = makeSut();
      const turmaId = faker.string.uuid();
      const spy = jest.spyOn(rankingService, 'getStudentRanking');

      // act
      await sut.getStudents({ query: { turmaId } }, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(turmaId, null);
    });

    it('should pass period=week when provided', async () => {
      // arrange
      const { sut, rankingService, res, next } = makeSut();
      const spy = jest.spyOn(rankingService, 'getStudentRanking');

      // act
      await sut.getStudents({ query: { period: 'week' } }, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(null, 'week');
    });

    it('should pass period=month when provided', async () => {
      // arrange
      const { sut, rankingService, res, next } = makeSut();
      const spy = jest.spyOn(rankingService, 'getStudentRanking');

      // act
      await sut.getStudents({ query: { period: 'month' } }, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(null, 'month');
    });

    it('should pass both turmaId and period when provided', async () => {
      // arrange
      const { sut, rankingService, res, next } = makeSut();
      const turmaId = faker.string.uuid();
      const spy = jest.spyOn(rankingService, 'getStudentRanking');

      // act
      await sut.getStudents({ query: { turmaId, period: 'week' } }, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(turmaId, 'week');
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, rankingService, res, next } = makeSut();
      jest
        .spyOn(rankingService, 'getStudentRanking')
        .mockRejectedValueOnce(new Error('error'));

      // act
      await sut.getStudents({ query: {} }, res, next);

      // assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getTurmas', () => {
    it('should return 200 with turma ranking', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.getTurmas({ query: {} }, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ rank: expect.any(Number) }),
        ]),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call getTurmaRanking with null when no period', async () => {
      // arrange
      const { sut, rankingService, res, next } = makeSut();
      const spy = jest.spyOn(rankingService, 'getTurmaRanking');

      // act
      await sut.getTurmas({ query: {} }, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(null);
    });

    it('should pass period=week when provided', async () => {
      // arrange
      const { sut, rankingService, res, next } = makeSut();
      const spy = jest.spyOn(rankingService, 'getTurmaRanking');

      // act
      await sut.getTurmas({ query: { period: 'week' } }, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith('week');
    });

    it('should pass period=month when provided', async () => {
      // arrange
      const { sut, rankingService, res, next } = makeSut();
      const spy = jest.spyOn(rankingService, 'getTurmaRanking');

      // act
      await sut.getTurmas({ query: { period: 'month' } }, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith('month');
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, rankingService, res, next } = makeSut();
      jest
        .spyOn(rankingService, 'getTurmaRanking')
        .mockRejectedValueOnce(new Error('error'));

      // act
      await sut.getTurmas({ query: {} }, res, next);

      // assert
      expect(next).toHaveBeenCalled();
    });
  });
});
