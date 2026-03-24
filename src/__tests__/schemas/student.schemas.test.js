const {
  createStudentSchema,
  updateStudentSchema,
} = require('../../schemas/student.schemas');

describe('student schemas', () => {
  describe('createStudentSchema', () => {
    it('should pass with valid name and email', () => {
      const result = createStudentSchema.safeParse({
        name: 'João Silva',
        email: 'joao@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when name is missing', () => {
      const result = createStudentSchema.safeParse({
        email: 'joao@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when name is empty string', () => {
      const result = createStudentSchema.safeParse({
        name: '',
        email: 'joao@example.com',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Name is required');
    });

    it('should fail when email is missing', () => {
      const result = createStudentSchema.safeParse({ name: 'João Silva' });
      expect(result.success).toBe(false);
    });

    it('should fail when email is invalid', () => {
      const result = createStudentSchema.safeParse({
        name: 'João Silva',
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Invalid email');
    });
  });

  describe('updateStudentSchema', () => {
    it('should pass with empty object (all fields optional)', () => {
      const result = updateStudentSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should pass with only name provided', () => {
      const result = updateStudentSchema.safeParse({ name: 'Novo Nome' });
      expect(result.success).toBe(true);
    });

    it('should pass with only email provided', () => {
      const result = updateStudentSchema.safeParse({
        email: 'novo@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when name is empty string', () => {
      const result = updateStudentSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Name cannot be empty');
    });

    it('should fail when email is invalid', () => {
      const result = updateStudentSchema.safeParse({ email: 'bad-email' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Invalid email');
    });
  });
});
