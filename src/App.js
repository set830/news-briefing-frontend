import React, { useState } from 'react';
import './App.css';
import ArticleBox from './components/ArticleBox';
import AudioPlayer from './components/AudioPlayer';

const ARTICLE_COUNT = 25;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const emptyArticle = () => ({ text: '', mode: 'summarize' });

function App() {
  const [articles, setArticles] = useState(() =>
    Array.from({ length: ARTICLE_COUNT }, emptyArticle)
  );
  const [tone, setTone] = useState('conversational');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [error, setError] = useState(null);

  const updateArticle = (index, field, value) => {
    setArticles(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const filledCount = articles.filter(a => a.text.trim().length > 0).length;

  const handleGenerate = async () => {
    if (filledCount === 0) return;
    setError(null);
    setAudioData(null);
    setIsGenerating(true);

    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles, tone }),
      });

      if (!res.ok) {
        let message = 'Generation failed';
        try {
          const err = await res.json();
          message = err.error || message;
        } catch {}
        throw new Error(message);
      }

      const data = await res.json();
      setAudioData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">News Briefing</h1>
          <span className="article-count-badge">
            {filledCount > 0
              ? `${filledCount} article${filledCount !== 1 ? 's' : ''}`
              : 'No articles yet'}
          </span>
        </div>

        <div className="header-right">
          <div className="tone-selector">
            <span className="tone-label">Tone</span>
            <div className="tone-toggle">
              <button
                className={`tone-btn ${tone === 'conversational' ? 'active' : ''}`}
                onClick={() => setTone('conversational')}
              >
                Conversational
              </button>
              <button
                className={`tone-btn ${tone === 'direct' ? 'active' : ''}`}
                onClick={() => setTone('direct')}
              >
                Direct
              </button>
            </div>
          </div>

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating || filledCount === 0}
          >
            {isGenerating ? (
              <span className="btn-loading">
                <span className="spinner" />
                Generating...
              </span>
            ) : (
              'Generate & Play'
            )}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="how-to">
          <span className="how-to-step"><span className="how-to-num">1</span>Paste up to 25 articles below</span>
          <span className="how-to-divider">·</span>
          <span className="how-to-step"><span className="how-to-num">2</span>Choose <strong>Summarize</strong> for key points or <strong>Full Article</strong> to read as-is</span>
          <span className="how-to-divider">·</span>
          <span className="how-to-step"><span className="how-to-num">3</span>Hit <strong>Generate &amp; Play</strong> for your personal audio briefing</span>
        </div>

        {isGenerating && (
          <div className="generating-bar">
            <div className="generating-fill" />
          </div>
        )}

        {isGenerating && (
          <div className="generating-message">
            Processing {filledCount} article{filledCount !== 1 ? 's' : ''} with Claude, then generating audio...
          </div>
        )}

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        {audioData && !isGenerating && (
          <AudioPlayer audio={audioData.audio} audioType={audioData.audioType} articleBreaks={audioData.articleBreaks} />
        )}

        <div className="articles-grid">
          {articles.map((article, index) => (
            <ArticleBox
              key={index}
              index={index}
              text={article.text}
              mode={article.mode}
              onTextChange={val => updateArticle(index, 'text', val)}
              onModeChange={val => updateArticle(index, 'mode', val)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
