const { parseFile } = require('../services/parsers');
const { cleanText, truncateForAI } = require('../services/textCleaner');
const { generateFlashcards, generateFlashcardsFromImage, generateExercises } = require('../services/aiService');
const { minioClient, BUCKET_NAME } = require('../config/minio');
const UploadedFile = require('../models/uploadedFile');
const Flashcard = require('../models/flashcard');
const Deck = require('../models/deck');
const pool = require('../config/db');

const IMAGE_TYPES = ['image/jpeg', 'image/png'];

const processController = {
  /**
   * Process uploaded files: parse → clean → AI generate flashcards → save
   * Images go directly to Gemini Vision (no OCR)
   * Documents go through parser → text cleaner → Gemini text
   * POST /api/process
   * Body: { file_ids: [1, 2, ...], deck_name?: string }
   */
  async processFiles(req, res, next) {
    try {
      const { file_ids, deck_name } = req.body;

      if (!file_ids || !file_ids.length) {
        return res.status(400).json({ error: 'file_ids array is required' });
      }

      // 1. Fetch file records from DB
      const fileRecords = [];
      for (const id of file_ids) {
        const file = await UploadedFile.findById(id);
        if (file) fileRecords.push(file);
      }

      if (fileRecords.length === 0) {
        return res.status(404).json({ error: 'No valid files found' });
      }

      // 2. Create deck
      const deck = await Deck.create({
        name: deck_name || `Imported ${new Date().toLocaleDateString('vi-VN')}`,
        description: `Auto-generated from: ${fileRecords.map(f => f.original_name).join(', ')}`,
      });

      // Link files to deck
      for (const file of fileRecords) {
        await pool.query('UPDATE uploaded_files SET deck_id = $1 WHERE id = $2', [deck.id, file.id]);
      }

      // 3. Process files — split by type
      let allCards = [];

      for (const file of fileRecords) {
        try {
          // Download from MinIO
          const chunks = [];
          const stream = await minioClient.getObject(BUCKET_NAME, file.minio_key);
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          let cards;

          if (IMAGE_TYPES.includes(file.file_type)) {
            // ⚡ Images → Gemini Vision directly (no OCR)
            console.log(`🖼️ Processing image with Gemini Vision: ${file.original_name}`);
            cards = await generateFlashcardsFromImage(buffer, file.file_type);
          } else {
            // 📄 Documents → Parse text → Clean → Gemini text
            console.log(`📄 Parsing document: ${file.original_name}`);
            const rawText = await parseFile(buffer, file.file_type);
            const cleanedText = cleanText(rawText);
            const truncatedText = truncateForAI(cleanedText);
            cards = await generateFlashcards(truncatedText);
          }

          allCards = allCards.concat(cards);
          await UploadedFile.updateStatus(file.id, 'parsed');
        } catch (err) {
          console.error(`❌ Failed to process ${file.original_name}:`, err.message);
          await UploadedFile.updateStatus(file.id, 'parse_error');
        }
      }

      if (allCards.length === 0) {
        return res.status(422).json({ error: 'Could not extract any vocabulary from files' });
      }

      // 4. Save flashcards to DB
      const savedCards = await Flashcard.createMany(deck.id, allCards);
      console.log(`💾 Saved ${savedCards.length} flashcards to deck "${deck.name}"`);

      // 5. Generate exercises
      let savedExercises = [];
      if (savedCards.length > 0) {
        try {
          const exercises = await generateExercises(savedCards.slice(0, 20));
          if (exercises.length > 0) {
            for (const ex of exercises) {
              const matchedCard = savedCards.find(c =>
                c.word.toLowerCase() === ex.word.toLowerCase()
              );
              if (matchedCard) {
                await pool.query(
                  `INSERT INTO exercises (flashcard_id, type, question, options, correct_answer)
                   VALUES ($1, $2, $3, $4, $5)`,
                  [matchedCard.id, ex.type, ex.question, JSON.stringify(ex.options), ex.correct_answer]
                );
                savedExercises.push(ex);
              }
            }
          }
        } catch (err) {
          console.error('Exercise generation failed (non-fatal):', err.message);
        }
      }

      // Update file statuses
      for (const file of fileRecords) {
        await UploadedFile.updateStatus(file.id, 'processed');
      }

      res.json({
        message: 'Processing complete!',
        deck,
        flashcards_count: savedCards.length,
        exercises_count: savedExercises.length,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = processController;
