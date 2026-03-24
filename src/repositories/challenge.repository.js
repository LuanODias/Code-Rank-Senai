class ChallengeRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.challenge.findUnique({
      where: { id },
      include: { teacher: { include: { user: true } } },
    });
  }

  async findAll() {
    return this.prisma.challenge.findMany({
      include: { teacher: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTeacherId(teacherId) {
    return this.prisma.challenge.findMany({
      where: { teacherId },
      include: { teacher: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data) {
    return this.prisma.challenge.create({
      data,
      include: { teacher: { include: { user: true } } },
    });
  }

  async update(id, data) {
    return this.prisma.challenge.update({
      where: { id },
      data,
      include: { teacher: { include: { user: true } } },
    });
  }

  async remove(id) {
    await this.prisma.challenge.delete({ where: { id } });
  }

  async findTeacherByUserId(userId) {
    return this.prisma.teacher.findUnique({ where: { userId } });
  }
}

module.exports = { ChallengeRepository };
