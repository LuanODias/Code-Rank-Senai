class AuthRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findUserByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findTeacherByUserId(userId) {
    return this.prisma.teacher.findUnique({ where: { userId } });
  }

  async clearMustChangePassword(userId) {
    await this.prisma.teacher.update({
      where: { userId },
      data: { mustChangePassword: false },
    });
  }
}

module.exports = { AuthRepository };
