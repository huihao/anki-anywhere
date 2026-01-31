const Deck = require('../models/Deck');

exports.createDeck = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    
    const deck = await Deck.create(userId, name, description);
    res.status(201).json(deck);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDecks = async (req, res) => {
  try {
    const userId = req.user.id;
    const decks = await Deck.findByUserId(userId);
    res.json(decks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const deck = await Deck.findById(id);
    
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    
    res.json(deck);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const deck = await Deck.update(id, name, description);
    res.json(deck);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDeck = async (req, res) => {
  try {
    const { id } = req.params;
    await Deck.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
