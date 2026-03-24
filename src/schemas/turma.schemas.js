const { z } = require('zod');

const createTurmaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

const updateTurmaSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
});

module.exports = { createTurmaSchema, updateTurmaSchema };
