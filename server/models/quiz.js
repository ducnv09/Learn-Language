const pool = require('../config/db');

const QuizBank = {
  async findAll() {
    const result = await pool.query(
      `SELECT qb.*, COUNT(q.id)::int AS question_count
       FROM quiz_banks qb
       LEFT JOIN questions q ON q.quiz_bank_id = qb.id
       GROUP BY qb.id
       ORDER BY qb.updated_at DESC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM quiz_banks WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create({ title, description }) {
    const result = await pool.query(
      'INSERT INTO quiz_banks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    return result.rows[0];
  },

  async update(id, { title, description }) {
    const result = await pool.query(
      'UPDATE quiz_banks SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM questions WHERE quiz_bank_id = $1', [id]);
    const result = await pool.query('DELETE FROM quiz_banks WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

const QuizQuestion = {
  async findByQuizBankId(quizBankId) {
    const result = await pool.query(
      'SELECT * FROM questions WHERE quiz_bank_id = $1 ORDER BY id ASC',
      [quizBankId]
    );
    return result.rows;
  },

  async createBatch(quizBankId, questions) {
    if (!questions || questions.length === 0) return [];

    const values = [];
    const queryParams = [];
    let paramIndex = 1;

    questions.forEach((q) => {
      values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      queryParams.push(
        quizBankId,
        q.questionText,
        JSON.stringify(q.options),
        JSON.stringify(q.correctAnswers),
        q.explanation || '',
        q.questionType
      );
    });

    const query = `
      INSERT INTO questions (quiz_bank_id, question_text, options, correct_answers, explanation, question_type)
      VALUES ${values.join(', ')}
      RETURNING *
    `;

    const result = await pool.query(query, queryParams);
    return result.rows;
  }
};

module.exports = { QuizBank, QuizQuestion };
