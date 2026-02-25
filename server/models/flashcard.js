const pool = require('../config/db');

const Flashcard = {
  async findByDeckId(deckId) {
    const result = await pool.query(
      'SELECT * FROM flashcards WHERE deck_id = $1 ORDER BY created_at ASC',
      [deckId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM flashcards WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create({ deck_id, word, definition, translation, pronunciation, example_sentence }) {
    const result = await pool.query(
      `INSERT INTO flashcards (deck_id, word, definition, translation, pronunciation, example_sentence)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [deck_id, word, definition, translation, pronunciation, example_sentence]
    );
    return result.rows[0];
  },

  async createMany(deckId, cards) {
    const values = [];
    const params = [];
    cards.forEach((card, i) => {
      const offset = i * 6;
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`);
      params.push(deckId, card.word, card.definition, card.translation, card.pronunciation, card.example_sentence);
    });
    const result = await pool.query(
      `INSERT INTO flashcards (deck_id, word, definition, translation, pronunciation, example_sentence)
       VALUES ${values.join(', ')} RETURNING *`,
      params
    );
    return result.rows;
  },

  async update(id, { word, definition, translation, pronunciation, example_sentence }) {
    const result = await pool.query(
      `UPDATE flashcards SET word=$1, definition=$2, translation=$3, pronunciation=$4, example_sentence=$5
       WHERE id = $6 RETURNING *`,
      [word, definition, translation, pronunciation, example_sentence, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM flashcards WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },
};

module.exports = Flashcard;
