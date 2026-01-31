/**
 * Template Rendering Engine
 * 
 * Renders card templates by replacing placeholders with actual field values.
 * Supports:
 * - Basic field replacement: {{FieldName}}
 * - Cloze deletions: {{cloze:FieldName}}
 * - FrontSide reference: {{FrontSide}}
 */

const { hasCloze, renderCloze, getMaxClozeIndex } = require('./cloze');

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
}

/**
 * Render a template with field values
 * @param {string} template - The template string with placeholders
 * @param {Object} fieldsMap - Object mapping field names to their values
 * @param {Object} options - Rendering options
 * @param {number} options.ordinal - Card ordinal for cloze rendering (1-based)
 * @param {boolean} options.isBack - Whether rendering the back of the card
 * @param {string} options.frontContent - The rendered front content (for {{FrontSide}})
 * @param {boolean} options.allowHtml - Whether to allow HTML in field values (default: true for rich text)
 * @returns {string} - Rendered template
 */
function renderTemplate(template, fieldsMap, options = {}) {
  const { ordinal = 1, isBack = false, frontContent = '', allowHtml = true } = options;
  
  let result = template;
  
  // Replace {{FrontSide}} with the front content
  result = result.replace(/\{\{FrontSide\}\}/g, frontContent);
  
  // Replace cloze field placeholders {{cloze:FieldName}}
  result = result.replace(/\{\{cloze:(.*?)\}\}/g, (match, fieldName) => {
    const fieldValue = fieldsMap[fieldName] || '';
    return renderCloze(fieldValue, ordinal, isBack);
  });
  
  // Replace basic field placeholders {{FieldName}}
  // Note: Field values may contain user HTML (rich text), which is intentional for Anki
  // The field content is sanitized at input time, not at render time
  result = result.replace(/\{\{([^}:]+)\}\}/g, (match, fieldName) => {
    const value = fieldsMap[fieldName] || '';
    return allowHtml ? value : escapeHtml(value);
  });
  
  return result;
}

/**
 * Generate cards from a note based on its note type
 * @param {Object} note - The note object
 * @param {Object} noteType - The note type object
 * @param {number} deckId - The deck ID for the cards
 * @returns {Array} - Array of card objects to be created
 */
function generateCardsFromNote(note, noteType, deckId) {
  const config = typeof noteType.config === 'string' 
    ? JSON.parse(noteType.config) 
    : noteType.config;
  
  const fieldNames = config.fields || [];
  const templates = config.templates || [];
  
  const fields = typeof note.fields === 'string' 
    ? JSON.parse(note.fields) 
    : note.fields;
  
  // Create fields map
  const fieldsMap = {};
  fieldNames.forEach((name, index) => {
    fieldsMap[name] = fields[index] || '';
  });
  
  const cards = [];
  
  // Check if this is a cloze note type
  const isClozeType = noteType.name === 'Cloze' || 
    templates.some(t => t.front && t.front.includes('{{cloze:'));
  
  if (isClozeType) {
    // For cloze notes, generate one card per cloze deletion
    const textField = fields[0] || '';
    const maxClozeIndex = getMaxClozeIndex(textField);
    
    if (maxClozeIndex > 0) {
      for (let ordinal = 1; ordinal <= maxClozeIndex; ordinal++) {
        const template = templates[0] || { front: '{{cloze:Text}}', back: '{{cloze:Text}}' };
        
        const frontContent = renderTemplate(template.front, fieldsMap, { 
          ordinal, 
          isBack: false 
        });
        
        const backContent = renderTemplate(template.back, fieldsMap, { 
          ordinal, 
          isBack: true, 
          frontContent 
        });
        
        cards.push({
          note_id: note.id,
          deck_id: deckId,
          ord: ordinal - 1,
          front: frontContent,
          back: backContent,
          source_url: note.source_url
        });
      }
    }
  } else {
    // For regular notes, generate one card per template
    templates.forEach((template, templateIndex) => {
      const frontContent = renderTemplate(template.front, fieldsMap, { 
        ordinal: templateIndex + 1, 
        isBack: false 
      });
      
      const backContent = renderTemplate(template.back, fieldsMap, { 
        ordinal: templateIndex + 1, 
        isBack: true, 
        frontContent 
      });
      
      cards.push({
        note_id: note.id,
        deck_id: deckId,
        ord: templateIndex,
        front: frontContent,
        back: backContent,
        source_url: note.source_url
      });
    });
  }
  
  return cards;
}

/**
 * Inject CSS into a card HTML for preview
 * @param {string} cardHtml - The card HTML content
 * @param {string} css - The CSS to inject
 * @returns {string} - HTML with injected CSS
 */
function injectCSS(cardHtml, css) {
  return `<style>${css}</style><div class="card">${cardHtml}</div>`;
}

/**
 * Create a preview HTML for a card
 * @param {string} content - The card content (front or back)
 * @param {string} css - The CSS from the note type
 * @returns {string} - Complete preview HTML
 */
function createPreviewHtml(content, css) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${css}
  </style>
</head>
<body>
  <div class="card">
    ${content}
  </div>
</body>
</html>
  `.trim();
}

module.exports = {
  escapeHtml,
  renderTemplate,
  generateCardsFromNote,
  injectCSS,
  createPreviewHtml
};
