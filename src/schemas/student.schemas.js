const { z } = require('zod');

const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

const updateStudentSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  email: z.string().email('Invalid email').optional(),
});

module.exports = { createStudentSchema, updateStudentSchema };
