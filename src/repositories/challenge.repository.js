const INCLUDE = {
  teacher: { include: { user: true } },
  testCases: { orderBy: { createdAt: 'asc' } },
};

class ChallengeRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.challenge.findUnique({
      where: { id },
      include: INCLUDE,
    });
  }

  async findAll() {
    return this.prisma.challenge.findMany({
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTeacherId(teacherId) {
    return this.prisma.challenge.findMany({
      where: { teacherId },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data) {
    return this.prisma.challenge.create({ data, include: INCLUDE });
  }

  async update(id, data) {
    return this.prisma.challenge.update({
      where: { id },
      data,
      include: INCLUDE,
    });
  }

  async remove(id) {
    await this.prisma.challenge.delete({ where: { id } });
  }

  async findTeacherByUserId(userId) {
    return this.prisma.teacher.findUnique({ where: { userId } });
  }

  async addTestCase(challengeId, data) {
    return this.prisma.testCase.create({
      data: { challengeId, input: data.input ?? '', expected: data.expected },
    });
  }

  async removeTestCase(testCaseId) {
    await this.prisma.testCase.delete({ where: { id: testCaseId } });
  }

  async findTestCaseById(testCaseId) {
    return this.prisma.testCase.findUnique({ where: { id: testCaseId } });
  }
}

module.exports = { ChallengeRepository };
