class AdminRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUserRole(userId, role) {
    await this.prisma.user.update({ where: { id: userId }, data: { role } });
  }

  async deleteUser(userId) {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}

module.exports = { AdminRepository };
