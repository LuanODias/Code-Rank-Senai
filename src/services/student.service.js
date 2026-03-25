const { randomInt } = require('crypto');
const { AppError } = require('../utils/AppError');

const generateDefaultPassword = () => `Senai@${randomInt(100000, 999999)}`;

class StudentService {
  constructor(studentRepository, auth) {
    this.studentRepository = studentRepository;
    this.auth = auth;
  }

  async create(data) {
    const turma = await this.studentRepository.findTurmaById(data.turmaId);
    if (!turma) throw new AppError(404, 'Turma not found');

    const existing = await this.studentRepository.findByEmail(data.email);
    if (existing) throw new AppError(409, 'Email already in use');

    const defaultPassword = generateDefaultPassword();

    const result = await this.auth.api.signUpEmail({
      body: { name: data.name, email: data.email, password: defaultPassword },
    });

    await this.studentRepository.updateUserRole(result.user.id, 'student');
    const student = await this.studentRepository.create(
      result.user.id,
      data.turmaId,
    );
    return this.toDTO(student, defaultPassword);
  }

  async getAll() {
    const students = await this.studentRepository.findAll();
    return students.map((s) => this.toDTO(s));
  }

  async getById(id) {
    const student = await this.studentRepository.findById(id);
    if (!student) throw new AppError(404, 'Student not found');
    return this.toDTO(student);
  }

  async update(id, data) {
    const student = await this.studentRepository.findById(id);
    if (!student) throw new AppError(404, 'Student not found');
    const updated = await this.studentRepository.update(id, data);
    return this.toDTO(updated);
  }

  async remove(id) {
    const student = await this.studentRepository.findById(id);
    if (!student) throw new AppError(404, 'Student not found');
    await this.studentRepository.remove(id);
  }

  toDTO(student, defaultPassword) {
    return {
      id: student.id,
      userId: student.userId,
      name: student.user.name,
      email: student.user.email,
      turmaId: student.turmaId,
      turma: student.turma
        ? { id: student.turma.id, name: student.turma.name }
        : null,
      ...(defaultPassword && { defaultPassword }),
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }
}

module.exports = { StudentService };
