import React, { useState } from 'react';

/**
 * Card Preview Component
 * Shows a live preview of the card (Front/Back)
 * 
 * Note: This component uses dangerouslySetInnerHTML to render user-provided HTML.
 * This is intentional as Anki cards support rich HTML content including formatting,
 * images, and custom styling. The content comes from the user's own input and is
 * displayed only to the user themselves in their card preview/study sessions.
 * 
 * In a production environment with multi-user support, consider sanitizing the
 * HTML with a library like DOMPurify before rendering.
 */
function CardPreview({ front, back, css = '' }) {
  const [showBack, setShowBack] = useState(false);
  
  const defaultCSS = `
    .card {
      font-family: arial;
      font-size: 20px;
      text-align: center;
      color: black;
      background-color: white;
      padding: 20px;
    }
    .cloze {
      font-weight: bold;
      color: blue;
    }
    .cloze-blank {
      font-weight: bold;
      color: blue;
    }
  `;
  
  const combinedCSS = css || defaultCSS;
  
  // Creates markup object for dangerouslySetInnerHTML
  // Content is user-generated rich text that intentionally includes HTML
  const createMarkup = (content) => {
    return { __html: content || '' };
  };
  
  return (
    <div className="card-preview">
      <div className="preview-header">
        <h3>卡片预览</h3>
        <div className="preview-tabs">
          <button 
            className={`preview-tab ${!showBack ? 'active' : ''}`}
            onClick={() => setShowBack(false)}
          >
            正面
          </button>
          <button 
            className={`preview-tab ${showBack ? 'active' : ''}`}
            onClick={() => setShowBack(true)}
          >
            背面
          </button>
        </div>
      </div>
      
      <div className="preview-content">
        <style>{combinedCSS}</style>
        <div 
          className="card"
          dangerouslySetInnerHTML={createMarkup(showBack ? back : front)}
        />
      </div>
      
      {!front && !back && (
        <div className="preview-placeholder">
          输入内容后查看预览
        </div>
      )}
    </div>
  );
}

export default CardPreview;
