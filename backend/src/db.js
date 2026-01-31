import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || '';

export const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS decks (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS cards (
      id SERIAL PRIMARY KEY,
      deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      front TEXT NOT NULL,
      back TEXT,
      source_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      due_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      interval_days INTEGER NOT NULL DEFAULT 0,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      repetitions INTEGER NOT NULL DEFAULT 0
    );
  `);
}
