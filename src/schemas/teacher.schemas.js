const { z } = require('zod');

const createTeacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

const updateTeacherSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  email: z.string().email('Invalid email').optional(),
});

module.exports = { createTeacherSchema, updateTeacherSchema };
