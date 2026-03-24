const {
  createAdminSchema,
  generateTokenSchema,
} = require('../../schemas/admin.schemas');

describe('admin schemas', () => {
  describe('createAdminSchema', () => {
    it('should pass with valid name, email and password', () => {
      const result = createAdminSchema.safeParse({
        name: 'Maria Admin',
        email: 'maria@senai.com',
        password: 'senha123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when name is missing', () => {
      const result = createAdminSchema.safeParse({
        email: 'maria@senai.com',
        password: 'senha123',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when name is empty string', () => {
      const result = createAdminSchema.safeParse({
        name: '',
        email: 'maria@senai.com',
        password: 'senha123',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Name is required');
    });

    it('should fail when email is invalid', () => {
      const result = createAdminSchema.safeParse({
        name: 'Maria Admin',
        email: 'invalid',
        password: 'senha123',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Invalid email');
    });

    it('should fail when password is missing', () => {
      const result = createAdminSchema.safeParse({
        name: 'Maria Admin',
        email: 'maria@senai.com',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when password is empty string', () => {
      const result = createAdminSchema.safeParse({
        name: 'Maria Admin',
        email: 'maria@senai.com',
        password: '',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Password is required');
    });
  });

  describe('generateTokenSchema', () => {
    it('should pass with empty object (label is optional)', () => {
      const result = generateTokenSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should pass with label provided', () => {
      const result = generateTokenSchema.safeParse({ label: 'postman-local' });
      expect(result.success).toBe(true);
    });
  });
});
