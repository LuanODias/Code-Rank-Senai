const {
  createSubmissionSchema,
  evaluateSubmissionSchema,
} = require('../../schemas/submission.schemas');

describe('submission schemas', () => {
  describe('createSubmissionSchema', () => {
    it('should pass with valid challengeId, code and language', () => {
      const result = createSubmissionSchema.safeParse({
        challengeId: 'clx1abc123',
        code: 'console.log("hello")',
        language: 'javascript',
      });
      expect(result.success).toBe(true);
    });

    it('should default language to javascript when not provided', () => {
      const result = createSubmissionSchema.safeParse({
        challengeId: 'clx1abc123',
        code: 'print("hello")',
      });
      expect(result.success).toBe(true);
      expect(result.data.language).toBe('javascript');
    });

    it('should fail when challengeId is missing', () => {
      const result = createSubmissionSchema.safeParse({
        code: 'console.log("hello")',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when challengeId is empty string', () => {
      const result = createSubmissionSchema.safeParse({
        challengeId: '',
        code: 'console.log("hello")',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Challenge ID is required');
    });

    it('should fail when code is missing', () => {
      const result = createSubmissionSchema.safeParse({
        challengeId: 'clx1abc123',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when code is empty string', () => {
      const result = createSubmissionSchema.safeParse({
        challengeId: 'clx1abc123',
        code: '',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Code is required');
    });
  });

  describe('evaluateSubmissionSchema', () => {
    it('should pass with accepted status', () => {
      const result = evaluateSubmissionSchema.safeParse({ status: 'accepted' });
      expect(result.success).toBe(true);
    });

    it('should pass with rejected status', () => {
      const result = evaluateSubmissionSchema.safeParse({ status: 'rejected' });
      expect(result.success).toBe(true);
    });

    it('should pass with optional points and feedback', () => {
      const result = evaluateSubmissionSchema.safeParse({
        status: 'accepted',
        points: 25,
        feedback: 'Good solution!',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when status is missing', () => {
      const result = evaluateSubmissionSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should fail when status is invalid', () => {
      const result = evaluateSubmissionSchema.safeParse({ status: 'pending' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        'Status must be accepted or rejected',
      );
    });

    it('should fail when points is negative', () => {
      const result = evaluateSubmissionSchema.safeParse({
        status: 'accepted',
        points: -1,
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        'Points must be a non-negative integer',
      );
    });

    it('should fail when points is not an integer', () => {
      const result = evaluateSubmissionSchema.safeParse({
        status: 'accepted',
        points: 5.5,
      });
      expect(result.success).toBe(false);
    });
  });
});
