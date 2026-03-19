const { faker } = require('@faker-js/faker');
const { AdminController } = require('../../controllers/admin.controller');

describe('AdminController', () => {
  const makeAdmin = () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'admin',
    token: faker.string.alphanumeric(64),
  });

  class AdminServiceStub {
    async create() {
      return makeAdmin();
    }

    async remove() {}

    generateToken() {
      return { token: faker.string.alphanumeric(64) };
    }
  }

  const makeSut = () => {
    const adminService = new AdminServiceStub();
    const sut = new AdminController(adminService);
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();
    return { adminService, sut, res, next };
  };

  describe('create', () => {
    const httpRequest = {
      body: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password({ length: 8 }),
      },
    };

    it('should return 201 with the created admin and token', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          token: expect.any(String),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call adminService.create with correct params', async () => {
      // arrange
      const { sut, adminService, res, next } = makeSut();
      const createSpy = jest.spyOn(adminService, 'create');

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(createSpy).toHaveBeenCalledWith(httpRequest.body);
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should call next with error if adminService.create throws', async () => {
      // arrange
      const { sut, adminService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(adminService, 'create').mockRejectedValueOnce(error);

      // act
      await sut.create(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const httpRequest = { params: { userId: faker.string.uuid() } };

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

    it('should call adminService.remove with correct userId', async () => {
      // arrange
      const { sut, adminService, res, next } = makeSut();
      const removeSpy = jest.spyOn(adminService, 'remove');

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(removeSpy).toHaveBeenCalledWith(httpRequest.params.userId);
    });

    it('should call next with error if adminService.remove throws', async () => {
      // arrange
      const { sut, adminService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(adminService, 'remove').mockRejectedValueOnce(error);

      // act
      await sut.remove(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('generateToken', () => {
    it('should return the generated token', () => {
      // arrange
      const { sut, res, next } = makeSut();
      const httpRequest = { body: { label: 'postman-local' } };

      // act
      sut.generateToken(httpRequest, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: expect.any(String) }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call adminService.generateToken with correct label', () => {
      // arrange
      const { sut, adminService, res, next } = makeSut();
      const generateTokenSpy = jest.spyOn(adminService, 'generateToken');
      const httpRequest = { body: { label: 'postman-local' } };

      // act
      sut.generateToken(httpRequest, res, next);

      // assert
      expect(generateTokenSpy).toHaveBeenCalledWith('postman-local');
    });

    it('should call next with error if adminService.generateToken throws', () => {
      // arrange
      const { sut, adminService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(adminService, 'generateToken').mockImplementationOnce(() => {
        throw error;
      });

      // act
      sut.generateToken({ body: {} }, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
