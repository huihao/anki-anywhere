import React, { useState } from 'react';

/**
 * Card Preview Component
 * Shows a live preview of the card (Front/Back)
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
  
  const createMarkup = (content) => {
    return { __html: content };
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
