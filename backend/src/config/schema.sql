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

-- 创建笔记类型表 (Note Type / Model)
-- 定义了包含哪些字段（Fields）以及卡片生成的模板（Templates）
CREATE TABLE IF NOT EXISTS note_types (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  config JSONB DEFAULT '{}',  -- 存储字段定义、模板和 CSS 样式
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建笔记表 (Note)
-- 存储具体数据的容器（如：Front="Apple", Back="苹果"）
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  note_type_id INTEGER REFERENCES note_types(id) ON DELETE CASCADE,
  fields JSONB NOT NULL DEFAULT '[]',  -- 字段内容，使用 JSON 数组
  tags TEXT DEFAULT '',                 -- 标签，以空格分隔，支持层次化标签（如：语言::日语::动词）
  source_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建卡片表 (Card)
-- 用户真正学习的对象，由笔记根据模板自动生成
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
  deck_id INTEGER REFERENCES decks(id) ON DELETE CASCADE,
  ord INTEGER DEFAULT 0,              -- 模板序号 (第几张卡片，用于填空题)
  queue INTEGER DEFAULT 0,            -- 学习状态: 0=新卡, 1=学习中, 2=复习
  due INTEGER DEFAULT 0,              -- 下次复习时间
  ivl INTEGER DEFAULT 0,              -- 间隔时间
  factor INTEGER DEFAULT 2500,        -- 易度因子 (2500 = 2.5)
  front TEXT NOT NULL,                -- 卡片正面（渲染后的内容）
  back TEXT NOT NULL,                 -- 卡片背面（渲染后的内容）
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
CREATE INDEX IF NOT EXISTS idx_note_types_user_id ON note_types(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_note_type_id ON notes(note_type_id);
CREATE INDEX IF NOT EXISTS idx_cards_note_id ON cards(note_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_card_id ON card_reviews(card_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_user_id ON card_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_next_review_date ON card_reviews(next_review_date);

-- 插入默认笔记类型
INSERT INTO note_types (id, user_id, name, config) VALUES 
  (1, NULL, 'Basic', '{"fields": ["Front", "Back"], "templates": [{"name": "Card 1", "front": "{{Front}}", "back": "{{FrontSide}}<hr id=answer>{{Back}}"}], "css": ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }"}'),
  (2, NULL, 'Basic (and reversed card)', '{"fields": ["Front", "Back"], "templates": [{"name": "Card 1", "front": "{{Front}}", "back": "{{FrontSide}}<hr id=answer>{{Back}}"}, {"name": "Card 2", "front": "{{Back}}", "back": "{{FrontSide}}<hr id=answer>{{Front}}"}], "css": ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }"}'),
  (3, NULL, 'Cloze', '{"fields": ["Text", "Extra"], "templates": [{"name": "Cloze", "front": "{{cloze:Text}}", "back": "{{cloze:Text}}<br>{{Extra}}"}], "css": ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; } .cloze { font-weight: bold; color: blue; }"}')
ON CONFLICT DO NOTHING;
