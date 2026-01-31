const pool = require('../config/database');

class Note {
  static async create(noteTypeId, fields, tags = '', sourceUrl = null) {
    const query = `
      INSERT INTO notes (note_type_id, fields, tags, source_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [noteTypeId, JSON.stringify(fields), tags, sourceUrl]);
    return result.rows[0];
  }

  static async findByNoteTypeId(noteTypeId) {
    const query = 'SELECT * FROM notes WHERE note_type_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [noteTypeId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM notes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, fields, tags, sourceUrl) {
    const query = `
      UPDATE notes 
      SET fields = $1, tags = $2, source_url = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [JSON.stringify(fields), tags, sourceUrl, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM notes WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Check for duplicate notes based on the first field content
   * @param {number} noteTypeId - The note type ID
   * @param {string} firstFieldValue - The value of the first field
   * @param {number} excludeNoteId - Optional note ID to exclude (for updates)
   * @returns {Array} - Array of duplicate notes
   */
  static async findDuplicates(noteTypeId, firstFieldValue, excludeNoteId = null) {
    let query = `
      SELECT * FROM notes 
      WHERE note_type_id = $1 
      AND fields->0 = $2
    `;
    const params = [noteTypeId, JSON.stringify(firstFieldValue)];
    
    if (excludeNoteId) {
      query += ' AND id != $3';
      params.push(excludeNoteId);
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Search notes by tags
   * @param {string} tagPattern - Tag pattern to search (supports hierarchical tags with ::)
   * @returns {Array} - Array of matching notes
   */
  static async findByTags(tagPattern) {
    const query = `
      SELECT * FROM notes 
      WHERE tags LIKE $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [`%${tagPattern}%`]);
    return result.rows;
  }

  /**
   * Get parsed fields as an object
   */
  static getFieldsObject(note, fieldNames) {
    const fields = typeof note.fields === 'string' 
      ? JSON.parse(note.fields) 
      : note.fields;
    
    const fieldsMap = {};
    fieldNames.forEach((name, index) => {
      fieldsMap[name] = fields[index] || '';
    });
    return fieldsMap;
  }

  /**
   * Get tags as an array
   */
  static getTagsArray(note) {
    if (!note.tags || note.tags.trim() === '') {
      return [];
    }
    return note.tags.trim().split(/\s+/);
  }
}

module.exports = Note;
