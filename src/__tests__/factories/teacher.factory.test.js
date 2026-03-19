const mockPrisma = {};
const mockAuth = {};

jest.mock('../../config/prisma', () => ({
  getPrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../config/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
}));

jest.mock('../../repositories/teacher.repository');
jest.mock('../../services/teacher.service');
jest.mock('../../controllers/teacher.controller');

const { getPrismaClient } = require('../../config/prisma');
const { getAuth } = require('../../config/auth');
const { TeacherRepository } = require('../../repositories/teacher.repository');
const { TeacherService } = require('../../services/teacher.service');
const { TeacherController } = require('../../controllers/teacher.controller');
const { makeTeacherController } = require('../../factories/teacher.factory');

describe('makeTeacherController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getPrismaClient and getAuth', () => {
    // act
    makeTeacherController();

    // assert
    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(getAuth).toHaveBeenCalledTimes(1);
  });

  it('should instantiate TeacherRepository with prisma client', () => {
    // act
    makeTeacherController();

    // assert
    expect(TeacherRepository).toHaveBeenCalledWith(mockPrisma);
  });

  it('should instantiate TeacherService with repository and auth', () => {
    // act
    makeTeacherController();

    // assert
    const repositoryInstance = TeacherRepository.mock.instances[0];
    expect(TeacherService).toHaveBeenCalledWith(repositoryInstance, mockAuth);
  });

  it('should instantiate TeacherController with service', () => {
    // act
    makeTeacherController();

    // assert
    const serviceInstance = TeacherService.mock.instances[0];
    expect(TeacherController).toHaveBeenCalledWith(serviceInstance);
  });

  it('should return a TeacherController instance', () => {
    // act
    const result = makeTeacherController();

    // assert
    expect(result).toBeInstanceOf(TeacherController);
  });
});
