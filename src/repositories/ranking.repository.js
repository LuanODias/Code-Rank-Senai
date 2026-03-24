class RankingRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findStudentsWithPoints(turmaId = null, since = null) {
    const submissionWhere = since ? { createdAt: { gte: since } } : {};
    return this.prisma.student.findMany({
      where: turmaId ? { turmaId } : {},
      include: {
        user: { select: { name: true } },
        turma: { select: { id: true, name: true } },
        submissions: { where: submissionWhere, select: { points: true } },
      },
    });
  }

  async findTurmasWithPoints(since = null) {
    const submissionWhere = since ? { createdAt: { gte: since } } : {};
    return this.prisma.turma.findMany({
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        students: {
          include: {
            submissions: { where: submissionWhere, select: { points: true } },
          },
        },
      },
    });
  }

  async findTurmaById(id) {
    return this.prisma.turma.findUnique({ where: { id } });
  }
}

module.exports = { RankingRepository };
