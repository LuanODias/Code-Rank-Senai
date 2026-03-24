const {
  loginSchema,
  changePasswordSchema,
} = require('../../schemas/auth.schemas');

describe('auth schemas', () => {
  describe('loginSchema', () => {
    it('should pass with valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'joao@senai.com',
        password: 'senha123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when email is missing', () => {
      const result = loginSchema.safeParse({ password: 'senha123' });
      expect(result.success).toBe(false);
    });

    it('should fail when email is invalid', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'senha123',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Invalid email');
    });

    it('should fail when password is missing', () => {
      const result = loginSchema.safeParse({ email: 'joao@senai.com' });
      expect(result.success).toBe(false);
    });

    it('should fail when password is empty string', () => {
      const result = loginSchema.safeParse({
        email: 'joao@senai.com',
        password: '',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Password is required');
    });
  });

  describe('changePasswordSchema', () => {
    it('should pass with valid currentPassword and newPassword', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'Senai@123456',
        newPassword: 'novasenha123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when currentPassword is missing', () => {
      const result = changePasswordSchema.safeParse({
        newPassword: 'novasenha123',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when currentPassword is empty string', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: '',
        newPassword: 'novasenha123',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        'Current password is required',
      );
    });

    it('should fail when newPassword is missing', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'Senai@123456',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when newPassword is empty string', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'Senai@123456',
        newPassword: '',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('New password is required');
    });
  });
});
