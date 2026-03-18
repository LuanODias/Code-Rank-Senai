const { getPrismaClient } = require('../config/prisma');
const { getAuth } = require('../config/auth');
const { AuthRepository } = require('../repositories/auth.repository');
const { AuthService } = require('../services/auth.service');
const { AuthController } = require('../controllers/auth.controller');

const makeAuthController = () => {
  const prisma = getPrismaClient();
  const auth = getAuth();
  const repository = new AuthRepository(prisma);
  const service = new AuthService(auth, repository);
  return new AuthController(service);
};

module.exports = { makeAuthController };
