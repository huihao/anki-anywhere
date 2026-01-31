const pool = require('../config/database');

class CardReview {
  // SM-2 算法实现 (SuperMemo-2 间隔重复算法)
  static async reviewCard(cardId, userId, quality) {
    // quality: 0-5, 0最差，5最好
    const review = await this.getReview(cardId, userId);
    
    let { easeFactor, interval, repetitions } = review || {
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0
    };

    if (quality >= 3) {
      // 回答正确
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      // 回答错误，重置
      repetitions = 0;
      interval = 1;
    }

    // 更新ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    const query = `
      INSERT INTO card_reviews (card_id, user_id, ease_factor, interval, repetitions, next_review_date, last_review_date)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (card_id, user_id)
      DO UPDATE SET
        ease_factor = $3,
        interval = $4,
        repetitions = $5,
        next_review_date = $6,
        last_review_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      cardId, userId, easeFactor, interval, repetitions, nextReviewDate
    ]);
    return result.rows[0];
  }

  static async getReview(cardId, userId) {
    const query = 'SELECT * FROM card_reviews WHERE card_id = $1 AND user_id = $2';
    const result = await pool.query(query, [cardId, userId]);
    return result.rows[0];
  }

  static async getDueCards(userId, deckId = null) {
    let query = `
      SELECT c.*, cr.next_review_date, cr.interval, cr.repetitions
      FROM cards c
      LEFT JOIN card_reviews cr ON c.id = cr.card_id AND cr.user_id = $1
      WHERE (cr.next_review_date IS NULL OR cr.next_review_date <= CURRENT_TIMESTAMP)
    `;
    
    const params = [userId];
    if (deckId) {
      query += ' AND c.deck_id = $2';
      params.push(deckId);
    }
    
    query += ' ORDER BY cr.next_review_date ASC NULLS FIRST';
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = CardReview;
