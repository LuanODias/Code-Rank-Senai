const { z } = require('zod');
const { LANGUAGE_IDS } = require('../services/judge.service');

const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_IDS);

const createSubmissionSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  code: z.string().min(1, 'Code is required'),
  language: z
    .string()
    .refine((val) => SUPPORTED_LANGUAGES.includes(val), {
      message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
    })
    .default('javascript'),
});

const evaluateSubmissionSchema = z.object({
  status: z.string().refine((val) => ['accepted', 'rejected'].includes(val), {
    message: 'Status must be accepted or rejected',
  }),
  points: z
    .number()
    .int()
    .nonnegative('Points must be a non-negative integer')
    .optional(),
  feedback: z.string().optional(),
});

module.exports = { createSubmissionSchema, evaluateSubmissionSchema };
