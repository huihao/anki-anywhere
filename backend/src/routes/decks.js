const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const authMiddleware = require('../middleware/auth');
const { requireFields, validateIds, sanitizeStrings } = require('../middleware/validate');

router.use(authMiddleware);

router.post('/', 
  sanitizeStrings(['name', 'description']),
  requireFields(['name']),
  deckController.createDeck
);
router.get('/', deckController.getDecks);
router.get('/:id', validateIds(['id']), deckController.getDeck);
router.put('/:id', 
  validateIds(['id']),
  sanitizeStrings(['name', 'description']),
  deckController.updateDeck
);
router.delete('/:id', validateIds(['id']), deckController.deleteDeck);

module.exports = router;
