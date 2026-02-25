import api from './api';

export const getDecks = () => api.get('/decks').then((res) => res.data);
export const getDeck = (id) => api.get(`/decks/${id}`).then((res) => res.data);
export const createDeck = (data) => api.post('/decks', data).then((res) => res.data);
export const updateDeck = (id, data) => api.put(`/decks/${id}`, data).then((res) => res.data);
export const deleteDeck = (id) => api.delete(`/decks/${id}`).then((res) => res.data);
