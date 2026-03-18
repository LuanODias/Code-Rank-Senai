class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      await this.authService.logout(req.headers);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await this.authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword,
        req.headers,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { AuthController };
