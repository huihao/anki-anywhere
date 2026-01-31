import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RichTextEditor from './RichTextEditor';
import TagInput from './TagInput';
import CardPreview from './CardPreview';
import { noteTypeService, noteService, cardService } from '../services/api';

/**
 * Card Editor Component
 * A multi-field editor that supports:
 * - Dynamic field rendering based on note type
 * - Rich text editing
 * - Cloze deletion
 * - Tags
 * - Duplicate detection
 * - Live preview
 */
function CardEditor({ deck, onSave, onCancel }) {
  const [noteTypes, setNoteTypes] = useState([]);
  const [selectedNoteType, setSelectedNoteType] = useState(null);
  const [fields, setFields] = useState([]);
  const [tags, setTags] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [nextClozeIndex, setNextClozeIndex] = useState(1);
  
  // Load note types on mount
  useEffect(() => {
    const loadNoteTypes = async () => {
      try {
        setLoading(true);
        const response = await noteTypeService.getAll();
        setNoteTypes(response.data);
        
        // Select first note type by default
        if (response.data.length > 0) {
          const config = typeof response.data[0].config === 'string' 
            ? JSON.parse(response.data[0].config) 
            : response.data[0].config;
          const fieldNames = config.fields || ['Front', 'Back'];
          
          setSelectedNoteType(response.data[0]);
          setFields(fieldNames.map(() => ''));
          setNextClozeIndex(1);
        }
      } catch (err) {
        console.error('加载笔记类型失败', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadNoteTypes();
  }, []);
  
  const selectNoteType = useCallback((noteType) => {
    setSelectedNoteType(noteType);
    
    // Parse config and initialize fields
    const config = typeof noteType.config === 'string' 
      ? JSON.parse(noteType.config) 
      : noteType.config;
    
    const fieldNames = config.fields || ['Front', 'Back'];
    setFields(fieldNames.map(() => ''));
    setNextClozeIndex(1);
  }, []);
  
  // Get field names from selected note type
  const fieldNames = useMemo(() => {
    if (!selectedNoteType) return ['Front', 'Back'];
    
    const config = typeof selectedNoteType.config === 'string' 
      ? JSON.parse(selectedNoteType.config) 
      : selectedNoteType.config;
    
    return config.fields || ['Front', 'Back'];
  }, [selectedNoteType]);
  
  // Check if this is a cloze note type
  const isClozeType = useMemo(() => {
    if (!selectedNoteType) return false;
    return selectedNoteType.name === 'Cloze';
  }, [selectedNoteType]);
  
  // Get CSS from note type
  const noteTypeCSS = useMemo(() => {
    if (!selectedNoteType) return '';
    
    const config = typeof selectedNoteType.config === 'string' 
      ? JSON.parse(selectedNoteType.config) 
      : selectedNoteType.config;
    
    return config.css || '';
  }, [selectedNoteType]);
  
  // Update field value
  const updateField = useCallback((index, value) => {
    setFields(prev => {
      const newFields = [...prev];
      newFields[index] = value;
      return newFields;
    });
  }, []);
  
  // Check for duplicates when first field changes
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!selectedNoteType || !fields[0] || fields[0].trim() === '') {
        setDuplicateWarning(null);
        return;
      }
      
      try {
        const response = await noteService.checkDuplicate({
          noteTypeId: selectedNoteType.id,
          firstFieldValue: fields[0]
        });
        
        if (response.data.hasDuplicate) {
          setDuplicateWarning(`发现 ${response.data.duplicates.length} 个重复笔记`);
        } else {
          setDuplicateWarning(null);
        }
      } catch (err) {
        // Ignore duplicate check errors
      }
    };
    
    const timer = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timer);
  }, [fields, selectedNoteType]);
  
  // Calculate cloze index from field content
  useEffect(() => {
    if (isClozeType && fields[0]) {
      const clozeRegex = /\{\{c(\d+)::/g;
      let maxIndex = 0;
      let match;
      while ((match = clozeRegex.exec(fields[0])) !== null) {
        maxIndex = Math.max(maxIndex, parseInt(match[1], 10));
      }
      setNextClozeIndex(maxIndex + 1);
    }
  }, [fields, isClozeType]);
  
  // Handle cloze creation
  const handleClozeCreate = useCallback((index) => {
    setNextClozeIndex(index + 1);
  }, []);
  
  // Render preview content
  const previewContent = useMemo(() => {
    if (!selectedNoteType) return { front: '', back: '' };
    
    const config = typeof selectedNoteType.config === 'string' 
      ? JSON.parse(selectedNoteType.config) 
      : selectedNoteType.config;
    
    const templates = config.templates || [];
    if (templates.length === 0) {
      return { front: fields[0] || '', back: fields[1] || '' };
    }
    
    const template = templates[0];
    const fieldsMap = {};
    fieldNames.forEach((name, i) => {
      fieldsMap[name] = fields[i] || '';
    });
    
    // Simple template rendering for preview
    let front = template.front || '';
    let back = template.back || '';
    
    // Replace cloze fields
    front = front.replace(/\{\{cloze:(.*?)\}\}/g, (match, fieldName) => {
      const fieldValue = fieldsMap[fieldName] || '';
      // For preview, show first cloze as hidden
      return fieldValue.replace(/\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}/g, (m, idx, content, hint) => {
        if (parseInt(idx) === 1) {
          return `<span class="cloze-blank">[${hint || '...'}]</span>`;
        }
        return content;
      });
    });
    
    back = back.replace(/\{\{cloze:(.*?)\}\}/g, (match, fieldName) => {
      const fieldValue = fieldsMap[fieldName] || '';
      return fieldValue.replace(/\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}/g, (m, idx, content) => {
        return `<span class="cloze">${content}</span>`;
      });
    });
    
    // Replace FrontSide
    back = back.replace(/\{\{FrontSide\}\}/g, front);
    
    // Replace regular fields
    Object.entries(fieldsMap).forEach(([name, value]) => {
      const regex = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
      front = front.replace(regex, value);
      back = back.replace(regex, value);
    });
    
    return { front, back };
  }, [selectedNoteType, fields, fieldNames]);
  
  // Handle save
  const handleSave = async () => {
    if (!selectedNoteType || !deck) return;
    
    // Validate that at least the first field has content
    if (!fields[0] || fields[0].trim() === '') {
      alert('请填写第一个字段');
      return;
    }
    
    try {
      setSaving(true);
      
      // Create note
      await noteService.create({
        noteTypeId: selectedNoteType.id,
        fields: fields,
        tags: tags,
        sourceUrl: sourceUrl || null,
        deckId: deck.id
      });
      
      // Reset form
      setFields(fieldNames.map(() => ''));
      setTags('');
      setSourceUrl('');
      setNextClozeIndex(1);
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      alert('保存失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Handle simple card save (for backward compatibility)
   * 
   * This function creates a card directly without going through the note system.
   * Use this when:
   * - You want quick card creation without note type features
   * - The backend doesn't have note_types table set up yet
   * - You only need basic front/back cards without templates or cloze
   * 
   * For full features (cloze, multiple templates, tags), use handleSave instead.
   */
  const handleSimpleSave = async () => {
    if (!deck) return;
    
    if (!fields[0] || !fields[1]) {
      alert('请填写正面和背面内容');
      return;
    }
    
    try {
      setSaving(true);
      
      await cardService.create({
        deckId: deck.id,
        front: fields[0],
        back: fields[1],
        sourceUrl: sourceUrl || null
      });
      
      // Reset form
      setFields(['', '']);
      setSourceUrl('');
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      alert('保存失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="card-editor loading">加载中...</div>;
  }
  
  return (
    <div className="card-editor">
      <div className="editor-header">
        <h2>创建新卡片</h2>
        <div className="editor-controls">
          <button 
            type="button" 
            className={`preview-toggle ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '隐藏预览' : '显示预览'}
          </button>
        </div>
      </div>
      
      <div className="editor-layout">
        <div className="editor-main">
          {/* Note Type Selector */}
          <div className="form-group">
            <label>笔记类型:</label>
            <select 
              value={selectedNoteType?.id || ''} 
              onChange={(e) => {
                const noteType = noteTypes.find(nt => nt.id === parseInt(e.target.value));
                if (noteType) selectNoteType(noteType);
              }}
            >
              {noteTypes.map(nt => (
                <option key={nt.id} value={nt.id}>{nt.name}</option>
              ))}
            </select>
          </div>
          
          {/* Dynamic Fields */}
          {fieldNames.map((name, index) => (
            <div key={name} className="form-group">
              <label>
                {name}:
                {index === 0 && duplicateWarning && (
                  <span className="duplicate-warning">{duplicateWarning}</span>
                )}
              </label>
              <RichTextEditor
                value={fields[index] || ''}
                onChange={(value) => updateField(index, value)}
                placeholder={`输入${name}内容...`}
                showClozeButton={isClozeType && index === 0}
                clozeIndex={nextClozeIndex}
                onClozeCreate={handleClozeCreate}
              />
            </div>
          ))}
          
          {/* Tags */}
          <div className="form-group">
            <label>标签:</label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="输入标签，按Enter添加（支持层次化标签如：语言::日语::动词）"
            />
          </div>
          
          {/* Source URL */}
          <div className="form-group">
            <label>来源URL（可选）:</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          
          {/* Actions */}
          <div className="editor-actions">
            <button 
              type="button" 
              onClick={handleSave}
              disabled={saving}
              className="primary-btn"
            >
              {saving ? '保存中...' : '保存笔记'}
            </button>
            <button 
              type="button" 
              onClick={handleSimpleSave}
              disabled={saving}
              className="secondary-btn"
            >
              简单保存（仅卡片）
            </button>
            {onCancel && (
              <button 
                type="button" 
                onClick={onCancel}
                disabled={saving}
                className="cancel-btn"
              >
                取消
              </button>
            )}
          </div>
        </div>
        
        {/* Preview Panel */}
        {showPreview && (
          <div className="editor-preview">
            <CardPreview
              front={previewContent.front}
              back={previewContent.back}
              css={noteTypeCSS}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CardEditor;
