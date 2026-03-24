const { faker } = require('@faker-js/faker');
const { StudentController } = require('../../controllers/student.controller');

describe('StudentController', () => {
  const makeStudent = () => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  class StudentServiceStub {
    async create() {
      return { ...makeStudent(), defaultPassword: 'Senai@123456' };
    }

    async getAll() {
      return [makeStudent(), makeStudent()];
    }

    async getById() {
      return makeStudent();
    }

    async update() {
      return makeStudent();
    }

    async remove() {}
  }

  const makeSut = () => {
    const studentService = new StudentServiceStub();
    const sut = new StudentController(studentService);
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();
    return { studentService, sut, res, next };
  };

  describe('create', () => {
    const httpRequest = {
      body: { name: faker.person.fullName(), email: faker.internet.email() },
    };

    it('should return 201 with the created student', async () => {
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

    it('should call studentService.create with body', async () => {
      // arrange
      const { sut, studentService, res, next } = makeSut();
      const createSpy = jest.spyOn(studentService, 'create');

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(createSpy).toHaveBeenCalledWith(httpRequest.body);
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, studentService, res, next } = makeSut();
      const error = new Error('service error');
      jest.spyOn(studentService, 'create').mockRejectedValueOnce(error);

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAll', () => {
    it('should return 200 with list of students', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.getAll({}, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: expect.any(String) }),
        ]),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, studentService, res, next } = makeSut();
      const error = new Error('service error');
      jest.spyOn(studentService, 'getAll').mockRejectedValueOnce(error);

      // act
      await sut.getAll({}, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    const httpRequest = { params: { id: faker.string.uuid() } };

    it('should return 200 with student', async () => {
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

    it('should call studentService.getById with params.id', async () => {
      // arrange
      const { sut, studentService, res, next } = makeSut();
      const getByIdSpy = jest.spyOn(studentService, 'getById');

      // act
      await sut.getById(httpRequest, res, next);

      // assert
      expect(getByIdSpy).toHaveBeenCalledWith(httpRequest.params.id);
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, studentService, res, next } = makeSut();
      const error = new Error('service error');
      jest.spyOn(studentService, 'getById').mockRejectedValueOnce(error);

      // act
      await sut.getById(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    const httpRequest = {
      params: { id: faker.string.uuid() },
      body: { name: faker.person.fullName() },
    };

    it('should return 200 with updated student', async () => {
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

    it('should call studentService.update with id and body', async () => {
      // arrange
      const { sut, studentService, res, next } = makeSut();
      const updateSpy = jest.spyOn(studentService, 'update');

      // act
      await sut.update(httpRequest, res, next);

      // assert
      expect(updateSpy).toHaveBeenCalledWith(
        httpRequest.params.id,
        httpRequest.body,
      );
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, studentService, res, next } = makeSut();
      const error = new Error('service error');
      jest.spyOn(studentService, 'update').mockRejectedValueOnce(error);

      // act
      await sut.update(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('remove', () => {
    const httpRequest = { params: { id: faker.string.uuid() } };

    it('should return 204 with no body', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call studentService.remove with params.id', async () => {
      // arrange
      const { sut, studentService, res, next } = makeSut();
      const removeSpy = jest.spyOn(studentService, 'remove');

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(removeSpy).toHaveBeenCalledWith(httpRequest.params.id);
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, studentService, res, next } = makeSut();
      const error = new Error('service error');
      jest.spyOn(studentService, 'remove').mockRejectedValueOnce(error);

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
