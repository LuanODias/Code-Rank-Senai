const { fromNodeHeaders } = require('better-auth/node');
const { AppError } = require('../utils/AppError');

class AuthService {
  constructor(auth, authRepository) {
    this.auth = auth;
    this.authRepository = authRepository;
  }

  async login(email, password) {
    const result = await this.auth.api.signInEmail({
      body: { email, password },
    });

    if (!result) throw new AppError(401, 'Invalid credentials');

    let mustChangePassword = false;
    if (result.user.role === 'teacher') {
      const teacher = await this.authRepository.findTeacherByUserId(
        result.user.id,
      );
      mustChangePassword = teacher?.mustChangePassword ?? false;
    }

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        mustChangePassword,
      },
      token: result.token,
    };
  }

  async logout(headers) {
    await this.auth.api.signOut({
      headers: fromNodeHeaders(headers),
    });
  }

  async changePassword(userId, currentPassword, newPassword, headers) {
    await this.auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: false },
      headers: fromNodeHeaders(headers),
    });

    const teacher = await this.authRepository.findTeacherByUserId(userId);
    if (teacher?.mustChangePassword) {
      await this.authRepository.clearMustChangePassword(userId);
    }

    return { message: 'Password changed successfully.' };
  }
}

module.exports = { AuthService };
