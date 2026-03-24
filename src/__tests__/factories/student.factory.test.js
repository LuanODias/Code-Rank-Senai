const mockPrisma = {};

jest.mock('../../config/prisma', () => ({
  getPrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../config/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock('../../repositories/student.repository');
jest.mock('../../services/student.service');
jest.mock('../../controllers/student.controller');

const { getPrismaClient } = require('../../config/prisma');
const { getAuth } = require('../../config/auth');
const { StudentRepository } = require('../../repositories/student.repository');
const { StudentService } = require('../../services/student.service');
const { StudentController } = require('../../controllers/student.controller');
const { makeStudentController } = require('../../factories/student.factory');

describe('makeStudentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getPrismaClient', () => {
    // act
    makeStudentController();

    // assert
    expect(getPrismaClient).toHaveBeenCalledTimes(1);
  });

  it('should call getAuth', () => {
    // act
    makeStudentController();

    // assert
    expect(getAuth).toHaveBeenCalledTimes(1);
  });

  it('should instantiate StudentRepository with prisma client', () => {
    // act
    makeStudentController();

    // assert
    expect(StudentRepository).toHaveBeenCalledWith(mockPrisma);
  });

  it('should instantiate StudentService with repository and auth', () => {
    // act
    makeStudentController();

    // assert
    const repositoryInstance = StudentRepository.mock.instances[0];
    const authInstance = getAuth.mock.results[0].value;
    expect(StudentService).toHaveBeenCalledWith(
      repositoryInstance,
      authInstance,
    );
  });

  it('should instantiate StudentController with service', () => {
    // act
    makeStudentController();

    // assert
    const serviceInstance = StudentService.mock.instances[0];
    expect(StudentController).toHaveBeenCalledWith(serviceInstance);
  });

  it('should return a StudentController instance', () => {
    // act
    const result = makeStudentController();

    // assert
    expect(result).toBeInstanceOf(StudentController);
  });
});
