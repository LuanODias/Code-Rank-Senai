const { Router } = require('express');
const teacherRoutes = require('./teacher.routes');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/teachers', teacherRoutes);

module.exports = router;
