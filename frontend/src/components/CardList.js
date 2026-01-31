import React, { useState, useEffect } from 'react';
import { cardService } from '../services/api';

function CardList({ deck }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '', sourceUrl: '' });
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    if (deck) {
      loadCards();
    }
  }, [deck]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await cardService.getByDeckId(deck.id);
      setCards(response.data);
    } catch (err) {
      console.error('加载卡片失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      await cardService.create({
        ...newCard,
        deckId: deck.id,
      });
      setNewCard({ front: '', back: '', sourceUrl: '' });
      setShowCreateForm(false);
      loadCards();
    } catch (err) {
      alert('创建卡片失败');
      console.error(err);
    }
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    try {
      await cardService.update(editingCard.id, editingCard);
      setEditingCard(null);
      loadCards();
    } catch (err) {
      alert('更新卡片失败');
      console.error(err);
    }
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm('确定要删除此卡片吗？')) return;
    
    try {
      await cardService.delete(id);
      loadCards();
    } catch (err) {
      alert('删除卡片失败');
      console.error(err);
    }
  };

  if (!deck) {
    return <div className="card-list-empty">请选择一个卡牌组</div>;
  }

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="card-list">
      <div className="card-list-header">
        <h2>{deck.name} - 卡片</h2>
        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? '取消' : '创建新卡片'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateCard} className="create-card-form">
          <div className="form-group">
            <label>正面（问题）:</label>
            <textarea
              value={newCard.front}
              onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>背面（答案）:</label>
            <textarea
              value={newCard.back}
              onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>来源URL（可选）:</label>
            <input
              type="url"
              value={newCard.sourceUrl}
              onChange={(e) => setNewCard({ ...newCard, sourceUrl: e.target.value })}
            />
          </div>
          <button type="submit">创建</button>
        </form>
      )}

      <div className="card-items">
        {cards.map((card) => (
          <div key={card.id} className="card-item">
            {editingCard?.id === card.id ? (
              <form onSubmit={handleUpdateCard} className="edit-card-form">
                <textarea
                  value={editingCard.front}
                  onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                />
                <textarea
                  value={editingCard.back}
                  onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                />
                <div className="form-actions">
                  <button type="submit">保存</button>
                  <button type="button" onClick={() => setEditingCard(null)}>取消</button>
                </div>
              </form>
            ) : (
              <>
                <div className="card-content">
                  <div className="card-front">
                    <strong>问题:</strong> {card.front}
                  </div>
                  <div className="card-back">
                    <strong>答案:</strong> {card.back}
                  </div>
                  {card.source_url && (
                    <div className="card-source">
                      <a href={card.source_url} target="_blank" rel="noopener noreferrer">
                        来源链接
                      </a>
                    </div>
                  )}
                </div>
                <div className="card-actions">
                  <button onClick={() => setEditingCard(card)}>编辑</button>
                  <button onClick={() => handleDeleteCard(card.id)}>删除</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="empty-message">此卡牌组还没有卡片</div>
      )}
    </div>
  );
}

export default CardList;
