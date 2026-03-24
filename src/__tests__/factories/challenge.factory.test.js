const mockPrisma = {};

jest.mock('../../config/prisma', () => ({
  getPrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../config/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock('../../repositories/challenge.repository');
jest.mock('../../services/challenge.service');
jest.mock('../../controllers/challenge.controller');

const { getPrismaClient } = require('../../config/prisma');
const {
  ChallengeRepository,
} = require('../../repositories/challenge.repository');
const { ChallengeService } = require('../../services/challenge.service');
const {
  ChallengeController,
} = require('../../controllers/challenge.controller');
const {
  makeChallengeController,
} = require('../../factories/challenge.factory');

describe('makeChallengeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getPrismaClient', () => {
    // act
    makeChallengeController();

    // assert
    expect(getPrismaClient).toHaveBeenCalledTimes(1);
  });

  it('should instantiate ChallengeRepository with prisma client', () => {
    // act
    makeChallengeController();

    // assert
    expect(ChallengeRepository).toHaveBeenCalledWith(mockPrisma);
  });

  it('should instantiate ChallengeService with repository', () => {
    // act
    makeChallengeController();

    // assert
    const repositoryInstance = ChallengeRepository.mock.instances[0];
    expect(ChallengeService).toHaveBeenCalledWith(repositoryInstance);
  });

  it('should instantiate ChallengeController with service', () => {
    // act
    makeChallengeController();

    // assert
    const serviceInstance = ChallengeService.mock.instances[0];
    expect(ChallengeController).toHaveBeenCalledWith(serviceInstance);
  });

  it('should return a ChallengeController instance', () => {
    // act
    const result = makeChallengeController();

    // assert
    expect(result).toBeInstanceOf(ChallengeController);
  });
});
