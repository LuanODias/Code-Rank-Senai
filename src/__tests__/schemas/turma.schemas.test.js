const {
  createTurmaSchema,
  updateTurmaSchema,
} = require('../../schemas/turma.schemas');

describe('turma schemas', () => {
  describe('createTurmaSchema', () => {
    it('should pass with valid name', () => {
      const result = createTurmaSchema.safeParse({ name: 'Turma A' });
      expect(result.success).toBe(true);
    });

    it('should fail when name is missing', () => {
      const result = createTurmaSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should fail when name is empty string', () => {
      const result = createTurmaSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Name is required');
    });
  });

  describe('updateTurmaSchema', () => {
    it('should pass with empty object (all fields optional)', () => {
      const result = updateTurmaSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should pass with valid name', () => {
      const result = updateTurmaSchema.safeParse({ name: 'Turma B' });
      expect(result.success).toBe(true);
    });

    it('should fail when name is empty string', () => {
      const result = updateTurmaSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Name cannot be empty');
    });
  });
});
