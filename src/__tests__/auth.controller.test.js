const { faker } = require('@faker-js/faker');
const { AuthController } = require('../controllers/auth.controller');

describe('AuthController', () => {
  class AuthServiceStub {
    async login() {
      return {
        user: {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          role: 'teacher',
          mustChangePassword: false,
        },
        token: faker.string.alphanumeric(64),
      };
    }

    async logout() {}

    async changePassword() {
      return { message: 'Password changed successfully.' };
    }
  }

  const makeSut = () => {
    const authService = new AuthServiceStub();
    const sut = new AuthController(authService);
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();
    return { authService, sut, res, next };
  };

  describe('login', () => {
    const httpRequest = {
      body: {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 8 }),
      },
    };

    it('should return 200 with user and token on successful login', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.login(httpRequest, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.any(Object),
          token: expect.any(String),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call authService.login with correct params', async () => {
      // arrange
      const { sut, authService, res, next } = makeSut();
      const loginSpy = jest.spyOn(authService, 'login');

      // act
      await sut.login(httpRequest, res, next);

      // assert
      expect(loginSpy).toHaveBeenCalledWith(
        httpRequest.body.email,
        httpRequest.body.password,
      );
      expect(loginSpy).toHaveBeenCalledTimes(1);
    });

    it('should call next with error if authService.login throws', async () => {
      // arrange
      const { sut, authService, res, next } = makeSut();
      const error = new Error('Invalid credentials');
      jest.spyOn(authService, 'login').mockRejectedValueOnce(error);

      // act
      await sut.login(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    const httpRequest = { headers: { authorization: 'Bearer token' } };

    it('should return 204 on successful logout', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.logout(httpRequest, res, next);

      // assert
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if authService.logout throws', async () => {
      // arrange
      const { sut, authService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(authService, 'logout').mockRejectedValueOnce(error);

      // act
      await sut.logout(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('changePassword', () => {
    const httpRequest = {
      user: { id: faker.string.uuid() },
      body: {
        currentPassword: faker.internet.password({ length: 8 }),
        newPassword: faker.internet.password({ length: 8 }),
      },
      headers: { authorization: 'Bearer token' },
    };

    it('should return 200 with success message on password change', async () => {
      // arrange
      const { sut, res, next } = makeSut();

      // act
      await sut.changePassword(httpRequest, res, next);

      // assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password changed successfully.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call authService.changePassword with correct params', async () => {
      // arrange
      const { sut, authService, res, next } = makeSut();
      const changePasswordSpy = jest.spyOn(authService, 'changePassword');

      // act
      await sut.changePassword(httpRequest, res, next);

      // assert
      expect(changePasswordSpy).toHaveBeenCalledWith(
        httpRequest.user.id,
        httpRequest.body.currentPassword,
        httpRequest.body.newPassword,
        httpRequest.headers,
      );
    });

    it('should call next with error if authService.changePassword throws', async () => {
      // arrange
      const { sut, authService, res, next } = makeSut();
      const error = new Error();
      jest.spyOn(authService, 'changePassword').mockRejectedValueOnce(error);

      // act
      await sut.changePassword(httpRequest, res, next);

      // assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
