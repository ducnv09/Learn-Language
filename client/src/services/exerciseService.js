import api from './api';

export const getExercisesByDeck = (deckId) =>
  api.get(`/exercises/deck/${deckId}`).then((res) => res.data);

export const processFiles = ({ file_ids, deck_name }) =>
  api.post('/process', { file_ids, deck_name }, { timeout: 120000 }).then((res) => res.data);
