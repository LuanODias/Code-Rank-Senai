const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');
const { env } = require('../config/env');

class AdminService {
  constructor(adminRepository, auth) {
    this.adminRepository = adminRepository;
    this.auth = auth;
  }

  async create(data) {
    const existing = await this.adminRepository.findByEmail(data.email);
    if (existing) throw new AppError(409, 'Email already in use');

    const result = await this.auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    await this.adminRepository.updateUserRole(result.user.id, 'admin');

    const token = jwt.sign(
      { type: 'api_token', label: data.email },
      env.ADMIN_SECRET,
      { expiresIn: '365d' },
    );

    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: 'admin',
      token,
    };
  }

  async remove(userId) {
    const user = await this.adminRepository.findById(userId);
    if (!user) throw new AppError(404, 'Admin not found');
    if (user.role !== 'admin') throw new AppError(400, 'User is not an admin');
    await this.adminRepository.deleteUser(userId);
  }
}

module.exports = { AdminService };
