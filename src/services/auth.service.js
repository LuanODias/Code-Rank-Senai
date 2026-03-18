const { fromNodeHeaders } = require('better-auth/node');
const { AppError } = require('../utils/AppError');

class AuthService {
  constructor(auth) {
    this.auth = auth;
  }

  async login(email, password) {
    const result = await this.auth.api.signInEmail({
      body: { email, password },
    });

    if (!result) throw new AppError(401, 'Invalid credentials');

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      token: result.token,
    };
  }

  async logout(headers) {
    await this.auth.api.signOut({
      headers: fromNodeHeaders(headers),
    });
  }
}

module.exports = { AuthService };
