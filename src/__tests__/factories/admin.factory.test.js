const mockPrisma = {};
const mockAuth = {};

jest.mock('../../config/prisma', () => ({
  getPrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../config/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
}));

jest.mock('../../repositories/admin.repository');
jest.mock('../../services/admin.service');
jest.mock('../../controllers/admin.controller');

const { getPrismaClient } = require('../../config/prisma');
const { getAuth } = require('../../config/auth');
const { AdminRepository } = require('../../repositories/admin.repository');
const { AdminService } = require('../../services/admin.service');
const { AdminController } = require('../../controllers/admin.controller');
const { makeAdminController } = require('../../factories/admin.factory');

describe('makeAdminController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getPrismaClient and getAuth', () => {
    // act
    makeAdminController();

    // assert
    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(getAuth).toHaveBeenCalledTimes(1);
  });

  it('should instantiate AdminRepository with prisma client', () => {
    // act
    makeAdminController();

    // assert
    expect(AdminRepository).toHaveBeenCalledWith(mockPrisma);
  });

  it('should instantiate AdminService with repository and auth', () => {
    // act
    makeAdminController();

    // assert
    const repositoryInstance = AdminRepository.mock.instances[0];
    expect(AdminService).toHaveBeenCalledWith(repositoryInstance, mockAuth);
  });

  it('should instantiate AdminController with service', () => {
    // act
    makeAdminController();

    // assert
    const serviceInstance = AdminService.mock.instances[0];
    expect(AdminController).toHaveBeenCalledWith(serviceInstance);
  });

  it('should return an AdminController instance', () => {
    // act
    const result = makeAdminController();

    // assert
    expect(result).toBeInstanceOf(AdminController);
  });
});
