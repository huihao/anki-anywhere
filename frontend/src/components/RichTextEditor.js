import React, { useRef, useCallback, useEffect } from 'react';

/**
 * Rich Text Editor Component
 * A simple rich text editor with basic formatting support
 * Supports: Bold, Italic, Underline, and Cloze deletion
 */
function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = '输入内容...', 
  onClozeCreate,
  showClozeButton = false,
  clozeIndex = 1
}) {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);
  
  // Update editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);
  
  const handleInput = useCallback(() => {
    isInternalChange.current = true;
    const content = editorRef.current.innerHTML;
    onChange(content);
  }, [onChange]);
  
  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  }, [handleInput]);
  
  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  
  const handleCloze = useCallback(() => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const selectedText = selection.toString();
      if (selectedText.trim()) {
        // Create cloze deletion markup
        const clozeMarkup = `{{c${clozeIndex}::${selectedText}}}`;
        
        // Replace selected text with cloze
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(clozeMarkup));
        
        // Clear selection
        selection.removeAllRanges();
        
        handleInput();
        
        if (onClozeCreate) {
          onClozeCreate(clozeIndex);
        }
      }
    } else {
      alert('请先选择要填空的文本');
    }
  }, [clozeIndex, handleInput, onClozeCreate]);
  
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    
    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain');
    
    // Insert as plain text
    document.execCommand('insertText', false, text);
    handleInput();
  }, [handleInput]);
  
  const handleKeyDown = useCallback((e) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          handleBold();
          break;
        case 'i':
          e.preventDefault();
          handleItalic();
          break;
        case 'u':
          e.preventDefault();
          handleUnderline();
          break;
        default:
          break;
      }
    }
  }, []);
  
  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button 
          type="button" 
          onClick={handleBold} 
          title="加粗 (Ctrl+B)"
          className="toolbar-btn"
        >
          <strong>B</strong>
        </button>
        <button 
          type="button" 
          onClick={handleItalic} 
          title="斜体 (Ctrl+I)"
          className="toolbar-btn"
        >
          <em>I</em>
        </button>
        <button 
          type="button" 
          onClick={handleUnderline} 
          title="下划线 (Ctrl+U)"
          className="toolbar-btn"
        >
          <u>U</u>
        </button>
        {showClozeButton && (
          <>
            <span className="toolbar-separator">|</span>
            <button 
              type="button" 
              onClick={handleCloze} 
              title={`创建填空 (c${clozeIndex})`}
              className="toolbar-btn cloze-btn"
            >
              [...] c{clozeIndex}
            </button>
          </>
        )}
      </div>
      
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}

export default RichTextEditor;
