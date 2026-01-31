import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Deck相关API
export const deckService = {
  getAll: () => api.get('/decks'),
  getById: (id) => api.get(`/decks/${id}`),
  create: (data) => api.post('/decks', data),
  update: (id, data) => api.put(`/decks/${id}`, data),
  delete: (id) => api.delete(`/decks/${id}`),
};

// Card相关API
export const cardService = {
  getByDeckId: (deckId) => api.get(`/cards/deck/${deckId}`),
  getById: (id) => api.get(`/cards/${id}`),
  create: (data) => api.post('/cards', data),
  update: (id, data) => api.put(`/cards/${id}`, data),
  delete: (id) => api.delete(`/cards/${id}`),
  getRandom: (deckId, limit = 10) => api.get(`/cards/deck/${deckId}/random?limit=${limit}`),
};

// Review相关API
export const reviewService = {
  review: (data) => api.post('/reviews/review', data),
  getDueCards: (deckId) => api.get(`/reviews/due${deckId ? `?deckId=${deckId}` : ''}`),
  getStats: (cardId) => api.get(`/reviews/stats/${cardId}`),
};

export default api;
