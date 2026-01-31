/**
 * Cloze Deletion Utilities
 * 
 * Cloze deletion format: {{c1::hidden content::hint}}
 * - c1, c2, c3... indicates which card the deletion belongs to
 * - hidden content is what will be blanked out
 * - hint (optional) is shown when the content is hidden
 */

// Regular expression to match cloze deletions
const CLOZE_REGEX = /\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}/g;

/**
 * Parse cloze deletions from text
 * @param {string} text - Text containing cloze deletions
 * @returns {Array} - Array of cloze objects with index, content, and hint
 */
function parseCloze(text) {
  const clozes = [];
  let match;
  
  const regex = new RegExp(CLOZE_REGEX.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    clozes.push({
      fullMatch: match[0],
      index: parseInt(match[1], 10),
      content: match[2],
      hint: match[3] || null,
      position: match.index
    });
  }
  
  return clozes;
}

/**
 * Get the maximum cloze index from text
 * @param {string} text - Text containing cloze deletions
 * @returns {number} - Maximum cloze index (0 if no clozes found)
 */
function getMaxClozeIndex(text) {
  const clozes = parseCloze(text);
  if (clozes.length === 0) return 0;
  return Math.max(...clozes.map(c => c.index));
}

/**
 * Render cloze text for a specific card ordinal
 * For the active cloze (matching the ordinal), hide the content
 * For other clozes, show the content
 * 
 * @param {string} text - Text containing cloze deletions
 * @param {number} ordinal - The card ordinal (1-based)
 * @param {boolean} showAnswer - Whether to show the answer (back of card)
 * @returns {string} - Rendered text
 */
function renderCloze(text, ordinal, showAnswer = false) {
  return text.replace(CLOZE_REGEX, (match, index, content, hint) => {
    const clozeIndex = parseInt(index, 10);
    
    if (clozeIndex === ordinal) {
      // This is the active cloze for this card
      if (showAnswer) {
        return `<span class="cloze">${content}</span>`;
      } else {
        const hintText = hint ? hint : '[...]';
        return `<span class="cloze-blank">[${hintText}]</span>`;
      }
    } else {
      // Not the active cloze, show the content
      return content;
    }
  });
}

/**
 * Create cloze deletion markup for selected text
 * @param {string} text - The text to wrap in cloze deletion
 * @param {number} index - The cloze index (1-based)
 * @param {string} hint - Optional hint text
 * @returns {string} - Cloze deletion markup
 */
function createCloze(text, index = 1, hint = null) {
  if (hint) {
    return `{{c${index}::${text}::${hint}}}`;
  }
  return `{{c${index}::${text}}}`;
}

/**
 * Get the next available cloze index for a text
 * @param {string} text - Text that may contain existing cloze deletions
 * @returns {number} - Next available cloze index
 */
function getNextClozeIndex(text) {
  return getMaxClozeIndex(text) + 1;
}

/**
 * Check if text contains cloze deletions
 * @param {string} text - Text to check
 * @returns {boolean} - True if text contains cloze deletions
 */
function hasCloze(text) {
  // Create a new regex instance to avoid stateful lastIndex issues with global flag
  const regex = /\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}/;
  return regex.test(text);
}

module.exports = {
  CLOZE_REGEX,
  parseCloze,
  getMaxClozeIndex,
  renderCloze,
  createCloze,
  getNextClozeIndex,
  hasCloze
};
