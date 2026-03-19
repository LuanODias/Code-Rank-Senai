const mockPrisma = {};
const mockAuth = {};

jest.mock('better-auth/node', () => ({
  fromNodeHeaders: jest.fn((headers) => headers),
}));

jest.mock('../../config/prisma', () => ({
  getPrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../config/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
}));

jest.mock('../../repositories/auth.repository');
jest.mock('../../services/auth.service');
jest.mock('../../controllers/auth.controller');

const { getPrismaClient } = require('../../config/prisma');
const { getAuth } = require('../../config/auth');
const { AuthRepository } = require('../../repositories/auth.repository');
const { AuthService } = require('../../services/auth.service');
const { AuthController } = require('../../controllers/auth.controller');
const { makeAuthController } = require('../../factories/auth.factory');

describe('makeAuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getPrismaClient and getAuth', () => {
    // act
    makeAuthController();

    // assert
    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(getAuth).toHaveBeenCalledTimes(1);
  });

  it('should instantiate AuthRepository with prisma client', () => {
    // act
    makeAuthController();

    // assert
    expect(AuthRepository).toHaveBeenCalledWith(mockPrisma);
  });

  it('should instantiate AuthService with auth and repository', () => {
    // act
    makeAuthController();

    // assert
    const repositoryInstance = AuthRepository.mock.instances[0];
    expect(AuthService).toHaveBeenCalledWith(mockAuth, repositoryInstance);
  });

  it('should instantiate AuthController with service', () => {
    // act
    makeAuthController();

    // assert
    const serviceInstance = AuthService.mock.instances[0];
    expect(AuthController).toHaveBeenCalledWith(serviceInstance);
  });

  it('should return an AuthController instance', () => {
    // act
    const result = makeAuthController();

    // assert
    expect(result).toBeInstanceOf(AuthController);
  });
});
