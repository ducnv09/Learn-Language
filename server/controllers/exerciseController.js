const Exercise = require('../models/exercise');

const exerciseController = {
  async getByDeck(req, res, next) {
    try {
      const exercises = await Exercise.findByDeckId(req.params.deckId);
      res.json(exercises);
    } catch (err) {
      next(err);
    }
  },

  async getByFlashcard(req, res, next) {
    try {
      const exercises = await Exercise.findByFlashcardId(req.params.flashcardId);
      res.json(exercises);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = exerciseController;
