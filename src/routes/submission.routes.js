const { Router } = require('express');
const { makeSubmissionController } = require('../factories/submission.factory');
const { requireAuth } = require('../middlewares/requireAuth');
const { validate } = require('../middlewares/validate');
const {
  createSubmissionSchema,
  evaluateSubmissionSchema,
} = require('../schemas/submission.schemas');
const { getAuth } = require('../config/auth');

const router = Router();
const auth = getAuth();
const controller = makeSubmissionController();

router.use(requireAuth(auth));

router.post('/', validate(createSubmissionSchema), (req, res, next) =>
  controller.submit(req, res, next),
);

router.get('/', (req, res, next) => controller.getAll(req, res, next));

router.get('/:id', (req, res, next) => controller.getById(req, res, next));

router.put(
  '/:id/evaluate',
  validate(evaluateSubmissionSchema),
  (req, res, next) => controller.evaluate(req, res, next),
);

module.exports = router;
