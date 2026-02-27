const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');

router.get('/deck/:deckId', flashcardController.getByDeck);
router.post('/', flashcardController.create);
router.post('/bulk', flashcardController.createMany);
router.put('/:id', flashcardController.update);
router.delete('/:id', flashcardController.delete);
router.post('/bulk-delete', flashcardController.deleteMany);

module.exports = router;
