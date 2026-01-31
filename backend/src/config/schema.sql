-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建卡牌组表
CREATE TABLE IF NOT EXISTS decks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建卡片表
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  deck_id INTEGER REFERENCES decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建学习记录表（用于间隔重复算法）
CREATE TABLE IF NOT EXISTS card_reviews (
  id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ease_factor DECIMAL(3, 2) DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_review_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(card_id, user_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_card_id ON card_reviews(card_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_user_id ON card_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_next_review_date ON card_reviews(next_review_date);
