class ChallengeController {
  constructor(challengeService) {
    this.challengeService = challengeService;
  }

  async create(req, res, next) {
    try {
      const challenge = await this.challengeService.create(
        req.user.id,
        req.body,
      );
      res.status(201).json(challenge);
    } catch (err) {
      next(err);
    }
  }

  async getAll(_req, res, next) {
    try {
      const challenges = await this.challengeService.getAll();
      res.json(challenges);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const challenge = await this.challengeService.getById(req.params.id);
      res.json(challenge);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const challenge = await this.challengeService.update(
        req.user.id,
        req.user.role,
        req.params.id,
        req.body,
      );
      res.json(challenge);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      await this.challengeService.remove(
        req.user.id,
        req.user.role,
        req.params.id,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async addTestCase(req, res, next) {
    try {
      const testCase = await this.challengeService.addTestCase(
        req.user.id,
        req.user.role,
        req.params.id,
        req.body,
      );
      res.status(201).json(testCase);
    } catch (err) {
      next(err);
    }
  }

  async removeTestCase(req, res, next) {
    try {
      await this.challengeService.removeTestCase(
        req.user.id,
        req.user.role,
        req.params.id,
        req.params.testCaseId,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { ChallengeController };
