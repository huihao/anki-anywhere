const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');
const { validateIds, validateQuality } = require('../middleware/validate');

router.use(authMiddleware);

router.post('/review', validateIds(['cardId']), validateQuality, reviewController.reviewCard);
router.get('/due', reviewController.getDueCards);
router.get('/stats/:cardId', validateIds(['cardId']), reviewController.getReviewStats);

module.exports = router;
