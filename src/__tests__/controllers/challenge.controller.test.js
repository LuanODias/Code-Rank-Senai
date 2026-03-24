const { faker } = require('@faker-js/faker');
const {
  ChallengeController,
} = require('../../controllers/challenge.controller');

describe('ChallengeController', () => {
  const makeChallenge = () => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    difficulty: 'medium',
    teacher: { id: faker.string.uuid(), name: faker.person.fullName() },
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  class ChallengeServiceStub {
    async create() {
      return makeChallenge();
    }

    async getAll() {
      return [makeChallenge(), makeChallenge()];
    }

    async getById() {
      return makeChallenge();
    }

    async update() {
      return makeChallenge();
    }

    async remove() {}
  }

  const makeSut = () => {
    const challengeService = new ChallengeServiceStub();
    const sut = new ChallengeController(challengeService);
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();
    return { challengeService, sut, res, next };
  };

  describe('create', () => {
    const httpRequest = {
      user: { id: faker.string.uuid(), role: 'teacher' },
      body: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
      },
    };

    it('should return 201 with the created challenge', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.any(String) }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call challengeService.create with user id and body', async () => {
      // arrange
      const { sut, challengeService, res, next } = makeSut();
      const createSpy = jest.spyOn(challengeService, 'create');

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(createSpy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.body,
      );
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should call next with error if challengeService.create throws', async () => {
      // arrange
      const { sut, challengeService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(challengeService, 'create').mockRejectedValueOnce(error);

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return a list of challenges', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.getAll({}, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Object)]),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if challengeService.getAll throws', async () => {
      // arrange
      const { sut, challengeService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(challengeService, 'getAll').mockRejectedValueOnce(error);

      // act
      await sut.getAll({}, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    const httpRequest = { params: { id: faker.string.uuid() } };

    it('should return the challenge when found', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.getById(httpRequest, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.any(String) }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call challengeService.getById with correct id', async () => {
      // arrange
      const { sut, challengeService, res, next } = makeSut();
      const getByIdSpy = jest.spyOn(challengeService, 'getById');

      // act
      await sut.getById(httpRequest, res, next);

      // assert
      expect(getByIdSpy).toHaveBeenCalledWith(httpRequest.params.id);
    });

    it('should call next with error if challengeService.getById throws', async () => {
      // arrange
      const { sut, challengeService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(challengeService, 'getById').mockRejectedValueOnce(error);

      // act
      await sut.getById(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    const httpRequest = {
      user: { id: faker.string.uuid(), role: 'teacher' },
      params: { id: faker.string.uuid() },
      body: { title: faker.lorem.sentence() },
    };

    it('should return the updated challenge', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.update(httpRequest, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.any(String) }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call challengeService.update with user id, role, challenge id and body', async () => {
      // arrange
      const { sut, challengeService, res, next } = makeSut();
      const updateSpy = jest.spyOn(challengeService, 'update');

      // act
      await sut.update(httpRequest, res, next);

      // assert
      expect(updateSpy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.user.role,
        httpRequest.params.id,
        httpRequest.body,
      );
    });

    it('should call next with error if challengeService.update throws', async () => {
      // arrange
      const { sut, challengeService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(challengeService, 'update').mockRejectedValueOnce(error);

      // act
      await sut.update(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('remove', () => {
    const httpRequest = {
      user: { id: faker.string.uuid(), role: 'teacher' },
      params: { id: faker.string.uuid() },
    };

    it('should return 204 on successful removal', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call challengeService.remove with user id, role and challenge id', async () => {
      // arrange
      const { sut, challengeService, res, next } = makeSut();
      const removeSpy = jest.spyOn(challengeService, 'remove');

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(removeSpy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.user.role,
        httpRequest.params.id,
      );
    });

    it('should call next with error if challengeService.remove throws', async () => {
      // arrange
      const { sut, challengeService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(challengeService, 'remove').mockRejectedValueOnce(error);

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
