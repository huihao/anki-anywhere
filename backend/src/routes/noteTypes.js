const express = require('express');
const router = express.Router();
const noteTypeController = require('../controllers/noteTypeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', noteTypeController.createNoteType);
router.get('/', noteTypeController.getNoteTypes);
router.get('/:id', noteTypeController.getNoteType);
router.put('/:id', noteTypeController.updateNoteType);
router.delete('/:id', noteTypeController.deleteNoteType);

module.exports = router;
