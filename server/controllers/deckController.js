const Deck = require('../models/deck');

const deckController = {
  async getAll(req, res, next) {
    try {
      const decks = await Deck.findAll();
      res.json(decks);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const deck = await Deck.findById(req.params.id);
      if (!deck) return res.status(404).json({ error: 'Deck not found' });
      res.json(deck);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });
      const deck = await Deck.create({ name, description });
      res.status(201).json(deck);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { name, description } = req.body;
      const deck = await Deck.update(req.params.id, { name, description });
      if (!deck) return res.status(404).json({ error: 'Deck not found' });
      res.json(deck);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const deck = await Deck.delete(req.params.id);
      if (!deck) return res.status(404).json({ error: 'Deck not found' });
      res.json({ message: 'Deck deleted', deck });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = deckController;
