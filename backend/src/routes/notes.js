const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', noteController.createNote);
router.get('/', noteController.getNotes);
router.get('/search', noteController.searchByTags);
router.post('/check-duplicate', noteController.checkDuplicate);
router.post('/create-cloze', noteController.createClozeFromText);
router.get('/:id', noteController.getNote);
router.get('/:id/cards', noteController.getNoteCards);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
