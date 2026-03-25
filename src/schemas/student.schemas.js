const { z } = require('zod');

const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  turmaId: z.string().min(1, 'Turma ID is required'),
});

const updateStudentSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  email: z.string().email('Invalid email').optional(),
});

module.exports = { createStudentSchema, updateStudentSchema };
