const {
  createChallengeSchema,
  updateChallengeSchema,
} = require('../../schemas/challenge.schemas');

describe('challenge schemas', () => {
  describe('createChallengeSchema', () => {
    it('should pass with valid title, description and difficulty', () => {
      const result = createChallengeSchema.safeParse({
        title: 'Soma de Dois Números',
        description: 'Dado dois inteiros, retorne a soma.',
        difficulty: 'easy',
      });
      expect(result.success).toBe(true);
    });

    it('should default difficulty to medium when not provided', () => {
      const result = createChallengeSchema.safeParse({
        title: 'Soma de Dois Números',
        description: 'Dado dois inteiros, retorne a soma.',
      });
      expect(result.success).toBe(true);
      expect(result.data.difficulty).toBe('medium');
    });

    it('should fail when title is missing', () => {
      const result = createChallengeSchema.safeParse({
        description: 'Dado dois inteiros, retorne a soma.',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when title is empty string', () => {
      const result = createChallengeSchema.safeParse({
        title: '',
        description: 'Dado dois inteiros, retorne a soma.',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Title is required');
    });

    it('should fail when description is missing', () => {
      const result = createChallengeSchema.safeParse({
        title: 'Soma de Dois Números',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when description is empty string', () => {
      const result = createChallengeSchema.safeParse({
        title: 'Soma de Dois Números',
        description: '',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Description is required');
    });

    it('should fail when difficulty is invalid', () => {
      const result = createChallengeSchema.safeParse({
        title: 'Soma de Dois Números',
        description: 'Dado dois inteiros, retorne a soma.',
        difficulty: 'impossible',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        'Difficulty must be one of: easy, medium, hard',
      );
    });

    it('should accept all valid difficulty values', () => {
      for (const difficulty of ['easy', 'medium', 'hard']) {
        const result = createChallengeSchema.safeParse({
          title: 'Título',
          description: 'Descrição',
          difficulty,
        });
        expect(result.success).toBe(true);
        expect(result.data.difficulty).toBe(difficulty);
      }
    });
  });

  describe('updateChallengeSchema', () => {
    it('should pass with empty object (all fields optional)', () => {
      const result = updateChallengeSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should pass with only title provided', () => {
      const result = updateChallengeSchema.safeParse({ title: 'Novo Título' });
      expect(result.success).toBe(true);
    });

    it('should pass with only description provided', () => {
      const result = updateChallengeSchema.safeParse({
        description: 'Nova descrição',
      });
      expect(result.success).toBe(true);
    });

    it('should pass with only difficulty provided', () => {
      const result = updateChallengeSchema.safeParse({ difficulty: 'hard' });
      expect(result.success).toBe(true);
    });

    it('should fail when title is empty string', () => {
      const result = updateChallengeSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Title cannot be empty');
    });

    it('should fail when description is empty string', () => {
      const result = updateChallengeSchema.safeParse({ description: '' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        'Description cannot be empty',
      );
    });

    it('should fail when difficulty is invalid', () => {
      const result = updateChallengeSchema.safeParse({
        difficulty: 'impossible',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        'Difficulty must be one of: easy, medium, hard',
      );
    });
  });
});
