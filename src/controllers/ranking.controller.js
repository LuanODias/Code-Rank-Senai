class RankingController {
  constructor(rankingService) {
    this.rankingService = rankingService;
  }

  async getStudents(req, res, next) {
    try {
      const { turmaId, period } = req.query;
      const ranking = await this.rankingService.getStudentRanking(
        turmaId || null,
        period || null,
      );
      res.json(ranking);
    } catch (err) {
      next(err);
    }
  }

  async getTurmas(req, res, next) {
    try {
      const { period } = req.query;
      const ranking = await this.rankingService.getTurmaRanking(period || null);
      res.json(ranking);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { RankingController };
