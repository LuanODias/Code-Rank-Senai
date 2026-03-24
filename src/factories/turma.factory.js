const { getPrismaClient } = require('../config/prisma');
const { TurmaRepository } = require('../repositories/turma.repository');
const { TurmaService } = require('../services/turma.service');
const { TurmaController } = require('../controllers/turma.controller');

const makeTurmaController = () => {
  const prisma = getPrismaClient();
  const repository = new TurmaRepository(prisma);
  const service = new TurmaService(repository);
  return new TurmaController(service);
};

module.exports = { makeTurmaController };
