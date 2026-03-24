class StudentController {
  constructor(studentService) {
    this.studentService = studentService;
  }

  async create(req, res, next) {
    try {
      const student = await this.studentService.create(req.body);
      res.status(201).json(student);
    } catch (err) {
      next(err);
    }
  }

  async getAll(_req, res, next) {
    try {
      const students = await this.studentService.getAll();
      res.json(students);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const student = await this.studentService.getById(req.params.id);
      res.json(student);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const student = await this.studentService.update(req.params.id, req.body);
      res.json(student);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      await this.studentService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { StudentController };
