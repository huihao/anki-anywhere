import React, { useState } from 'react';
import DeckList from './components/DeckList';
import CardList from './components/CardList';
import CardEditor from './components/CardEditor';
import './styles/App.css';

function App() {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');
  const [showEditor, setShowEditor] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaveToken = () => {
    localStorage.setItem('authToken', authToken);
    alert('访问令牌已保存');
  };

  const handleEditorSave = () => {
    setShowEditor(false);
    // Trigger refresh of card list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Anki Anywhere 管理页面</h1>
        <div className="auth-section">
          <input
            type="password"
            placeholder="输入访问令牌"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
          />
          <button onClick={handleSaveToken}>保存令牌</button>
        </div>
      </header>
      
      <div className="app-content">
        <div className="sidebar">
          <DeckList onSelectDeck={setSelectedDeck} />
        </div>
        <div className="main-content">
          {selectedDeck && (
            <div className="deck-actions">
              <button 
                className="create-card-btn"
                onClick={() => setShowEditor(!showEditor)}
              >
                {showEditor ? '关闭高级编辑器' : '高级卡片编辑器'}
              </button>
            </div>
          )}
          
          {showEditor && selectedDeck && (
            <CardEditor 
              deck={selectedDeck}
              onSave={handleEditorSave}
              onCancel={() => setShowEditor(false)}
            />
          )}
          
          <CardList key={refreshKey} deck={selectedDeck} />
        </div>
      </div>
    </div>
  );
}

export default App;
