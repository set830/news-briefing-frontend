import React, { useState, useRef } from 'react';
import './ArticleBox.css';

function ArticleBox({ index, text, mode, onTextChange, onModeChange }) {
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef(null);
  const isFilled = text.trim().length > 0;
  const isOpen = isFilled || expanded;

  const handleHeaderClick = () => {
    if (!isFilled) {
      setExpanded(prev => !prev);
      if (!expanded) {
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    }
  };

  const handleTextareaBlur = () => {
    if (!isFilled) setExpanded(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onTextChange('');
    setExpanded(false);
  };

  // Truncate preview text
  const preview = text.trim().slice(0, 80).replace(/\s+/g, ' ');
  const showPreview = isFilled && !expanded;

  return (
    <div className={`article-box ${isFilled ? 'filled' : 'empty'} ${isOpen ? 'open' : ''}`}>
      <div className="article-box-header" onClick={handleHeaderClick}>
        <span className="article-number">{index + 1}</span>

        {showPreview && (
          <span className="article-preview">{preview}{text.trim().length > 80 ? '…' : ''}</span>
        )}
        {!showPreview && !isFilled && (
          <span className="article-placeholder">
            {isOpen ? 'Paste article here' : 'Empty — click to add'}
          </span>
        )}
        {!showPreview && isFilled && (
          <span className="article-placeholder" style={{ fontStyle: 'normal', color: '#7070a0' }}>
            Editing...
          </span>
        )}

        <div className="article-box-actions" onClick={e => e.stopPropagation()}>
          {isFilled && (
            <div className="mode-toggle">
              <button
                className={`mode-btn ${mode === 'summarize' ? 'active' : ''}`}
                onClick={() => onModeChange('summarize')}
              >
                Summarize
              </button>
              <button
                className={`mode-btn ${mode === 'full' ? 'active' : ''}`}
                onClick={() => onModeChange('full')}
              >
                Full Article
              </button>
            </div>
          )}
          {isFilled && (
            <button className="clear-btn" onClick={handleClear} title="Clear">
              ✕
            </button>
          )}
          {!isFilled && (
            <div className="mode-toggle muted">
              <button
                className={`mode-btn ${mode === 'summarize' ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); onModeChange('summarize'); }}
              >
                Summarize
              </button>
              <button
                className={`mode-btn ${mode === 'full' ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); onModeChange('full'); }}
              >
                Full Article
              </button>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <textarea
          ref={textareaRef}
          className="article-textarea"
          value={text}
          onChange={e => onTextChange(e.target.value)}
          onFocus={() => setExpanded(true)}
          onBlur={handleTextareaBlur}
          placeholder="Paste the full article text here..."
          spellCheck={false}
        />
      )}
    </div>
  );
}

export default ArticleBox;
