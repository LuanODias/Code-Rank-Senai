const { getPrismaClient } = require('../config/prisma');
const { getAuth } = require('../config/auth');
const { StudentRepository } = require('../repositories/student.repository');
const { StudentService } = require('../services/student.service');
const { StudentController } = require('../controllers/student.controller');

const makeStudentController = () => {
  const prisma = getPrismaClient();
  const auth = getAuth();
  const repository = new StudentRepository(prisma);
  const service = new StudentService(repository, auth);
  return new StudentController(service);
};

module.exports = { makeStudentController };
