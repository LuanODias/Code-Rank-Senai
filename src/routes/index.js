const { Router } = require('express');
const exampleRoutes = require('./example.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/examples', exampleRoutes);

module.exports = router;
