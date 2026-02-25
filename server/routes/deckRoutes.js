const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');

router.get('/', deckController.getAll);
router.get('/:id', deckController.getById);
router.post('/', deckController.create);
router.put('/:id', deckController.update);
router.delete('/:id', deckController.delete);

module.exports = router;
