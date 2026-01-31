const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', cardController.createCard);
router.get('/deck/:deckId', cardController.getCards);
router.get('/deck/:deckId/random', cardController.getRandomCards);
router.get('/:id', cardController.getCard);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

module.exports = router;
