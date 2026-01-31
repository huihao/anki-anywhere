const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/auth');
const { requireFields, validateIds, sanitizeStrings } = require('../middleware/validate');

router.use(authMiddleware);

router.post('/', 
  sanitizeStrings(['front', 'back']),
  requireFields(['deckId', 'front', 'back']),
  validateIds(['deckId']),
  cardController.createCard
);
router.get('/deck/:deckId', validateIds(['deckId']), cardController.getCards);
router.get('/deck/:deckId/random', validateIds(['deckId']), cardController.getRandomCards);
router.get('/:id', validateIds(['id']), cardController.getCard);
router.put('/:id', 
  validateIds(['id']),
  sanitizeStrings(['front', 'back']),
  cardController.updateCard
);
router.delete('/:id', validateIds(['id']), cardController.deleteCard);

module.exports = router;
