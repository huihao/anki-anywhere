import React, { useState, useEffect } from 'react';
import { deckService } from '../services/api';

function DeckList({ onSelectDeck }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeck, setNewDeck] = useState({ name: '', description: '' });

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const response = await deckService.getAll();
      setDecks(response.data);
      setError(null);
    } catch (err) {
      setError('加载卡牌组失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    try {
      await deckService.create(newDeck);
      setNewDeck({ name: '', description: '' });
      setShowCreateForm(false);
      loadDecks();
    } catch (err) {
      alert('创建卡牌组失败');
      console.error(err);
    }
  };

  const handleDeleteDeck = async (id) => {
    if (!window.confirm('确定要删除此卡牌组吗？')) return;
    
    try {
      await deckService.delete(id);
      loadDecks();
    } catch (err) {
      alert('删除卡牌组失败');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="deck-list">
      <div className="deck-list-header">
        <h2>卡牌组</h2>
        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? '取消' : '创建新卡牌组'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateDeck} className="create-deck-form">
          <input
            type="text"
            placeholder="卡牌组名称"
            value={newDeck.name}
            onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
            required
          />
          <textarea
            placeholder="描述（可选）"
            value={newDeck.description}
            onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
          />
          <button type="submit">创建</button>
        </form>
      )}

      <div className="deck-items">
        {decks.map((deck) => (
          <div key={deck.id} className="deck-item">
            <div className="deck-info" onClick={() => onSelectDeck(deck)}>
              <h3>{deck.name}</h3>
              {deck.description && <p>{deck.description}</p>}
            </div>
            <button 
              className="delete-btn" 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteDeck(deck.id);
              }}
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeckList;
