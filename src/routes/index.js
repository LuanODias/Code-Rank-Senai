const { Router } = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const teacherRoutes = require('./teacher.routes');
const challengeRoutes = require('./challenge.routes');
const studentRoutes = require('./student.routes');
const submissionRoutes = require('./submission.routes');
const turmaRoutes = require('./turma.routes');
const rankingRoutes = require('./ranking.routes');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/', authRoutes);
router.use('/admin', adminRoutes);
router.use('/teachers', teacherRoutes);
router.use('/challenges', challengeRoutes);
router.use('/students', studentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/turmas', turmaRoutes);
router.use('/rankings', rankingRoutes);

module.exports = router;
