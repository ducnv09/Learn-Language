const express = require('express');
const cors = require('cors');
require('dotenv').config();

const deckRoutes = require('./routes/deckRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const processRoutes = require('./routes/processRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const errorHandler = require('./middleware/errorHandler');
const { initBucket } = require('./config/minio');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/decks', deckRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/process', processRoutes);
app.use('/api/exercises', exerciseRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await initBucket();
});
