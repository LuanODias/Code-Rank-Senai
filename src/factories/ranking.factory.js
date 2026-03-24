const { getPrismaClient } = require('../config/prisma');
const { RankingRepository } = require('../repositories/ranking.repository');
const { RankingService } = require('../services/ranking.service');
const { RankingController } = require('../controllers/ranking.controller');

const makeRankingController = () => {
  const prisma = getPrismaClient();
  const repository = new RankingRepository(prisma);
  const service = new RankingService(repository);
  return new RankingController(service);
};

module.exports = { makeRankingController };
