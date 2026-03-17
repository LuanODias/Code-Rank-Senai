class TeacherRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findAll() {
    return this.prisma.teacher.findMany({ include: { user: true } });
  }

  async create(userId) {
    return this.prisma.teacher.create({
      data: { userId },
      include: { user: true },
    });
  }

  async updateUserRole(userId, role) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async update(id, data) {
    return this.prisma.teacher.update({
      where: { id },
      data: { user: { update: data } },
      include: { user: true },
    });
  }

  async remove(id) {
    await this.prisma.teacher.delete({ where: { id } });
  }
}

module.exports = { TeacherRepository };
