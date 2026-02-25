-- ============================================
-- LearnLang AI - Database Schema
-- ============================================

CREATE TABLE IF NOT EXISTS decks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  deck_id INTEGER REFERENCES decks(id) ON DELETE CASCADE,
  word VARCHAR(255) NOT NULL,
  definition TEXT,
  translation TEXT,
  pronunciation VARCHAR(255),
  example_sentence TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploaded_files (
  id SERIAL PRIMARY KEY,
  deck_id INTEGER REFERENCES decks(id) ON DELETE SET NULL,
  original_name VARCHAR(255),
  minio_key VARCHAR(500),
  file_type VARCHAR(50),
  file_size BIGINT,
  status VARCHAR(50) DEFAULT 'uploaded',
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
