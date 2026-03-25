class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  async create(req, res, next) {
    try {
      const admin = await this.adminService.create(req.body);
      res.status(201).json(admin);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      await this.adminService.remove(req.params.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { AdminController };
