const pool = require('../config/database');

class Card {
  static async create(deckId, front, back, sourceUrl = null) {
    const query = `
      INSERT INTO cards (deck_id, front, back, source_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [deckId, front, back, sourceUrl]);
    return result.rows[0];
  }

  static async findByDeckId(deckId) {
    const query = 'SELECT * FROM cards WHERE deck_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [deckId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM cards WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, front, back, sourceUrl) {
    const query = `
      UPDATE cards 
      SET front = $1, back = $2, source_url = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [front, back, sourceUrl, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM cards WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async getRandomCards(deckId, limit = 10) {
    const query = `
      SELECT * FROM cards 
      WHERE deck_id = $1 
      ORDER BY RANDOM() 
      LIMIT $2
    `;
    const result = await pool.query(query, [deckId, limit]);
    return result.rows;
  }
}

module.exports = Card;
