const { z } = require('zod');

const difficultyEnum = z
  .string()
  .refine((val) => ['easy', 'medium', 'hard'].includes(val), {
    message: 'Difficulty must be one of: easy, medium, hard',
  });

const createChallengeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: difficultyEnum.optional().default('medium'),
});

const updateChallengeSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().min(1, 'Description cannot be empty').optional(),
  difficulty: difficultyEnum.optional(),
});

const createTestCaseSchema = z.object({
  input: z.string().default(''),
  expected: z.string().min(1, 'Expected output is required'),
});

module.exports = {
  createChallengeSchema,
  updateChallengeSchema,
  createTestCaseSchema,
};
