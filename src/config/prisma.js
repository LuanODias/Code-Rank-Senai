const { PrismaClient } = require('@prisma/client');

let instance = null;

const getPrismaClient = () => {
  if (!instance) instance = new PrismaClient();
  return instance;
};

module.exports = { getPrismaClient };
