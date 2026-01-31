import React, { useState, useCallback, useMemo } from 'react';

/**
 * Tag Input Component
 * Supports hierarchical tags using :: separator (e.g., 语言::日语::动词)
 */
function TagInput({ value = '', onChange, placeholder = '输入标签，按Enter添加' }) {
  const [inputValue, setInputValue] = useState('');
  
  // Parse tags from string (space-separated)
  const tags = useMemo(() => {
    return value.trim() ? value.trim().split(/\s+/) : [];
  }, [value]);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      
      // Check if tag already exists
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag].join(' ');
        onChange(newTags);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      const newTags = tags.slice(0, -1).join(' ');
      onChange(newTags);
    }
  }, [inputValue, tags, onChange]);
  
  const removeTag = useCallback((tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove).join(' ');
    onChange(newTags);
  }, [tags, onChange]);
  
  // Render hierarchical tag with :: as separator
  const renderTagLabel = (tag) => {
    const parts = tag.split('::');
    if (parts.length > 1) {
      return (
        <span className="tag-hierarchical">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="tag-separator">::</span>}
              <span className="tag-part">{part}</span>
            </React.Fragment>
          ))}
        </span>
      );
    }
    return tag;
  };
  
  return (
    <div className="tag-input-container">
      <div className="tags-wrapper">
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {renderTagLabel(tag)}
            <button 
              type="button"
              className="tag-remove"
              onClick={() => removeTag(tag)}
              aria-label={`删除标签 ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="tag-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  );
}

export default TagInput;
