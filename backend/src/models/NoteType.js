const pool = require('../config/database');

class NoteType {
  static async create(userId, name, config = {}) {
    const query = `
      INSERT INTO note_types (user_id, name, config)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, name, JSON.stringify(config)]);
    return result.rows[0];
  }

  static async findAll(userId = null) {
    // Get both system note types (user_id is null) and user's custom note types
    const query = `
      SELECT * FROM note_types 
      WHERE user_id IS NULL OR user_id = $1
      ORDER BY id ASC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM note_types WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, name, config) {
    const query = `
      UPDATE note_types 
      SET name = $1, config = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [name, JSON.stringify(config), id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM note_types WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Get field names from a note type
   */
  static getFieldNames(noteType) {
    const config = typeof noteType.config === 'string' 
      ? JSON.parse(noteType.config) 
      : noteType.config;
    return config.fields || [];
  }

  /**
   * Get templates from a note type
   */
  static getTemplates(noteType) {
    const config = typeof noteType.config === 'string' 
      ? JSON.parse(noteType.config) 
      : noteType.config;
    return config.templates || [];
  }

  /**
   * Get CSS from a note type
   */
  static getCSS(noteType) {
    const config = typeof noteType.config === 'string' 
      ? JSON.parse(noteType.config) 
      : noteType.config;
    return config.css || '';
  }
}

module.exports = NoteType;
