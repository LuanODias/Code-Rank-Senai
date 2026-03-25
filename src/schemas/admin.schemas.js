const { z } = require('zod');

const createAdminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { createAdminSchema };
