class TeacherController {
  constructor(teacherService) {
    this.teacherService = teacherService;
  }

  async create(req, res, next) {
    try {
      const teacher = await this.teacherService.create(req.body);
      res.status(201).json(teacher);
    } catch (err) {
      next(err);
    }
  }

  async getAll(_req, res, next) {
    try {
      const teachers = await this.teacherService.getAll();
      res.json(teachers);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const teacher = await this.teacherService.getById(req.params.id);
      res.json(teacher);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const teacher = await this.teacherService.update(req.params.id, req.body);
      res.json(teacher);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      await this.teacherService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { TeacherController };
