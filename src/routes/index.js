const { Router } = require('express');
const teacherRoutes = require('./teacher.routes');
const adminRoutes = require('./admin.routes');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/admin', adminRoutes);
router.use('/teachers', teacherRoutes);

module.exports = router;
