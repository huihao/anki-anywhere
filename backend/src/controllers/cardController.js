const Card = require('../models/Card');

exports.createCard = async (req, res) => {
  try {
    const { deckId, front, back, sourceUrl } = req.body;
    
    const card = await Card.create(deckId, front, back, sourceUrl);
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCards = async (req, res) => {
  try {
    const { deckId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = (page - 1) * limit;
    
    const [cards, total] = await Promise.all([
      Card.findByDeckId(deckId, { limit, offset }),
      Card.countByDeckId(deckId)
    ]);
    
    res.json({
      data: cards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { front, back, sourceUrl } = req.body;
    
    const card = await Card.update(id, front, back, sourceUrl);
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    await Card.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRandomCards = async (req, res) => {
  try {
    const { deckId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const cards = await Card.getRandomCards(deckId, limit);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
