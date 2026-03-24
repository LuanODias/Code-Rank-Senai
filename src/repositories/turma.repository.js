const INCLUDE = {
  teacher: { include: { user: true } },
  students: { include: { user: true } },
};

class TurmaRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.turma.findUnique({ where: { id }, include: INCLUDE });
  }

  async findAll() {
    return this.prisma.turma.findMany({
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTeacherId(teacherId) {
    return this.prisma.turma.findMany({
      where: { teacherId },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data) {
    return this.prisma.turma.create({ data, include: INCLUDE });
  }

  async update(id, data) {
    return this.prisma.turma.update({ where: { id }, data, include: INCLUDE });
  }

  async remove(id) {
    await this.prisma.turma.delete({ where: { id } });
  }

  async addStudent(turmaId, studentId) {
    return this.prisma.student.update({
      where: { id: studentId },
      data: { turmaId },
    });
  }

  async removeStudent(studentId) {
    return this.prisma.student.update({
      where: { id: studentId },
      data: { turmaId: null },
    });
  }

  async findStudentById(id) {
    return this.prisma.student.findUnique({ where: { id } });
  }

  async findTeacherByUserId(userId) {
    return this.prisma.teacher.findUnique({ where: { userId } });
  }
}

module.exports = { TurmaRepository };
