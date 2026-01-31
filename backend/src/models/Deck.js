const pool = require('../config/database');

class Deck {
  static async create(userId, name, description) {
    const query = `
      INSERT INTO decks (user_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, name, description]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM decks WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM decks WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, name, description) {
    const query = `
      UPDATE decks 
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [name, description, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM decks WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Deck;
