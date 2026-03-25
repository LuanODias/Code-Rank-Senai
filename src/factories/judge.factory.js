const { env } = require('../config/env');
const { JudgeService } = require('../services/judge.service');

const makeJudgeService = () => {
  if (!env.JUDGE0_API_URL) return null;
  return new JudgeService(env.JUDGE0_API_URL, env.JUDGE0_API_KEY);
};

module.exports = { makeJudgeService };
