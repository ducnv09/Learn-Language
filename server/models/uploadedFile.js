const pool = require('../config/db');

const UploadedFile = {
  async create({ deck_id, original_name, minio_key, file_type, file_size }) {
    const result = await pool.query(
      `INSERT INTO uploaded_files (deck_id, original_name, minio_key, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [deck_id, original_name, minio_key, file_type, file_size]
    );
    return result.rows[0];
  },

  async findByDeckId(deckId) {
    const result = await pool.query(
      'SELECT * FROM uploaded_files WHERE deck_id = $1 ORDER BY uploaded_at DESC',
      [deckId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM uploaded_files WHERE id = $1', [id]);
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE uploaded_files SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM uploaded_files WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },
};

module.exports = UploadedFile;
