const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/review', reviewController.reviewCard);
router.get('/due', reviewController.getDueCards);
router.get('/stats/:cardId', reviewController.getReviewStats);

module.exports = router;
