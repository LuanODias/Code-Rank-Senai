const { Router } = require('express');
const { makeTeacherController } = require('../factories/teacher.factory');
const { requireAuth } = require('../middlewares/requireAuth');
const { requireRole } = require('../middlewares/requireRole');
const { getAuth } = require('../config/auth');

const router = Router();
const auth = getAuth();
const controller = makeTeacherController();

router.use(requireAuth(auth));
router.use(requireRole(['admin', 'developer']));

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.remove(req, res, next));

module.exports = router;
