class StudentRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findAll() {
    return this.prisma.student.findMany({ include: { user: true } });
  }

  async create(userId) {
    return this.prisma.student.create({
      data: { userId },
      include: { user: true },
    });
  }

  async update(id, data) {
    return this.prisma.student.update({
      where: { id },
      data: { user: { update: data } },
      include: { user: true },
    });
  }

  async remove(id) {
    await this.prisma.student.delete({ where: { id } });
  }

  async updateUserRole(userId, role) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}

module.exports = { StudentRepository };
