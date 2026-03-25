const { JudgeService, LANGUAGE_IDS } = require('../../services/judge.service');

describe('JudgeService', () => {
  const makeTestCase = (overrides = {}) => ({
    input: '1 2',
    expected: '3',
    ...overrides,
  });

  const makeSut = (apiKey = null) => {
    const sut = new JudgeService('http://judge0.test', apiKey);
    return { sut };
  };

  describe('LANGUAGE_IDS', () => {
    it('should export supported language IDs', () => {
      expect(LANGUAGE_IDS.javascript).toBe(63);
      expect(LANGUAGE_IDS.python).toBe(71);
      expect(LANGUAGE_IDS.java).toBe(62);
      expect(LANGUAGE_IDS.c).toBe(50);
      expect(LANGUAGE_IDS.cpp).toBe(54);
      expect(LANGUAGE_IDS.typescript).toBe(74);
      expect(LANGUAGE_IDS.go).toBe(60);
      expect(LANGUAGE_IDS.ruby).toBe(72);
      expect(LANGUAGE_IDS.rust).toBe(73);
      expect(LANGUAGE_IDS.php).toBe(68);
    });
  });

  describe('evaluate', () => {
    it('should return passed:true when all test cases are accepted', async () => {
      // arrange
      const { sut } = makeSut();
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ status: { id: 3, description: 'Accepted' } }),
      });

      // act
      const result = await sut.evaluate('code', 'javascript', [makeTestCase()]);

      // assert
      expect(result.passed).toBe(true);
      expect(result.feedback).toBeNull();
    });

    it('should return passed:false when a test case fails', async () => {
      // arrange
      const { sut } = makeSut();
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: { id: 4, description: 'Wrong Answer' },
            stderr: null,
            compile_output: null,
          }),
      });

      // act
      const result = await sut.evaluate('code', 'javascript', [makeTestCase()]);

      // assert
      expect(result.passed).toBe(false);
      expect(result.feedback).toBe('Wrong Answer');
    });

    it('should use compile_output as feedback on compilation error', async () => {
      // arrange
      const { sut } = makeSut();
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: { id: 6, description: 'Compilation Error' },
            compile_output: 'SyntaxError: unexpected token',
            stderr: null,
          }),
      });

      // act
      const result = await sut.evaluate('code', 'javascript', [makeTestCase()]);

      // assert
      expect(result.feedback).toBe('SyntaxError: unexpected token');
    });

    it('should use stderr as feedback on runtime error', async () => {
      // arrange
      const { sut } = makeSut();
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: { id: 11, description: 'Runtime Error' },
            compile_output: null,
            stderr: 'ReferenceError: x is not defined',
          }),
      });

      // act
      const result = await sut.evaluate('code', 'javascript', [makeTestCase()]);

      // assert
      expect(result.feedback).toBe('ReferenceError: x is not defined');
    });

    it('should throw when language is unsupported', async () => {
      // arrange
      const { sut } = makeSut();

      // act / assert
      await expect(
        sut.evaluate('code', 'cobol', [makeTestCase()]),
      ).rejects.toThrow('Unsupported language: cobol');
    });

    it('should throw when Judge0 returns a non-ok response', async () => {
      // arrange
      const { sut } = makeSut();
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });

      // act / assert
      await expect(
        sut.evaluate('code', 'javascript', [makeTestCase()]),
      ).rejects.toThrow('Judge0 request failed with status 503');
    });

    it('should include X-Auth-Token header when apiKey is set', async () => {
      // arrange
      const { sut } = makeSut('secret-key');
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: { id: 3 } }),
      });

      // act
      await sut.evaluate('code', 'javascript', [makeTestCase()]);

      // assert
      const [, options] = global.fetch.mock.calls[0];
      expect(options.headers['X-Auth-Token']).toBe('secret-key');
    });

    it('should run all test cases and return passed when all pass', async () => {
      // arrange
      const { sut } = makeSut();
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: { id: 3 } }),
      });

      // act
      const result = await sut.evaluate('code', 'python', [
        makeTestCase(),
        makeTestCase({ input: '2 3', expected: '5' }),
      ]);

      // assert
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result.passed).toBe(true);
    });
  });
});
