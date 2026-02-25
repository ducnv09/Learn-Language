const pool = require('../config/db');

const Deck = {
  async findAll() {
    const result = await pool.query(
      `SELECT d.*, COUNT(f.id)::int AS card_count
       FROM decks d
       LEFT JOIN flashcards f ON f.deck_id = d.id
       GROUP BY d.id
       ORDER BY d.updated_at DESC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM decks WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create({ name, description }) {
    const result = await pool.query(
      'INSERT INTO decks (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  },

  async update(id, { name, description }) {
    const result = await pool.query(
      'UPDATE decks SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM decks WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },
};

module.exports = Deck;
