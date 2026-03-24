const { z } = require('zod');

const createAdminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const generateTokenSchema = z.object({
  label: z.string().optional(),
});

module.exports = { createAdminSchema, generateTokenSchema };
