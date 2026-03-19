const jwt = require('jsonwebtoken');
const { faker } = require('@faker-js/faker');
const { AppError } = require('../../utils/AppError');

jest.mock('../../config/env', () => ({
  env: { ADMIN_SECRET: 'test-admin-secret' },
}));

const { AdminService } = require('../../services/admin.service');

const TEST_SECRET = 'test-admin-secret';

describe('AdminService', () => {
  const makeUser = (role = 'admin') => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role,
  });

  class AdminRepositoryStub {
    async findByEmail() {
      return null;
    }

    async findById() {
      return makeUser('admin');
    }

    async updateUserRole() {}

    async deleteUser() {}
  }

  const makeAuth = (user) => ({
    api: {
      signUpEmail: jest.fn().mockResolvedValue({ user }),
    },
  });

  const makeSut = () => {
    const user = makeUser('admin');
    const auth = makeAuth(user);
    const adminRepository = new AdminRepositoryStub();
    const sut = new AdminService(adminRepository, auth);
    return { sut, auth, adminRepository, user };
  };

  describe('create', () => {
    const makeData = () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    it('should throw AppError 409 when email is already in use', async () => {
      // arrange
      const { sut, adminRepository } = makeSut();
      const data = makeData();
      jest
        .spyOn(adminRepository, 'findByEmail')
        .mockResolvedValueOnce(makeUser());

      // act / assert
      await expect(sut.create(data)).rejects.toThrow(
        new AppError(409, 'Email already in use'),
      );
    });

    it('should call auth.api.signUpEmail with correct params', async () => {
      // arrange
      const { sut, auth } = makeSut();
      const data = makeData();

      // act
      await sut.create(data);

      // assert
      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        body: { name: data.name, email: data.email, password: data.password },
      });
    });

    it('should update user role to admin', async () => {
      // arrange
      const { sut, adminRepository, user } = makeSut();
      const data = makeData();
      const updateSpy = jest.spyOn(adminRepository, 'updateUserRole');

      // act
      await sut.create(data);

      // assert
      expect(updateSpy).toHaveBeenCalledWith(user.id, 'admin');
    });

    it('should return admin data with token', async () => {
      // arrange
      const { sut, user } = makeSut();
      const data = makeData();

      // act
      const result = await sut.create(data);

      // assert
      expect(result).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin',
        token: expect.any(String),
      });
    });

    it('should return a valid JWT token in the result', async () => {
      // arrange
      const { sut } = makeSut();
      const data = makeData();

      // act
      const result = await sut.create(data);

      // assert
      const decoded = jwt.verify(result.token, TEST_SECRET);
      expect(decoded.type).toBe('api_token');
    });
  });

  describe('remove', () => {
    it('should throw AppError 404 when user is not found', async () => {
      // arrange
      const { sut, adminRepository } = makeSut();
      jest.spyOn(adminRepository, 'findById').mockResolvedValueOnce(null);

      // act / assert
      await expect(sut.remove('non-existent-id')).rejects.toThrow(
        new AppError(404, 'Admin not found'),
      );
    });

    it('should throw AppError 400 when user is not an admin', async () => {
      // arrange
      const { sut, adminRepository } = makeSut();
      jest
        .spyOn(adminRepository, 'findById')
        .mockResolvedValueOnce(makeUser('teacher'));

      // act / assert
      await expect(sut.remove('some-id')).rejects.toThrow(
        new AppError(400, 'User is not an admin'),
      );
    });

    it('should call deleteUser when user is a valid admin', async () => {
      // arrange
      const { sut, adminRepository } = makeSut();
      const userId = faker.string.uuid();
      const deleteSpy = jest.spyOn(adminRepository, 'deleteUser');

      // act
      await sut.remove(userId);

      // assert
      expect(deleteSpy).toHaveBeenCalledWith(userId);
    });
  });

  describe('generateToken', () => {
    it('should return a signed JWT token', () => {
      // arrange
      const { sut } = makeSut();

      // act
      const { token } = sut.generateToken('my-label');

      // assert
      const decoded = jwt.verify(token, TEST_SECRET);
      expect(decoded.type).toBe('api_token');
      expect(decoded.label).toBe('my-label');
    });

    it('should use default label when none is provided', () => {
      // arrange
      const { sut } = makeSut();

      // act
      const { token } = sut.generateToken();

      // assert
      const decoded = jwt.verify(token, TEST_SECRET);
      expect(decoded.label).toBe('default');
    });

    it('should generate token that expires in 365 days', () => {
      // arrange
      const { sut } = makeSut();
      const now = Math.floor(Date.now() / 1000);

      // act
      const { token } = sut.generateToken('test');

      // assert
      const decoded = jwt.decode(token);
      const expectedExpiry = now + 365 * 24 * 60 * 60;
      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiry - 5);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpiry + 5);
    });
  });
});
