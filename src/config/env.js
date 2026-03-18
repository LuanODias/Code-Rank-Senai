require('dotenv').config();

const getRequired = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Environment variable ${key} is required`);
  return value;
};

const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: getRequired('DATABASE_URL'),
  BETTER_AUTH_SECRET: getRequired('BETTER_AUTH_SECRET'),
  BETTER_AUTH_URL: getRequired('BETTER_AUTH_URL'),
  ADMIN_SECRET: getRequired('ADMIN_SECRET'),
};

module.exports = { env };
