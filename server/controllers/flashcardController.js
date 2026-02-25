const Flashcard = require('../models/flashcard');

const flashcardController = {
  async getByDeck(req, res, next) {
    try {
      const cards = await Flashcard.findByDeckId(req.params.deckId);
      res.json(cards);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { deck_id, word, definition, translation, pronunciation, example_sentence } = req.body;
      if (!deck_id || !word) return res.status(400).json({ error: 'deck_id and word are required' });
      const card = await Flashcard.create({ deck_id, word, definition, translation, pronunciation, example_sentence });
      res.status(201).json(card);
    } catch (err) {
      next(err);
    }
  },

  async createMany(req, res, next) {
    try {
      const { deck_id, cards } = req.body;
      if (!deck_id || !cards || !cards.length) {
        return res.status(400).json({ error: 'deck_id and cards array are required' });
      }
      const created = await Flashcard.createMany(deck_id, cards);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { word, definition, translation, pronunciation, example_sentence } = req.body;
      const card = await Flashcard.update(req.params.id, { word, definition, translation, pronunciation, example_sentence });
      if (!card) return res.status(404).json({ error: 'Flashcard not found' });
      res.json(card);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const card = await Flashcard.delete(req.params.id);
      if (!card) return res.status(404).json({ error: 'Flashcard not found' });
      res.json({ message: 'Flashcard deleted', card });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = flashcardController;
