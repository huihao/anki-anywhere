import express from 'express';
import cors from 'cors';
import { ensureSchema, query } from './db.js';
import { scheduleReview } from './scheduler.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/decks', async (req, res) => {
  try {
    const result = await query('SELECT id, name FROM decks ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load decks.' });
  }
});

app.post('/decks', async (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Deck name is required.' });
  }

  try {
    const result = await query(
      'INSERT INTO decks (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id, name',
      [name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create deck.' });
  }
});

app.post('/cards', async (req, res) => {
  const { deckId, front, back, sourceUrl } = req.body || {};
  if (!deckId || !front) {
    return res.status(400).json({ error: 'deckId and front are required.' });
  }

  try {
    const result = await query(
      `INSERT INTO cards (deck_id, front, back, source_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, deck_id AS "deckId", front, back, source_url AS "sourceUrl"`,
      [deckId, front, back || null, sourceUrl || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create card.' });
  }
});

app.get('/decks/:deckId/cards/random', async (req, res) => {
  const deckId = Number(req.params.deckId);
  if (!Number.isInteger(deckId)) {
    return res.status(400).json({ error: 'Invalid deck id.' });
  }

  try {
    const result = await query(
      `SELECT id, front, back, source_url AS "sourceUrl"
       FROM cards
       WHERE deck_id = $1
       ORDER BY RANDOM()
       LIMIT 1`,
      [deckId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No cards found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load card.' });
  }
});

app.post('/cards/:cardId/review', async (req, res) => {
  const cardId = Number(req.params.cardId);
  const { rating } = req.body || {};
  if (!Number.isInteger(cardId) || typeof rating !== 'number') {
    return res.status(400).json({ error: 'Invalid review payload.' });
  }

  const score = Math.min(Math.max(rating, 0), 5);

  try {
    const result = await query('SELECT id, interval_days, ease_factor, repetitions FROM cards WHERE id = $1', [cardId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found.' });
    }

    const card = result.rows[0];
    const { intervalDays, easeFactor, repetitions } = scheduleReview(score, {\n      intervalDays: card.interval_days,\n      easeFactor: card.ease_factor,\n      repetitions: card.repetitions,\n    });

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + intervalDays);

    const update = await query(
      `UPDATE cards
       SET repetitions = $1,
           interval_days = $2,
           ease_factor = $3,
           due_at = $4
       WHERE id = $5
       RETURNING id, interval_days AS "intervalDays", ease_factor AS "easeFactor", due_at AS "dueAt"`,
      [repetitions, intervalDays, easeFactor, dueAt, cardId]
    );

    res.json(update.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record review.' });
  }
});

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
