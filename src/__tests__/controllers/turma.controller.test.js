const { faker } = require('@faker-js/faker');
const { TurmaController } = require('../../controllers/turma.controller');

describe('TurmaController', () => {
  const makeTurma = () => ({
    id: faker.string.uuid(),
    name: 'Turma A',
    teacher: { id: faker.string.uuid(), name: faker.person.fullName() },
    students: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  class TurmaServiceStub {
    async create() {
      return makeTurma();
    }

    async getAll() {
      return [makeTurma(), makeTurma()];
    }

    async getById() {
      return makeTurma();
    }

    async update() {
      return makeTurma();
    }

    async remove() {}

    async addStudent() {}

    async removeStudent() {}
  }

  const makeSut = () => {
    const turmaService = new TurmaServiceStub();
    const sut = new TurmaController(turmaService);
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();
    return { turmaService, sut, res, next };
  };

  describe('create', () => {
    const httpRequest = {
      user: { id: faker.string.uuid(), role: 'teacher' },
      body: { name: 'Turma A' },
    };

    it('should return 201 with created turma', async () => {
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

    it('should call turmaService.create with user id and body', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      const spy = jest.spyOn(turmaService, 'create');

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(httpRequest.user.id, httpRequest.body);
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      const error = new Error('error');
      jest.spyOn(turmaService, 'create').mockRejectedValueOnce(error);

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAll', () => {
    const httpRequest = { user: { id: faker.string.uuid(), role: 'teacher' } };

    it('should return 200 with list of turmas', async () => {
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

    it('should call turmaService.getAll with user id and role', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      const spy = jest.spyOn(turmaService, 'getAll');

      // act
      await sut.getAll(httpRequest, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.user.role,
      );
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      jest
        .spyOn(turmaService, 'getAll')
        .mockRejectedValueOnce(new Error('error'));

      // act
      await sut.getAll(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    const httpRequest = { params: { id: faker.string.uuid() } };

    it('should return 200 with turma', async () => {
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

    it('should call turmaService.getById with params.id', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      const spy = jest.spyOn(turmaService, 'getById');

      // act
      await sut.getById(httpRequest, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(httpRequest.params.id);
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      jest
        .spyOn(turmaService, 'getById')
        .mockRejectedValueOnce(new Error('error'));

      // act
      await sut.getById(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const httpRequest = {
      user: { id: faker.string.uuid(), role: 'teacher' },
      params: { id: faker.string.uuid() },
      body: { name: 'Turma B' },
    };

    it('should return 200 with updated turma', async () => {
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

    it('should call turmaService.update with user id, role, id and body', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      const spy = jest.spyOn(turmaService, 'update');

      // act
      await sut.update(httpRequest, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.user.role,
        httpRequest.params.id,
        httpRequest.body,
      );
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      jest
        .spyOn(turmaService, 'update')
        .mockRejectedValueOnce(new Error('error'));

      // act
      await sut.update(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const httpRequest = {
      user: { id: faker.string.uuid(), role: 'teacher' },
      params: { id: faker.string.uuid() },
    };

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

    it('should call turmaService.remove with user id, role and id', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      const spy = jest.spyOn(turmaService, 'remove');

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.user.role,
        httpRequest.params.id,
      );
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      jest
        .spyOn(turmaService, 'remove')
        .mockRejectedValueOnce(new Error('error'));

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('addStudent', () => {
    const httpRequest = {
      user: { id: faker.string.uuid(), role: 'teacher' },
      params: { id: faker.string.uuid(), studentId: faker.string.uuid() },
    };

    it('should return 204 with no body', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.addStudent(httpRequest, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call turmaService.addStudent with user id, role, turmaId and studentId', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      const spy = jest.spyOn(turmaService, 'addStudent');

      // act
      await sut.addStudent(httpRequest, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.user.role,
        httpRequest.params.id,
        httpRequest.params.studentId,
      );
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      jest
        .spyOn(turmaService, 'addStudent')
        .mockRejectedValueOnce(new Error('error'));

      // act
      await sut.addStudent(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('removeStudent', () => {
    const httpRequest = {
      user: { id: faker.string.uuid(), role: 'teacher' },
      params: { id: faker.string.uuid(), studentId: faker.string.uuid() },
    };

    it('should return 204 with no body', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.removeStudent(httpRequest, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call turmaService.removeStudent with user id, role, turmaId and studentId', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      const spy = jest.spyOn(turmaService, 'removeStudent');

      // act
      await sut.removeStudent(httpRequest, res, next);

      // assert
      expect(spy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.user.role,
        httpRequest.params.id,
        httpRequest.params.studentId,
      );
    });

    it('should call next with error when service throws', async () => {
      // arrange
      const { sut, turmaService, res, next } = makeSut();
      jest
        .spyOn(turmaService, 'removeStudent')
        .mockRejectedValueOnce(new Error('error'));

      // act
      await sut.removeStudent(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalled();
    });
  });
});
