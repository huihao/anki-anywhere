const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', deckController.createDeck);
router.get('/', deckController.getDecks);
router.get('/:id', deckController.getDeck);
router.put('/:id', deckController.updateDeck);
router.delete('/:id', deckController.deleteDeck);

module.exports = router;
