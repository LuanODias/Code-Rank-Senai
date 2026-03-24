const { AppError } = require('../utils/AppError');

const PERIODS = {
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

const getSinceDate = (period) => {
  if (!period) return null;
  if (!PERIODS[period]) throw new AppError(400, 'Period must be week or month');
  return new Date(Date.now() - PERIODS[period]);
};

class RankingService {
  constructor(rankingRepository) {
    this.rankingRepository = rankingRepository;
  }

  async getStudentRanking(turmaId = null, period = null) {
    if (turmaId) {
      const turma = await this.rankingRepository.findTurmaById(turmaId);
      if (!turma) throw new AppError(404, 'Turma not found');
    }

    const since = getSinceDate(period);
    const students = await this.rankingRepository.findStudentsWithPoints(
      turmaId,
      since,
    );

    return students
      .map((s) => ({
        id: s.id,
        name: s.user.name,
        turma: s.turma ? { id: s.turma.id, name: s.turma.name } : null,
        totalPoints: s.submissions.reduce((acc, sub) => acc + sub.points, 0),
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((s, i) => ({ rank: i + 1, ...s }));
  }

  async getTurmaRanking(period = null) {
    const since = getSinceDate(period);
    const turmas = await this.rankingRepository.findTurmasWithPoints(since);

    return turmas
      .map((t) => ({
        id: t.id,
        name: t.name,
        teacher: { id: t.teacher.id, name: t.teacher.user.name },
        studentCount: t.students.length,
        totalPoints: t.students.reduce(
          (acc, s) => acc + s.submissions.reduce((a, sub) => a + sub.points, 0),
          0,
        ),
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((t, i) => ({ rank: i + 1, ...t }));
  }
}

module.exports = { RankingService };
