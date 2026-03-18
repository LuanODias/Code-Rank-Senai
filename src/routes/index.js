const { Router } = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const teacherRoutes = require('./teacher.routes');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/', authRoutes);
router.use('/admin', adminRoutes);
router.use('/teachers', teacherRoutes);

module.exports = router;
