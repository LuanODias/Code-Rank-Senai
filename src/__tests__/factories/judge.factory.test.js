jest.mock('../../services/judge.service');
jest.mock('../../config/env', () => ({
  env: { JUDGE0_API_URL: null, JUDGE0_API_KEY: null },
}));

const { JudgeService } = require('../../services/judge.service');
const { env } = require('../../config/env');

describe('makeJudgeService', () => {
  it('should return null when JUDGE0_API_URL is not set', () => {
    // arrange
    env.JUDGE0_API_URL = null;

    // act
    const { makeJudgeService } = require('../../factories/judge.factory');
    const result = makeJudgeService();

    // assert
    expect(result).toBeNull();
  });

  it('should return a JudgeService instance when JUDGE0_API_URL is set', () => {
    // arrange
    env.JUDGE0_API_URL = 'http://localhost:2358';

    // act
    const { makeJudgeService } = require('../../factories/judge.factory');
    const result = makeJudgeService();

    // assert
    expect(JudgeService).toHaveBeenCalledWith('http://localhost:2358', null);
    expect(result).toBeInstanceOf(JudgeService);
  });

  it('should pass JUDGE0_API_KEY to JudgeService when set', () => {
    // arrange
    env.JUDGE0_API_URL = 'http://localhost:2358';
    env.JUDGE0_API_KEY = 'my-secret';

    // act
    const { makeJudgeService } = require('../../factories/judge.factory');
    makeJudgeService();

    // assert
    expect(JudgeService).toHaveBeenCalledWith(
      'http://localhost:2358',
      'my-secret',
    );
  });
});
