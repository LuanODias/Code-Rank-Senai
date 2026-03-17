const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { env } = require('./env');

let instance = null;

const getPrismaClient = () => {
  if (!instance) {
    const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
    instance = new PrismaClient({ adapter });
  }
  return instance;
};

module.exports = { getPrismaClient };
