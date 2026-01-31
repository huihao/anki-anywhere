const Note = require('../models/Note');
const NoteType = require('../models/NoteType');
const Card = require('../models/Card');
const { generateCardsFromNote } = require('../utils/templateEngine');
const { createCloze, getNextClozeIndex } = require('../utils/cloze');

exports.createNote = async (req, res) => {
  try {
    const { noteTypeId, fields, tags, sourceUrl, deckId } = req.body;
    
    // Validate note type exists
    const noteType = await NoteType.findById(noteTypeId);
    if (!noteType) {
      return res.status(400).json({ error: 'Invalid note type' });
    }
    
    // Create the note
    const note = await Note.create(noteTypeId, fields, tags, sourceUrl);
    
    // Generate cards from the note
    if (deckId) {
      const cardsToCreate = generateCardsFromNote(note, noteType, deckId);
      if (cardsToCreate.length > 0) {
        await Card.createMany(cardsToCreate);
      }
    }
    
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { noteTypeId } = req.query;
    if (noteTypeId) {
      const notes = await Note.findByNoteTypeId(noteTypeId);
      res.json(notes);
    } else {
      res.status(400).json({ error: 'noteTypeId query parameter is required' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { fields, tags, sourceUrl, deckId, regenerateCards } = req.body;
    
    const note = await Note.update(id, fields, tags, sourceUrl);
    
    // If regenerateCards is true, delete old cards and generate new ones
    if (regenerateCards && deckId) {
      await Card.deleteByNoteId(id);
      
      const noteType = await NoteType.findById(note.note_type_id);
      const cardsToCreate = generateCardsFromNote(note, noteType, deckId);
      if (cardsToCreate.length > 0) {
        await Card.createMany(cardsToCreate);
      }
    } else {
      // Just update the modified time on associated cards
      await Card.updateModifiedTimeByNoteId(id);
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    // Cards will be deleted automatically due to CASCADE
    await Note.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check for duplicate notes based on the first field
 */
exports.checkDuplicate = async (req, res) => {
  try {
    const { noteTypeId, firstFieldValue, excludeNoteId } = req.body;
    
    const duplicates = await Note.findDuplicates(noteTypeId, firstFieldValue, excludeNoteId);
    
    res.json({
      hasDuplicate: duplicates.length > 0,
      duplicates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search notes by tags
 */
exports.searchByTags = async (req, res) => {
  try {
    const { tag } = req.query;
    
    if (!tag) {
      return res.status(400).json({ error: 'tag query parameter is required' });
    }
    
    const notes = await Note.findByTags(tag);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a cloze deletion from selected text
 */
exports.createClozeFromText = async (req, res) => {
  try {
    const { text, existingText, index, hint } = req.body;
    
    // If existingText is provided, calculate the next index
    let clozeIndex = index;
    if (!clozeIndex && existingText) {
      clozeIndex = getNextClozeIndex(existingText);
    }
    clozeIndex = clozeIndex || 1;
    
    const clozeText = createCloze(text, clozeIndex, hint);
    
    res.json({
      clozeText,
      index: clozeIndex
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get cards associated with a note
 */
exports.getNoteCards = async (req, res) => {
  try {
    const { id } = req.params;
    const cards = await Card.findByNoteId(id);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
