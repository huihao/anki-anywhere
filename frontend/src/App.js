import React, { useState } from 'react';
import DeckList from './components/DeckList';
import CardList from './components/CardList';
import './styles/App.css';

function App() {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');

  const handleSaveToken = () => {
    localStorage.setItem('authToken', authToken);
    alert('访问令牌已保存');
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
          <CardList deck={selectedDeck} />
        </div>
      </div>
    </div>
  );
}

export default App;
