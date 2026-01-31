const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const deckRoutes = require('./routes/decks');
const cardRoutes = require('./routes/cards');
const reviewRoutes = require('./routes/reviews');
const noteTypeRoutes = require('./routes/noteTypes');
const noteRoutes = require('./routes/notes');
const { apiRateLimit } = require('./middleware/rateLimit');
const { requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for accurate IP detection (needed for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' })); // Limit payload size for security
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Request logging (development only by default)
app.use(requestLogger());

// Rate limiting for API routes
app.use('/api', apiRateLimit);

// Routes
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/note-types', noteTypeRoutes);
app.use('/api/notes', noteRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
