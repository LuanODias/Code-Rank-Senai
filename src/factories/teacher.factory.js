const { getPrismaClient } = require('../config/prisma');
const { getAuth } = require('../config/auth');
const { TeacherRepository } = require('../repositories/teacher.repository');
const { TeacherService } = require('../services/teacher.service');
const { TeacherController } = require('../controllers/teacher.controller');

const makeTeacherController = () => {
  const prisma = getPrismaClient();
  const auth = getAuth();
  const repository = new TeacherRepository(prisma);
  const service = new TeacherService(repository, auth);
  return new TeacherController(service);
};

module.exports = { makeTeacherController };
