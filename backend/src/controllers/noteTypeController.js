const NoteType = require('../models/NoteType');

exports.createNoteType = async (req, res) => {
  try {
    const { name, config } = req.body;
    const userId = req.userId || null;
    
    const noteType = await NoteType.create(userId, name, config);
    res.status(201).json(noteType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNoteTypes = async (req, res) => {
  try {
    const userId = req.userId || null;
    const noteTypes = await NoteType.findAll(userId);
    res.json(noteTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNoteType = async (req, res) => {
  try {
    const { id } = req.params;
    const noteType = await NoteType.findById(id);
    
    if (!noteType) {
      return res.status(404).json({ error: 'Note type not found' });
    }
    
    res.json(noteType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNoteType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, config } = req.body;
    
    const noteType = await NoteType.update(id, name, config);
    res.json(noteType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNoteType = async (req, res) => {
  try {
    const { id } = req.params;
    await NoteType.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
