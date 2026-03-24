class TurmaController {
  constructor(turmaService) {
    this.turmaService = turmaService;
  }

  async create(req, res, next) {
    try {
      const turma = await this.turmaService.create(req.user.id, req.body);
      res.status(201).json(turma);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const turmas = await this.turmaService.getAll(req.user.id, req.user.role);
      res.json(turmas);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const turma = await this.turmaService.getById(req.params.id);
      res.json(turma);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const turma = await this.turmaService.update(
        req.user.id,
        req.user.role,
        req.params.id,
        req.body,
      );
      res.json(turma);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      await this.turmaService.remove(req.user.id, req.user.role, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async addStudent(req, res, next) {
    try {
      await this.turmaService.addStudent(
        req.user.id,
        req.user.role,
        req.params.id,
        req.params.studentId,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async removeStudent(req, res, next) {
    try {
      await this.turmaService.removeStudent(
        req.user.id,
        req.user.role,
        req.params.id,
        req.params.studentId,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { TurmaController };
