const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');

router.get('/deck/:deckId', exerciseController.getByDeck);
router.get('/flashcard/:flashcardId', exerciseController.getByFlashcard);

module.exports = router;
