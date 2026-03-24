const { getPrismaClient } = require('../config/prisma');
const {
  SubmissionRepository,
} = require('../repositories/submission.repository');
const { SubmissionService } = require('../services/submission.service');
const {
  SubmissionController,
} = require('../controllers/submission.controller');

const makeSubmissionController = () => {
  const prisma = getPrismaClient();
  const repository = new SubmissionRepository(prisma);
  const service = new SubmissionService(repository);
  return new SubmissionController(service);
};

module.exports = { makeSubmissionController };
