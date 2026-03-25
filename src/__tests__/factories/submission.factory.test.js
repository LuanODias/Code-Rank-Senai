const mockPrisma = {};

jest.mock('../../config/prisma', () => ({
  getPrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../repositories/submission.repository');
jest.mock('../../services/submission.service');
jest.mock('../../controllers/submission.controller');

const { getPrismaClient } = require('../../config/prisma');
const {
  SubmissionRepository,
} = require('../../repositories/submission.repository');
const { SubmissionService } = require('../../services/submission.service');
const {
  SubmissionController,
} = require('../../controllers/submission.controller');
const {
  makeSubmissionController,
} = require('../../factories/submission.factory');

describe('makeSubmissionController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getPrismaClient', () => {
    // act
    makeSubmissionController();

    // assert
    expect(getPrismaClient).toHaveBeenCalledTimes(1);
  });

  it('should instantiate SubmissionRepository with prisma client', () => {
    // act
    makeSubmissionController();

    // assert
    expect(SubmissionRepository).toHaveBeenCalledWith(mockPrisma);
  });

  it('should instantiate SubmissionService with repository', () => {
    // act
    makeSubmissionController();

    // assert
    const repositoryInstance = SubmissionRepository.mock.instances[0];
    expect(SubmissionService).toHaveBeenCalledWith(repositoryInstance, null);
  });

  it('should instantiate SubmissionController with service', () => {
    // act
    makeSubmissionController();

    // assert
    const serviceInstance = SubmissionService.mock.instances[0];
    expect(SubmissionController).toHaveBeenCalledWith(serviceInstance);
  });

  it('should return a SubmissionController instance', () => {
    // act
    const result = makeSubmissionController();

    // assert
    expect(result).toBeInstanceOf(SubmissionController);
  });
});
