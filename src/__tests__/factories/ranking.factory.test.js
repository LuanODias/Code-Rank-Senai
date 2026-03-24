const mockPrisma = {};

jest.mock('../../config/prisma', () => ({
  getPrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../repositories/ranking.repository');
jest.mock('../../services/ranking.service');
jest.mock('../../controllers/ranking.controller');

const { getPrismaClient } = require('../../config/prisma');
const { RankingRepository } = require('../../repositories/ranking.repository');
const { RankingService } = require('../../services/ranking.service');
const { RankingController } = require('../../controllers/ranking.controller');
const { makeRankingController } = require('../../factories/ranking.factory');

describe('makeRankingController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getPrismaClient', () => {
    makeRankingController();
    expect(getPrismaClient).toHaveBeenCalledTimes(1);
  });

  it('should instantiate RankingRepository with prisma client', () => {
    makeRankingController();
    expect(RankingRepository).toHaveBeenCalledWith(mockPrisma);
  });

  it('should instantiate RankingService with repository', () => {
    makeRankingController();
    const repositoryInstance = RankingRepository.mock.instances[0];
    expect(RankingService).toHaveBeenCalledWith(repositoryInstance);
  });

  it('should instantiate RankingController with service', () => {
    makeRankingController();
    const serviceInstance = RankingService.mock.instances[0];
    expect(RankingController).toHaveBeenCalledWith(serviceInstance);
  });

  it('should return a RankingController instance', () => {
    const result = makeRankingController();
    expect(result).toBeInstanceOf(RankingController);
  });
});
