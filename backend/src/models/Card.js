const pool = require('../config/database');

// Number of parameters per card for batch insert
const CARD_PARAM_COUNT = 6;

class Card {
  static async create(deckId, front, back, sourceUrl = null, noteId = null, ord = 0) {
    const query = `
      INSERT INTO cards (deck_id, front, back, source_url, note_id, ord)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [deckId, front, back, sourceUrl, noteId, ord]);
    return result.rows[0];
  }

  /**
   * Create multiple cards at once (for cloze notes that generate multiple cards)
   */
  static async createMany(cards) {
    if (cards.length === 0) return [];
    
    const values = cards.map((card, i) => {
      const offset = i * CARD_PARAM_COUNT;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
    }).join(', ');
    
    const params = cards.flatMap(card => [
      card.deck_id,
      card.front,
      card.back,
      card.source_url || null,
      card.note_id || null,
      card.ord || 0
    ]);
    
    const query = `
      INSERT INTO cards (deck_id, front, back, source_url, note_id, ord)
      VALUES ${values}
      RETURNING *
    `;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findByDeckId(deckId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    const query = 'SELECT * FROM cards WHERE deck_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    const result = await pool.query(query, [deckId, limit, offset]);
    return result.rows;
  }

  static async countByDeckId(deckId) {
    const query = 'SELECT COUNT(*) as total FROM cards WHERE deck_id = $1';
    const result = await pool.query(query, [deckId]);
    return parseInt(result.rows[0].total, 10);
  }

  static async findById(id) {
    const query = 'SELECT * FROM cards WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByNoteId(noteId) {
    const query = 'SELECT * FROM cards WHERE note_id = $1 ORDER BY ord ASC';
    const result = await pool.query(query, [noteId]);
    return result.rows;
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

  static async deleteByNoteId(noteId) {
    const query = 'DELETE FROM cards WHERE note_id = $1';
    await pool.query(query, [noteId]);
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

  /**
   * Update all cards associated with a note when the note is modified
   */
  static async updateModifiedTimeByNoteId(noteId) {
    const query = `
      UPDATE cards 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE note_id = $1
    `;
    await pool.query(query, [noteId]);
  }
}

module.exports = Card;
