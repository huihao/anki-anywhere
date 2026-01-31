const CardReview = require('../models/CardReview');

exports.reviewCard = async (req, res) => {
  try {
    const { cardId, quality } = req.body;
    const userId = req.user.id;
    
    // Quality is already validated by middleware
    const review = await CardReview.reviewCard(cardId, userId, quality);
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDueCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deckId } = req.query;
    
    const cards = await CardReview.getDueCards(userId, deckId);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewStats = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;
    
    const review = await CardReview.getReview(cardId, userId);
    res.json(review || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
