const {
  createTeacherSchema,
  updateTeacherSchema,
} = require('../../schemas/teacher.schemas');

describe('teacher schemas', () => {
  describe('createTeacherSchema', () => {
    it('should pass with valid name and email', () => {
      const result = createTeacherSchema.safeParse({
        name: 'João Silva',
        email: 'joao@senai.com',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when name is missing', () => {
      const result = createTeacherSchema.safeParse({ email: 'joao@senai.com' });
      expect(result.success).toBe(false);
    });

    it('should fail when name is empty string', () => {
      const result = createTeacherSchema.safeParse({
        name: '',
        email: 'joao@senai.com',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Name is required');
    });

    it('should fail when email is missing', () => {
      const result = createTeacherSchema.safeParse({ name: 'João Silva' });
      expect(result.success).toBe(false);
    });

    it('should fail when email is invalid', () => {
      const result = createTeacherSchema.safeParse({
        name: 'João Silva',
        email: 'invalid',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Invalid email');
    });
  });

  describe('updateTeacherSchema', () => {
    it('should pass with empty object (all fields optional)', () => {
      const result = updateTeacherSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should pass with only name provided', () => {
      const result = updateTeacherSchema.safeParse({ name: 'Maria Silva' });
      expect(result.success).toBe(true);
    });

    it('should pass with only email provided', () => {
      const result = updateTeacherSchema.safeParse({
        email: 'maria@senai.com',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when name is empty string', () => {
      const result = updateTeacherSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Name cannot be empty');
    });

    it('should fail when email is invalid', () => {
      const result = updateTeacherSchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Invalid email');
    });
  });
});
