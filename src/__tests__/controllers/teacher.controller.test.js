const { faker } = require('@faker-js/faker');
const { TeacherController } = require('../../controllers/teacher.controller');

describe('TeacherController', () => {
  const makeTeacher = () => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    mustChangePassword: true,
    defaultPassword: `Senai@${faker.number.int({ min: 100000, max: 999999 })}`,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  class TeacherServiceStub {
    async create() {
      return makeTeacher();
    }

    async getAll() {
      return [makeTeacher(), makeTeacher()];
    }

    async getById() {
      return makeTeacher();
    }

    async update() {
      return makeTeacher();
    }

    async remove() {}
  }

  const makeSut = () => {
    const teacherService = new TeacherServiceStub();
    const sut = new TeacherController(teacherService);
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();
    return { teacherService, sut, res, next };
  };

  describe('create', () => {
    const httpRequest = {
      body: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
    };

    it('should return 201 with the created teacher', async () => {
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

    it('should call teacherService.create with correct params', async () => {
      // arrange
      const { sut, teacherService, res, next } = makeSut();
      const createSpy = jest.spyOn(teacherService, 'create');

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(createSpy).toHaveBeenCalledWith(httpRequest.body);
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should call next with error if teacherService.create throws', async () => {
      // arrange
      const { sut, teacherService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(teacherService, 'create').mockRejectedValueOnce(error);

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return a list of teachers', async () => {
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

    it('should call next with error if teacherService.getAll throws', async () => {
      // arrange
      const { sut, teacherService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(teacherService, 'getAll').mockRejectedValueOnce(error);

      // act
      await sut.getAll({}, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    const httpRequest = { params: { id: faker.string.uuid() } };

    it('should return the teacher when found', async () => {
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

    it('should call teacherService.getById with correct id', async () => {
      // arrange
      const { sut, teacherService, res, next } = makeSut();
      const getByIdSpy = jest.spyOn(teacherService, 'getById');

      // act
      await sut.getById(httpRequest, res, next);

      // assert
      expect(getByIdSpy).toHaveBeenCalledWith(httpRequest.params.id);
    });

    it('should call next with error if teacherService.getById throws', async () => {
      // arrange
      const { sut, teacherService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(teacherService, 'getById').mockRejectedValueOnce(error);

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

    it('should return the updated teacher', async () => {
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

    it('should call teacherService.update with correct params', async () => {
      // arrange
      const { sut, teacherService, res, next } = makeSut();
      const updateSpy = jest.spyOn(teacherService, 'update');

      // act
      await sut.update(httpRequest, res, next);

      // assert
      expect(updateSpy).toHaveBeenCalledWith(
        httpRequest.params.id,
        httpRequest.body,
      );
    });

    it('should call next with error if teacherService.update throws', async () => {
      // arrange
      const { sut, teacherService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(teacherService, 'update').mockRejectedValueOnce(error);

      // act
      await sut.update(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('remove', () => {
    const httpRequest = { params: { id: faker.string.uuid() } };

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

    it('should call teacherService.remove with correct id', async () => {
      // arrange
      const { sut, teacherService, res, next } = makeSut();
      const removeSpy = jest.spyOn(teacherService, 'remove');

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(removeSpy).toHaveBeenCalledWith(httpRequest.params.id);
    });

    it('should call next with error if teacherService.remove throws', async () => {
      // arrange
      const { sut, teacherService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(teacherService, 'remove').mockRejectedValueOnce(error);

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
