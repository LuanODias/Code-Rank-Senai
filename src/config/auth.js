const { betterAuth } = require('better-auth');
const { prismaAdapter } = require('better-auth/adapters/prisma');
const { admin } = require('better-auth/plugins');
const { getPrismaClient } = require('./prisma');
const { env } = require('./env');

const createAuth = () =>
  betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: prismaAdapter(getPrismaClient(), {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [admin()],
  });

let instance = null;

const getAuth = () => {
  if (!instance) instance = createAuth();
  return instance;
};

module.exports = { getAuth };
