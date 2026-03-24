const { faker } = require('@faker-js/faker');
const { ChallengeService } = require('../../services/challenge.service');
const { AppError } = require('../../utils/AppError');

describe('ChallengeService', () => {
  const makeTeacher = (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    ...overrides,
  });

  const makeChallengeRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    difficulty: 'medium',
    teacherId: faker.string.uuid(),
    teacher: {
      id: faker.string.uuid(),
      user: { name: faker.person.fullName() },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  class ChallengeRepositoryStub {
    constructor() {
      this._teacher = makeTeacher();
      this._challenge = makeChallengeRecord({ teacherId: this._teacher.id });
    }

    async findTeacherByUserId() {
      return this._teacher;
    }

    async findById() {
      return this._challenge;
    }

    async findAll() {
      return [this._challenge];
    }

    async findByTeacherId() {
      return [this._challenge];
    }

    async create(data) {
      return { ...this._challenge, ...data };
    }

    async update(id, data) {
      return { ...this._challenge, ...data };
    }

    async remove() {}
  }

  const makeSut = () => {
    const challengeRepository = new ChallengeRepositoryStub();
    const sut = new ChallengeService(challengeRepository);
    return { sut, challengeRepository };
  };

  describe('create', () => {
    const makeData = () => ({
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
    });

    it('should throw AppError 403 when user has no teacher record', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      jest
        .spyOn(challengeRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.create(faker.string.uuid(), makeData())).rejects.toThrow(
        new AppError(403, 'Only teachers can create challenges'),
      );
    });

    it('should throw AppError 400 when difficulty is invalid', async () => {
      // arrange
      const { sut } = makeSut();
      const data = { ...makeData(), difficulty: 'impossible' };

      // act / assert
      await expect(sut.create(faker.string.uuid(), data)).rejects.toThrow(
        new AppError(400, 'Difficulty must be one of: easy, medium, hard'),
      );
    });

    it('should default difficulty to medium when not provided', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      const createSpy = jest.spyOn(challengeRepository, 'create');
      const data = makeData();

      // act
      await sut.create(faker.string.uuid(), data);

      // assert
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ difficulty: 'medium' }),
      );
    });

    it('should create challenge linked to the teacher', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      const createSpy = jest.spyOn(challengeRepository, 'create');

      // act
      await sut.create(faker.string.uuid(), makeData());

      // assert
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ teacherId: challengeRepository._teacher.id }),
      );
    });

    it('should return a DTO on success', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.create(faker.string.uuid(), makeData());

      // assert
      expect(result).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
        difficulty: expect.any(String),
        teacher: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('getAll', () => {
    it('should return a list of challenge DTOs', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getAll();

      // assert
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        difficulty: expect.any(String),
      });
    });

    it('should call challengeRepository.findAll', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      const findAllSpy = jest.spyOn(challengeRepository, 'findAll');

      // act
      await sut.getAll();

      // assert
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when there are no challenges', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      jest.spyOn(challengeRepository, 'findAll').mockResolvedValueOnce([]);

      // act
      const result = await sut.getAll();

      // assert
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should throw AppError 404 when challenge is not found', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      jest.spyOn(challengeRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.getById('non-existent-id')).rejects.toThrow(
        new AppError(404, 'Challenge not found'),
      );
    });

    it('should return challenge DTO when found', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getById('some-id');

      // assert
      expect(result).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        difficulty: expect.any(String),
        teacher: expect.objectContaining({ id: expect.any(String) }),
      });
    });
  });

  describe('update', () => {
    it('should throw AppError 404 when challenge is not found', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      jest.spyOn(challengeRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.update(faker.string.uuid(), 'teacher', 'non-existent-id', {}),
      ).rejects.toThrow(new AppError(404, 'Challenge not found'));
    });

    it("should throw AppError 403 when teacher tries to update another teacher's challenge", async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      const otherTeacher = makeTeacher();
      jest
        .spyOn(challengeRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(otherTeacher);

      // act / assert
      await expect(
        sut.update(
          faker.string.uuid(),
          'teacher',
          challengeRepository._challenge.id,
          {},
        ),
      ).rejects.toThrow(
        new AppError(403, 'You can only update your own challenges'),
      );
    });

    it('should throw AppError 403 when teacher record is not found on update', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      jest
        .spyOn(challengeRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.update(
          faker.string.uuid(),
          'teacher',
          challengeRepository._challenge.id,
          {},
        ),
      ).rejects.toThrow(
        new AppError(403, 'You can only update your own challenges'),
      );
    });

    it('should throw AppError 400 when difficulty is invalid', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();

      // act / assert
      await expect(
        sut.update(
          faker.string.uuid(),
          'teacher',
          challengeRepository._challenge.id,
          { difficulty: 'impossible' },
        ),
      ).rejects.toThrow(
        new AppError(400, 'Difficulty must be one of: easy, medium, hard'),
      );
    });

    it('should allow admin to update any challenge without ownership check', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      const findTeacherSpy = jest.spyOn(
        challengeRepository,
        'findTeacherByUserId',
      );

      // act
      await sut.update(
        faker.string.uuid(),
        'admin',
        challengeRepository._challenge.id,
        {},
      );

      // assert
      expect(findTeacherSpy).not.toHaveBeenCalled();
    });

    it('should allow developer to update any challenge without ownership check', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      const findTeacherSpy = jest.spyOn(
        challengeRepository,
        'findTeacherByUserId',
      );

      // act
      await sut.update(
        faker.string.uuid(),
        'developer',
        challengeRepository._challenge.id,
        {},
      );

      // assert
      expect(findTeacherSpy).not.toHaveBeenCalled();
    });

    it('should only pass provided fields to repository.update', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      jest
        .spyOn(challengeRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(challengeRepository._teacher);
      const updateSpy = jest.spyOn(challengeRepository, 'update');
      const title = faker.lorem.sentence();

      // act
      await sut.update(
        faker.string.uuid(),
        'teacher',
        challengeRepository._challenge.id,
        { title },
      );

      // assert
      expect(updateSpy).toHaveBeenCalledWith(
        challengeRepository._challenge.id,
        { title },
      );
    });

    it('should return updated challenge DTO', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();

      // act
      const result = await sut.update(
        faker.string.uuid(),
        'admin',
        challengeRepository._challenge.id,
        { title: 'New Title' },
      );

      // assert
      expect(result).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        difficulty: expect.any(String),
      });
    });
  });

  describe('remove', () => {
    it('should throw AppError 404 when challenge is not found', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      jest.spyOn(challengeRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.remove(faker.string.uuid(), 'teacher', 'non-existent-id'),
      ).rejects.toThrow(new AppError(404, 'Challenge not found'));
    });

    it("should throw AppError 403 when teacher tries to delete another teacher's challenge", async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      const otherTeacher = makeTeacher();
      jest
        .spyOn(challengeRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(otherTeacher);

      // act / assert
      await expect(
        sut.remove(
          faker.string.uuid(),
          'teacher',
          challengeRepository._challenge.id,
        ),
      ).rejects.toThrow(
        new AppError(403, 'You can only delete your own challenges'),
      );
    });

    it('should throw AppError 403 when teacher record is not found on remove', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      jest
        .spyOn(challengeRepository, 'findTeacherByUserId')
        .mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.remove(
          faker.string.uuid(),
          'teacher',
          challengeRepository._challenge.id,
        ),
      ).rejects.toThrow(
        new AppError(403, 'You can only delete your own challenges'),
      );
    });

    it('should allow admin to delete any challenge without ownership check', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      const findTeacherSpy = jest.spyOn(
        challengeRepository,
        'findTeacherByUserId',
      );

      // act
      await sut.remove(
        faker.string.uuid(),
        'admin',
        challengeRepository._challenge.id,
      );

      // assert
      expect(findTeacherSpy).not.toHaveBeenCalled();
    });

    it('should allow developer to delete any challenge without ownership check', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      const findTeacherSpy = jest.spyOn(
        challengeRepository,
        'findTeacherByUserId',
      );

      // act
      await sut.remove(
        faker.string.uuid(),
        'developer',
        challengeRepository._challenge.id,
      );

      // assert
      expect(findTeacherSpy).not.toHaveBeenCalled();
    });

    it('should call repository.remove with the challenge id', async () => {
      // arrange
      const { sut, challengeRepository } = makeSut();
      const removeSpy = jest.spyOn(challengeRepository, 'remove');

      // act
      await sut.remove(
        faker.string.uuid(),
        'admin',
        challengeRepository._challenge.id,
      );

      // assert
      expect(removeSpy).toHaveBeenCalledWith(challengeRepository._challenge.id);
    });
  });
});
