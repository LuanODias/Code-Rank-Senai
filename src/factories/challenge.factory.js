const { getPrismaClient } = require('../config/prisma');
const { ChallengeRepository } = require('../repositories/challenge.repository');
const { ChallengeService } = require('../services/challenge.service');
const { ChallengeController } = require('../controllers/challenge.controller');

const makeChallengeController = () => {
  const prisma = getPrismaClient();
  const repository = new ChallengeRepository(prisma);
  const service = new ChallengeService(repository);
  return new ChallengeController(service);
};

module.exports = { makeChallengeController };
