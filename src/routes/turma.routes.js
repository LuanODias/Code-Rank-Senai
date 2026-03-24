const { Router } = require('express');
const { makeTurmaController } = require('../factories/turma.factory');
const { requireAuth } = require('../middlewares/requireAuth');
const { requireRole } = require('../middlewares/requireRole');
const { validate } = require('../middlewares/validate');
const {
  createTurmaSchema,
  updateTurmaSchema,
} = require('../schemas/turma.schemas');
const { getAuth } = require('../config/auth');

const router = Router();
const auth = getAuth();
const controller = makeTurmaController();

router.use(requireAuth(auth));
router.use(requireRole(['teacher', 'admin', 'developer']));

router.post('/', validate(createTurmaSchema), (req, res, next) =>
  controller.create(req, res, next),
);

router.get('/', (req, res, next) => controller.getAll(req, res, next));

router.get('/:id', (req, res, next) => controller.getById(req, res, next));

router.put('/:id', validate(updateTurmaSchema), (req, res, next) =>
  controller.update(req, res, next),
);

router.delete('/:id', (req, res, next) => controller.remove(req, res, next));

router.post('/:id/students/:studentId', (req, res, next) =>
  controller.addStudent(req, res, next),
);

router.delete('/:id/students/:studentId', (req, res, next) =>
  controller.removeStudent(req, res, next),
);

module.exports = router;
