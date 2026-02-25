const pool = require('../config/db');

const Exercise = {
  async findByFlashcardId(flashcardId) {
    const result = await pool.query(
      'SELECT * FROM exercises WHERE flashcard_id = $1 ORDER BY created_at ASC',
      [flashcardId]
    );
    return result.rows;
  },

  async findByDeckId(deckId) {
    const result = await pool.query(
      `SELECT e.* FROM exercises e
       JOIN flashcards f ON f.id = e.flashcard_id
       WHERE f.deck_id = $1
       ORDER BY e.created_at ASC`,
      [deckId]
    );
    return result.rows;
  },

  async create({ flashcard_id, type, question, options, correct_answer }) {
    const result = await pool.query(
      `INSERT INTO exercises (flashcard_id, type, question, options, correct_answer)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [flashcard_id, type, question, JSON.stringify(options), correct_answer]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM exercises WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },
};

module.exports = Exercise;
