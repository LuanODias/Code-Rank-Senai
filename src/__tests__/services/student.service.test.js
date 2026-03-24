const { faker } = require('@faker-js/faker');
const { StudentService } = require('../../services/student.service');
const { AppError } = require('../../utils/AppError');

describe('StudentService', () => {
  const makeUserRecord = (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'student',
    ...overrides,
  });

  const makeStudentRecord = (overrides = {}) => {
    const user = makeUserRecord();
    return {
      id: faker.string.uuid(),
      userId: user.id,
      user,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  class StudentRepositoryStub {
    constructor() {
      this._student = makeStudentRecord();
    }

    async findByEmail() {
      return null;
    }

    async findById() {
      return this._student;
    }

    async findAll() {
      return [this._student];
    }

    async create() {
      return this._student;
    }

    async update(_id, data) {
      return { ...this._student, user: { ...this._student.user, ...data } };
    }

    async remove() {}

    async updateUserRole() {}
  }

  const makeAuth = (userId) => ({
    api: {
      signUpEmail: jest.fn().mockResolvedValue({ user: { id: userId } }),
    },
  });

  const makeSut = () => {
    const studentRepository = new StudentRepositoryStub();
    const auth = makeAuth(studentRepository._student.userId);
    const sut = new StudentService(studentRepository, auth);
    return { sut, studentRepository, auth };
  };

  describe('create', () => {
    const makeData = () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
    });

    it('should throw AppError 409 when email is already in use', async () => {
      // arrange
      const { sut, studentRepository } = makeSut();
      jest
        .spyOn(studentRepository, 'findByEmail')
        .mockResolvedValueOnce(makeUserRecord());

      // act / assert
      await expect(sut.create(makeData())).rejects.toThrow(
        new AppError(409, 'Email already in use'),
      );
    });

    it('should call auth.api.signUpEmail with name, email and generated password', async () => {
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

    it('should call updateUserRole with the created user id', async () => {
      // arrange
      const { sut, studentRepository } = makeSut();
      const updateRoleSpy = jest.spyOn(studentRepository, 'updateUserRole');

      // act
      await sut.create(makeData());

      // assert
      expect(updateRoleSpy).toHaveBeenCalledWith(
        studentRepository._student.userId,
        'student',
      );
    });

    it('should return a DTO with defaultPassword', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.create(makeData());

      // assert
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          defaultPassword: expect.stringMatching(/^Senai@\d{6}$/),
        }),
      );
    });
  });

  describe('getAll', () => {
    it('should return an array of student DTOs', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getAll();

      // assert
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          email: expect.any(String),
        }),
      );
    });

    it('should not include defaultPassword in getAll DTOs', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getAll();

      // assert
      expect(result[0].defaultPassword).toBeUndefined();
    });
  });

  describe('getById', () => {
    it('should throw AppError 404 when student is not found', async () => {
      // arrange
      const { sut, studentRepository } = makeSut();
      jest.spyOn(studentRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.getById(faker.string.uuid())).rejects.toThrow(
        new AppError(404, 'Student not found'),
      );
    });

    it('should return student DTO when found', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.getById(faker.string.uuid());

      // assert
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      );
    });
  });

  describe('update', () => {
    it('should throw AppError 404 when student is not found', async () => {
      // arrange
      const { sut, studentRepository } = makeSut();
      jest.spyOn(studentRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(
        sut.update(faker.string.uuid(), { name: 'New' }),
      ).rejects.toThrow(new AppError(404, 'Student not found'));
    });

    it('should return updated student DTO', async () => {
      // arrange
      const { sut } = makeSut();

      // act
      const result = await sut.update(faker.string.uuid(), {
        name: 'Updated Name',
      });

      // assert
      expect(result).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      );
    });
  });

  describe('remove', () => {
    it('should throw AppError 404 when student is not found', async () => {
      // arrange
      const { sut, studentRepository } = makeSut();
      jest.spyOn(studentRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.remove(faker.string.uuid())).rejects.toThrow(
        new AppError(404, 'Student not found'),
      );
    });

    it('should call repository.remove when student exists', async () => {
      // arrange
      const { sut, studentRepository } = makeSut();
      const removeSpy = jest.spyOn(studentRepository, 'remove');

      // act
      await sut.remove(faker.string.uuid());

      // assert
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
