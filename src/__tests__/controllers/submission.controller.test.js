const { faker } = require('@faker-js/faker');
const {
  SubmissionController,
} = require('../../controllers/submission.controller');

describe('SubmissionController', () => {
  const makeSubmission = () => ({
    id: faker.string.uuid(),
    student: { id: faker.string.uuid(), name: faker.person.fullName() },
    challenge: {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      difficulty: 'easy',
    },
    code: 'console.log("hello")',
    language: 'javascript',
    status: 'pending',
    points: 0,
    feedback: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  class SubmissionServiceStub {
    async submit() {
      return makeSubmission();
    }

    async getAll() {
      return [makeSubmission(), makeSubmission()];
    }

    async getById() {
      return makeSubmission();
    }

    async evaluate() {
      return { ...makeSubmission(), status: 'accepted', points: 10 };
    }
  }

  const makeSut = () => {
    const submissionService = new SubmissionServiceStub();
    const sut = new SubmissionController(submissionService);
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();
    return { submissionService, sut, res, next };
  };

  describe('submit', () => {
    const httpRequest = {
      user: { id: faker.string.uuid() },
      body: {
        challengeId: faker.string.uuid(),
        code: 'console.log("hi")',
        language: 'javascript',
      },
    };

    it('should return 201 with submission', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.submit(httpRequest, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.any(String) }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call submissionService.submit with user id and body', async () => {
      // arrange
      const { sut, submissionService, res, next } = makeSut();
      const submitSpy = jest.spyOn(submissionService, 'submit');

      // act
      await sut.submit(httpRequest, res, next);

      // assert
      expect(submitSpy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.body,
      );
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, submissionService, res, next } = makeSut();
      const error = new Error('service error');
      jest.spyOn(submissionService, 'submit').mockRejectedValueOnce(error);

      // act
      await sut.submit(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAll', () => {
    const httpRequest = { user: { id: faker.string.uuid(), role: 'teacher' } };

    it('should return 200 with list of submissions', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.getAll(httpRequest, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: expect.any(String) }),
        ]),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call submissionService.getAll with user id and role', async () => {
      // arrange
      const { sut, submissionService, res, next } = makeSut();
      const getAllSpy = jest.spyOn(submissionService, 'getAll');

      // act
      await sut.getAll(httpRequest, res, next);

      // assert
      expect(getAllSpy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.user.role,
      );
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, submissionService, res, next } = makeSut();
      const error = new Error('service error');
      jest.spyOn(submissionService, 'getAll').mockRejectedValueOnce(error);

      // act
      await sut.getAll(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    const httpRequest = {
      user: { id: faker.string.uuid(), role: 'teacher' },
      params: { id: faker.string.uuid() },
    };

    it('should return 200 with submission', async () => {
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

    it('should call submissionService.getById with user id, role and params.id', async () => {
      // arrange
      const { sut, submissionService, res, next } = makeSut();
      const getByIdSpy = jest.spyOn(submissionService, 'getById');

      // act
      await sut.getById(httpRequest, res, next);

      // assert
      expect(getByIdSpy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.user.role,
        httpRequest.params.id,
      );
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, submissionService, res, next } = makeSut();
      const error = new Error('service error');
      jest.spyOn(submissionService, 'getById').mockRejectedValueOnce(error);

      // act
      await sut.getById(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('evaluate', () => {
    const httpRequest = {
      params: { id: faker.string.uuid() },
      body: { status: 'accepted' },
    };

    it('should return 200 with evaluated submission', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.evaluate(httpRequest, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.any(String), status: 'accepted' }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call submissionService.evaluate with params.id and body', async () => {
      // arrange
      const { sut, submissionService, res, next } = makeSut();
      const evaluateSpy = jest.spyOn(submissionService, 'evaluate');

      // act
      await sut.evaluate(httpRequest, res, next);

      // assert
      expect(evaluateSpy).toHaveBeenCalledWith(
        httpRequest.params.id,
        httpRequest.body,
      );
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, submissionService, res, next } = makeSut();
      const error = new Error('service error');
      jest.spyOn(submissionService, 'evaluate').mockRejectedValueOnce(error);

      // act
      await sut.evaluate(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
