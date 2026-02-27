import api from './api';

export const getFlashcards = (deckId) =>
  api.get(`/flashcards/deck/${deckId}`).then((res) => res.data);

export const createFlashcard = (data) =>
  api.post('/flashcards', data).then((res) => res.data);

export const createManyFlashcards = (deckId, cards) =>
  api.post('/flashcards/bulk', { deck_id: deckId, cards }).then((res) => res.data);

export const updateFlashcard = (id, data) =>
  api.put(`/flashcards/${id}`, data).then((res) => res.data);

export const deleteFlashcard = (id) =>
  api.delete(`/flashcards/${id}`).then((res) => res.data);

export const deleteManyFlashcards = (ids) =>
  api.post('/flashcards/bulk-delete', { ids }).then((res) => res.data);
