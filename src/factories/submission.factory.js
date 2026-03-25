const { getPrismaClient } = require('../config/prisma');
const {
  SubmissionRepository,
} = require('../repositories/submission.repository');
const { SubmissionService } = require('../services/submission.service');
const {
  SubmissionController,
} = require('../controllers/submission.controller');
const { makeJudgeService } = require('./judge.factory');

const makeSubmissionController = () => {
  const prisma = getPrismaClient();
  const repository = new SubmissionRepository(prisma);
  const judgeService = makeJudgeService();
  const service = new SubmissionService(repository, judgeService);
  return new SubmissionController(service);
};

module.exports = { makeSubmissionController };
