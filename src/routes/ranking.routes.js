const { Router } = require('express');
const { makeRankingController } = require('../factories/ranking.factory');
const { requireAuth } = require('../middlewares/requireAuth');
const { getAuth } = require('../config/auth');

const router = Router();
const auth = getAuth();
const controller = makeRankingController();

router.use(requireAuth(auth));

router.get('/students', (req, res, next) =>
  controller.getStudents(req, res, next),
);

router.get('/turmas', (req, res, next) => controller.getTurmas(req, res, next));

module.exports = router;
