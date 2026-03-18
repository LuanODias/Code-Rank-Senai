const { getPrismaClient } = require('../config/prisma');
const { getAuth } = require('../config/auth');
const { AdminRepository } = require('../repositories/admin.repository');
const { AdminService } = require('../services/admin.service');
const { AdminController } = require('../controllers/admin.controller');

const makeAdminController = () => {
  const prisma = getPrismaClient();
  const auth = getAuth();
  const repository = new AdminRepository(prisma);
  const service = new AdminService(repository, auth);
  return new AdminController(service);
};

module.exports = { makeAdminController };
