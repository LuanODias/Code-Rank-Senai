const { faker } = require('@faker-js/faker');
const { SubmissionService } = require('../../services/submission.service');
const { AppError } = require('../../utils/AppError');

describe('SubmissionService', () => {
  const makeStudentRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    user: { name: faker.person.fullName() },
    ...overrides,
  });

  const makeChallengeRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    difficulty: 'easy',
    ...overrides,
  });

  const makeSubmissionRecord = (overrides = {}) => {
    const student = makeStudentRecord();
    const challenge = makeChallengeRecord();
    return {
      id: faker.string.uuid(),
      studentId: student.id,
      challengeId: challenge.id,
      code: 'console.log("hello")',
      language: 'javascript',
      status: 'pending',
      points: 0,
      feedback: null,
      student,
      challenge,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  class SubmissionRepositoryStub {
    constructor() {
      this._student = makeStudentRecord();
      this._challenge = makeChallengeRecord();
      this._submission = makeSubmissionRecord({
        studentId: this._student.id,
        challengeId: this._challenge.id,
        student: this._student,
        challenge: this._challenge,
      });
    }

    async findStudentByUserId() {
      return this._student;
    }

    async findChallengeById() {
      return this._challenge;
    }

    async findById() {
      return this._submission;
    }

    async findAll() {
      return [this._submission];
    }

    async findByStudentId() {
      return [this._submission];
    }

    async create(data) {
      return { ...this._submission, ...data };
    }

    async update(id, data) {
      return { ...this._submission, ...data };
    }
  }

  const makeSut = () => {
    const submissionRepository = new SubmissionRepositoryStub();
    const sut = new SubmissionService(submissionRepository);
    return { sut, submissionRepository };
  };

  describe('submit', () => {
    const makeData = () => ({
      challengeId: faker.string.uuid(),
      code: 'console.log("hello")',
      language: 'javascript',
    });

    it('should throw AppError 403 when user has no student record', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      jest
        .spyOn(submissionRepository, 'findStudentByUserId')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.submit(faker.string.uuid(), makeData())).rejects.toThrow(
        new AppError(403, 'Only students can submit code'),
      );
    });

    it('should throw AppError 404 when challenge is not found', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      jest
        .spyOn(submissionRepository, 'findChallengeById')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.submit(faker.string.uuid(), makeData())).rejects.toThrow(
        new AppError(404, 'Challenge not found'),
      );
    });

    it('should return a DTO on successful submission', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.submit(faker.string.uuid(), makeData());

      // assert
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          code: expect.any(String),
          status: expect.any(String),
        }),
      );
    });
  });

  describe('getAll', () => {
    it('should return only own submissions when role is student', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const findByStudentIdSpy = jest.spyOn(
        submissionRepository,
        'findByStudentId',
      );

      // act
      const result = await sut.getAll(faker.string.uuid(), 'student');

      // assert
      expect(findByStudentIdSpy).toHaveBeenCalledTimes(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when student record is not found', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      jest
        .spyOn(submissionRepository, 'findStudentByUserId')
        .mockResolvedValueOnce(null);

      // act
      const result = await sut.getAll(faker.string.uuid(), 'student');

      // assert
      expect(result).toEqual([]);
    });

    it('should return all submissions when role is teacher', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const findAllSpy = jest.spyOn(submissionRepository, 'findAll');

      // act
      await sut.getAll(faker.string.uuid(), 'teacher');

      // assert
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });

    it('should return all submissions when role is admin', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const findAllSpy = jest.spyOn(submissionRepository, 'findAll');

      // act
      await sut.getAll(faker.string.uuid(), 'admin');

      // assert
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should throw AppError 404 when submission is not found', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      jest.spyOn(submissionRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.getById(faker.string.uuid(), 'teacher', faker.string.uuid()),
      ).rejects.toThrow(new AppError(404, 'Submission not found'));
    });

    it('should throw AppError 403 when student tries to view another student submission', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const otherStudent = makeStudentRecord();
      jest
        .spyOn(submissionRepository, 'findStudentByUserId')
        .mockResolvedValueOnce(otherStudent);

      // act / assert
      await expect(
        sut.getById(faker.string.uuid(), 'student', faker.string.uuid()),
      ).rejects.toThrow(
        new AppError(403, 'You can only view your own submissions'),
      );
    });

    it('should return DTO when student views own submission', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const { _student, _submission } = submissionRepository;
      jest
        .spyOn(submissionRepository, 'findStudentByUserId')
        .mockResolvedValueOnce(_student);
      jest
        .spyOn(submissionRepository, 'findById')
        .mockResolvedValueOnce({ ..._submission, studentId: _student.id });

      // act
      const result = await sut.getById(
        faker.string.uuid(),
        'student',
        _submission.id,
      );

      // assert
      expect(result).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      );
    });

    it('should return DTO without ownership check for teacher', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getById(
        faker.string.uuid(),
        'teacher',
        faker.string.uuid(),
      );

      // assert
      expect(result).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      );
    });
  });

  describe('evaluate', () => {
    it('should throw AppError 404 when submission is not found', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      jest.spyOn(submissionRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.evaluate(faker.string.uuid(), { status: 'accepted' }),
      ).rejects.toThrow(new AppError(404, 'Submission not found'));
    });

    it('should assign difficulty points when status is accepted and no custom points', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const challenge = makeChallengeRecord({ difficulty: 'medium' });
      const submission = makeSubmissionRecord({ challenge });
      jest
        .spyOn(submissionRepository, 'findById')
        .mockResolvedValueOnce(submission);
      const updateSpy = jest.spyOn(submissionRepository, 'update');

      // act
      await sut.evaluate(submission.id, { status: 'accepted' });

      // assert
      expect(updateSpy).toHaveBeenCalledWith(
        submission.id,
        expect.objectContaining({ status: 'accepted', points: 20 }),
      );
    });

    it('should assign easy difficulty points (10) when difficulty is easy', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const challenge = makeChallengeRecord({ difficulty: 'easy' });
      const submission = makeSubmissionRecord({ challenge });
      jest
        .spyOn(submissionRepository, 'findById')
        .mockResolvedValueOnce(submission);
      const updateSpy = jest.spyOn(submissionRepository, 'update');

      // act
      await sut.evaluate(submission.id, { status: 'accepted' });

      // assert
      expect(updateSpy).toHaveBeenCalledWith(
        submission.id,
        expect.objectContaining({ points: 10 }),
      );
    });

    it('should assign hard difficulty points (30) when difficulty is hard', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const challenge = makeChallengeRecord({ difficulty: 'hard' });
      const submission = makeSubmissionRecord({ challenge });
      jest
        .spyOn(submissionRepository, 'findById')
        .mockResolvedValueOnce(submission);
      const updateSpy = jest.spyOn(submissionRepository, 'update');

      // act
      await sut.evaluate(submission.id, { status: 'accepted' });

      // assert
      expect(updateSpy).toHaveBeenCalledWith(
        submission.id,
        expect.objectContaining({ points: 30 }),
      );
    });

    it('should use custom points when provided', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const updateSpy = jest.spyOn(submissionRepository, 'update');

      // act
      await sut.evaluate(faker.string.uuid(), {
        status: 'accepted',
        points: 50,
      });

      // assert
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ points: 50 }),
      );
    });

    it('should assign 0 points when status is rejected', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const updateSpy = jest.spyOn(submissionRepository, 'update');

      // act
      await sut.evaluate(faker.string.uuid(), { status: 'rejected' });

      // assert
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ points: 0 }),
      );
    });

    it('should include feedback when provided', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const updateSpy = jest.spyOn(submissionRepository, 'update');

      // act
      await sut.evaluate(faker.string.uuid(), {
        status: 'accepted',
        feedback: 'Great work!',
      });

      // assert
      expect(updateSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ feedback: 'Great work!' }),
      );
    });

    it('should not include feedback key when not provided', async () => {
      // arrange
      const { sut, submissionRepository } = makeSut();
      const updateSpy = jest.spyOn(submissionRepository, 'update');

      // act
      await sut.evaluate(faker.string.uuid(), { status: 'rejected' });

      // assert
      const callData = updateSpy.mock.calls[0][1];
      expect(callData).not.toHaveProperty('feedback');
    });
  });
});
