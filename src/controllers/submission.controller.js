class SubmissionController {
  constructor(submissionService) {
    this.submissionService = submissionService;
  }

  async submit(req, res, next) {
    try {
      const submission = await this.submissionService.submit(
        req.user.id,
        req.body,
      );
      res.status(201).json(submission);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const submissions = await this.submissionService.getAll(
        req.user.id,
        req.user.role,
      );
      res.json(submissions);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const submission = await this.submissionService.getById(
        req.user.id,
        req.user.role,
        req.params.id,
      );
      res.json(submission);
    } catch (err) {
      next(err);
    }
  }

  async evaluate(req, res, next) {
    try {
      const submission = await this.submissionService.evaluate(
        req.params.id,
        req.body,
      );
      res.json(submission);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { SubmissionController };
