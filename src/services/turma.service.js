const { AppError } = require('../utils/AppError');

class TurmaService {
  constructor(turmaRepository) {
    this.turmaRepository = turmaRepository;
  }

  async create(userId, data) {
    const teacher = await this.turmaRepository.findTeacherByUserId(userId);
    if (!teacher) throw new AppError(403, 'Only teachers can create turmas');

    const turma = await this.turmaRepository.create({
      name: data.name,
      teacherId: teacher.id,
    });
    return this.toDTO(turma);
  }

  async getAll(userId, role) {
    if (role === 'teacher') {
      const teacher = await this.turmaRepository.findTeacherByUserId(userId);
      if (!teacher) return [];
      const turmas = await this.turmaRepository.findByTeacherId(teacher.id);
      return turmas.map((t) => this.toDTO(t));
    }

    const turmas = await this.turmaRepository.findAll();
    return turmas.map((t) => this.toDTO(t));
  }

  async getById(id) {
    const turma = await this.turmaRepository.findById(id);
    if (!turma) throw new AppError(404, 'Turma not found');
    return this.toDTO(turma);
  }

  async update(userId, role, id, data) {
    const turma = await this.turmaRepository.findById(id);
    if (!turma) throw new AppError(404, 'Turma not found');

    if (role === 'teacher') {
      const teacher = await this.turmaRepository.findTeacherByUserId(userId);
      if (!teacher || turma.teacherId !== teacher.id) {
        throw new AppError(403, 'You can only update your own turmas');
      }
    }

    const updated = await this.turmaRepository.update(id, data);
    return this.toDTO(updated);
  }

  async remove(userId, role, id) {
    const turma = await this.turmaRepository.findById(id);
    if (!turma) throw new AppError(404, 'Turma not found');

    if (role === 'teacher') {
      const teacher = await this.turmaRepository.findTeacherByUserId(userId);
      if (!teacher || turma.teacherId !== teacher.id) {
        throw new AppError(403, 'You can only remove your own turmas');
      }
    }

    await this.turmaRepository.remove(id);
  }

  async addStudent(userId, role, turmaId, studentId) {
    const turma = await this.turmaRepository.findById(turmaId);
    if (!turma) throw new AppError(404, 'Turma not found');

    if (role === 'teacher') {
      const teacher = await this.turmaRepository.findTeacherByUserId(userId);
      if (!teacher || turma.teacherId !== teacher.id) {
        throw new AppError(403, 'You can only manage your own turmas');
      }
    }

    const student = await this.turmaRepository.findStudentById(studentId);
    if (!student) throw new AppError(404, 'Student not found');

    await this.turmaRepository.addStudent(turmaId, studentId);
  }

  async removeStudent(userId, role, turmaId, studentId) {
    const turma = await this.turmaRepository.findById(turmaId);
    if (!turma) throw new AppError(404, 'Turma not found');

    if (role === 'teacher') {
      const teacher = await this.turmaRepository.findTeacherByUserId(userId);
      if (!teacher || turma.teacherId !== teacher.id) {
        throw new AppError(403, 'You can only manage your own turmas');
      }
    }

    const student = await this.turmaRepository.findStudentById(studentId);
    if (!student) throw new AppError(404, 'Student not found');

    if (student.turmaId !== turmaId) {
      throw new AppError(400, 'Student is not in this class');
    }

    await this.turmaRepository.removeStudent(studentId);
  }

  toDTO(turma) {
    return {
      id: turma.id,
      name: turma.name,
      teacher: {
        id: turma.teacher.id,
        name: turma.teacher.user.name,
      },
      students: turma.students.map((s) => ({
        id: s.id,
        name: s.user.name,
      })),
      createdAt: turma.createdAt,
      updatedAt: turma.updatedAt,
    };
  }
}

module.exports = { TurmaService };
