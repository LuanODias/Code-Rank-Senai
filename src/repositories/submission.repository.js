const INCLUDE = {
  student: { include: { user: true } },
  challenge: true,
};

class SubmissionRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.submission.findUnique({
      where: { id },
      include: INCLUDE,
    });
  }

  async findAll() {
    return this.prisma.submission.findMany({
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStudentId(studentId) {
    return this.prisma.submission.findMany({
      where: { studentId },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data) {
    return this.prisma.submission.create({
      data,
      include: INCLUDE,
    });
  }

  async update(id, data) {
    return this.prisma.submission.update({
      where: { id },
      data,
      include: INCLUDE,
    });
  }

  async findStudentByUserId(userId) {
    return this.prisma.student.findUnique({ where: { userId } });
  }

  async findChallengeById(id) {
    return this.prisma.challenge.findUnique({ where: { id } });
  }
}

module.exports = { SubmissionRepository };
