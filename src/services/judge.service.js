const LANGUAGE_IDS = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  go: 60,
  ruby: 72,
  rust: 73,
  php: 68,
};

class JudgeService {
  constructor(apiUrl, apiKey = null) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async runTestCase(code, languageId, input, expected) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['X-Auth-Token'] = this.apiKey;

    const res = await fetch(
      `${this.apiUrl}/submissions?base64_encoded=false&wait=true`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: input,
          expected_output: expected,
        }),
      },
    );

    if (!res.ok)
      throw new Error(`Judge0 request failed with status ${res.status}`);

    return res.json();
  }

  async evaluate(code, language, testCases) {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) throw new Error(`Unsupported language: ${language}`);

    const results = await Promise.all(
      testCases.map((tc) =>
        this.runTestCase(code, languageId, tc.input, tc.expected),
      ),
    );

    const firstFail = results.find((r) => r.status?.id !== 3);
    if (!firstFail) return { passed: true, feedback: null };

    const feedback =
      firstFail.compile_output?.trim() ||
      firstFail.stderr?.trim() ||
      firstFail.status?.description ||
      'Wrong answer';

    return { passed: false, feedback };
  }
}

module.exports = { JudgeService, LANGUAGE_IDS };
