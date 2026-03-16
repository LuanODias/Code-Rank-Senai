const { Router } = require('express');
const exampleController = require('../controllers/example.controller');

const router = Router();

router.get('/', exampleController.getAll);
router.get('/:id', exampleController.getById);
router.post('/', exampleController.create);
router.put('/:id', exampleController.update);
router.delete('/:id', exampleController.remove);

module.exports = router;
