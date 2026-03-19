const { faker } = require('@faker-js/faker');
const { TeacherService } = require('../../services/teacher.service');
const { AppError } = require('../../utils/AppError');

describe('TeacherService', () => {
  const makeTeacherRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    user: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    },
    mustChangePassword: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  class TeacherRepositoryStub {
    constructor() {
      this._teacher = makeTeacherRecord();
    }

    async findByEmail() {
      return null;
    }

    async findById() {
      return this._teacher;
    }

    async findAll() {
      return [this._teacher];
    }

    async updateUserRole() {}

    async create() {
      return this._teacher;
    }

    async update(id, data) {
      return { ...this._teacher, user: { ...this._teacher.user, ...data } };
    }

    async remove() {}
  }

  const makeAuth = (user) => ({
    api: {
      signUpEmail: jest.fn().mockResolvedValue({ user }),
    },
  });

  const makeSut = () => {
    const authUser = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
    };
    const auth = makeAuth(authUser);
    const teacherRepository = new TeacherRepositoryStub();
    const sut = new TeacherService(teacherRepository, auth);
    return { sut, auth, teacherRepository, authUser };
  };

  describe('create', () => {
    const makeData = () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
    });

    it('should throw AppError 409 when email is already in use', async () => {
      // arrange
      const { sut, teacherRepository } = makeSut();
      const data = makeData();
      jest
        .spyOn(teacherRepository, 'findByEmail')
        .mockResolvedValueOnce(makeTeacherRecord());

      // act / assert
      await expect(sut.create(data)).rejects.toThrow(
        new AppError(409, 'Email already in use'),
      );
    });

    it('should call auth.api.signUpEmail with generated password', async () => {
      // arrange
      const { sut, auth } = makeSut();
      const data = makeData();

      // act
      await sut.create(data);

      // assert
      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: data.name,
          email: data.email,
          password: expect.stringMatching(/^Senai@\d{6}$/),
        }),
      });
    });

    it('should update user role to teacher', async () => {
      // arrange
      const { sut, teacherRepository, authUser } = makeSut();
      const data = makeData();
      const updateRoleSpy = jest.spyOn(teacherRepository, 'updateUserRole');

      // act
      await sut.create(data);

      // assert
      expect(updateRoleSpy).toHaveBeenCalledWith(authUser.id, 'teacher');
    });

    it('should call teacherRepository.create with the new user id', async () => {
      // arrange
      const { sut, teacherRepository, authUser } = makeSut();
      const data = makeData();
      const createSpy = jest.spyOn(teacherRepository, 'create');

      // act
      await sut.create(data);

      // assert
      expect(createSpy).toHaveBeenCalledWith(authUser.id);
    });

    it('should return DTO with defaultPassword included', async () => {
      // arrange
      const { sut } = makeSut();
      const data = makeData();

      // act
      const result = await sut.create(data);

      // assert
      expect(result).toMatchObject({
        id: expect.any(String),
        userId: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        mustChangePassword: expect.any(Boolean),
        defaultPassword: expect.stringMatching(/^Senai@\d{6}$/),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('getAll', () => {
    it('should return list of teacher DTOs', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getAll();

      // assert
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      });
    });

    it('should call teacherRepository.findAll', async () => {
      // arrange
      const { sut, teacherRepository } = makeSut();
      const findAllSpy = jest.spyOn(teacherRepository, 'findAll');

      // act
      await sut.getAll();

      // assert
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });

    it('should not include defaultPassword in getAll results', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getAll();

      // assert
      expect(result[0]).not.toHaveProperty('defaultPassword');
    });
  });

  describe('getById', () => {
    it('should throw AppError 404 when teacher is not found', async () => {
      // arrange
      const { sut, teacherRepository } = makeSut();
      jest.spyOn(teacherRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.getById('non-existent-id')).rejects.toThrow(
        new AppError(404, 'Teacher not found'),
      );
    });

    it('should return teacher DTO when found', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getById('some-id');

      // assert
      expect(result).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      });
    });
  });

  describe('update', () => {
    it('should throw AppError 404 when teacher is not found', async () => {
      // arrange
      const { sut, teacherRepository } = makeSut();
      jest.spyOn(teacherRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.update('non-existent-id', {})).rejects.toThrow(
        new AppError(404, 'Teacher not found'),
      );
    });

    it('should call teacherRepository.update with correct params', async () => {
      // arrange
      const { sut, teacherRepository } = makeSut();
      const data = { name: faker.person.fullName() };
      const updateSpy = jest.spyOn(teacherRepository, 'update');

      // act
      await sut.update('some-id', data);

      // assert
      expect(updateSpy).toHaveBeenCalledWith('some-id', data);
    });

    it('should return updated teacher DTO', async () => {
      // arrange
      const { sut } = makeSut();
      const data = { name: faker.person.fullName() };

      // act
      const result = await sut.update('some-id', data);

      // assert
      expect(result).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      });
    });
  });

  describe('remove', () => {
    it('should throw AppError 404 when teacher is not found', async () => {
      // arrange
      const { sut, teacherRepository } = makeSut();
      jest.spyOn(teacherRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.remove('non-existent-id')).rejects.toThrow(
        new AppError(404, 'Teacher not found'),
      );
    });

    it('should call teacherRepository.remove with the teacher id', async () => {
      // arrange
      const { sut, teacherRepository } = makeSut();
      const removeSpy = jest.spyOn(teacherRepository, 'remove');
      const id = faker.string.uuid();

      // act
      await sut.remove(id);

      // assert
      expect(removeSpy).toHaveBeenCalledWith(id);
    });
  });
});
