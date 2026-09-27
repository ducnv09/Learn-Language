const { parseFile } = require('../services/parsers');
const { cleanText, truncateForAI } = require('../services/textCleaner');
const { generateQuizQuestions } = require('../services/aiService');
const { minioClient, BUCKET_NAME } = require('../config/minio');
const UploadedFile = require('../models/uploadedFile');
const { QuizBank, QuizQuestion } = require('../models/quiz');
const pool = require('../config/db');

const IMAGE_TYPES = ['image/jpeg', 'image/png'];

const quizController = {
  async processQuiz(req, res, next) {
    try {
      const { file_ids, title } = req.body;

      if (!file_ids || !file_ids.length) {
        return res.status(400).json({ error: 'file_ids array is required' });
      }

      const fileRecords = [];
      for (const id of file_ids) {
        const file = await UploadedFile.findById(id);
        if (file) fileRecords.push(file);
      }

      if (fileRecords.length === 0) {
        return res.status(404).json({ error: 'No valid files found' });
      }

      let allQuestions = [];

      for (const file of fileRecords) {
        try {
          const chunks = [];
          const stream = await minioClient.getObject(BUCKET_NAME, file.minio_key);
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          let questions = [];

          if (!IMAGE_TYPES.includes(file.file_type)) {
            console.log(`📄 Parsing document for quiz: ${file.original_name}`);
            const rawText = await parseFile(buffer, file.file_type);
            const cleanedText = cleanText(rawText);
            const truncatedText = truncateForAI(cleanedText, 300000);
            
            console.log(`\n⏳ [CONTROLLER] Đã đọc xong nội dung file. Dung lượng gốc: ${rawText.length} ký tự.`);
            console.log(`⏳ [CONTROLLER] Kích thước sau khi làm sạch: ${truncatedText.length} ký tự.`);

            questions = await generateQuizQuestions(truncatedText);
          } else {
             console.log(`⚠️ Skipping image for quiz parsing: ${file.original_name}`);
          }

          allQuestions = allQuestions.concat(questions);
          await UploadedFile.updateStatus(file.id, 'parsed_quiz');
        } catch (err) {
          console.error(`❌ Failed to process quiz from ${file.original_name}:`, err.message);
          await UploadedFile.updateStatus(file.id, 'parse_quiz_error');
        }
      }

      if (allQuestions.length === 0) {
        return res.status(422).json({ error: 'Could not extract any quiz questions from files' });
      }

      const quizBank = await QuizBank.create({
        title: title || `Quiz Bank ${new Date().toLocaleDateString('vi-VN')}`,
        description: `Auto-generated from: ${fileRecords.map(f => f.original_name).join(', ')}`,
      });

      const savedQuestions = await QuizQuestion.createBatch(quizBank.id, allQuestions);
      console.log(`💾 Saved ${savedQuestions.length} questions to quiz bank "${quizBank.title}"`);

      res.json({
        message: 'Quiz generation complete!',
        quizBank,
        questions_count: savedQuestions.length,
      });
    } catch (err) {
      next(err);
    }
  },

  async getAllQuizBanks(req, res, next) {
    try {
      const quizBanks = await QuizBank.findAll();
      res.json(quizBanks);
    } catch (err) {
      next(err);
    }
  },

  async getQuizBank(req, res, next) {
    try {
      const quizBank = await QuizBank.findById(req.params.id);
      if (!quizBank) return res.status(404).json({ error: 'Quiz bank not found' });
      res.json(quizBank);
    } catch (err) {
      next(err);
    }
  },

  async getQuizQuestions(req, res, next) {
    try {
      const questions = await QuizQuestion.findByQuizBankId(req.params.id);
      res.json(questions);
    } catch (err) {
      next(err);
    }
  },

  async deleteQuizBank(req, res, next) {
    try {
      await QuizBank.delete(req.params.id);
      res.json({ message: 'Quiz bank deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async updateQuizBank(req, res, next) {
    try {
      const { title, description } = req.body;
      const updated = await QuizBank.update(req.params.id, { title, description });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async updateQuizQuestions(req, res, next) {
    try {
      const { id } = req.params;
      const { questions } = req.body;
      
      // Delete old questions
      await require('../config/db').query('DELETE FROM questions WHERE quiz_bank_id = $1', [id]);
      
      // Insert new questions
      if (questions && questions.length > 0) {
        // Map frontend questions to backend format
        const formattedQuestions = questions.map(q => ({
          questionText: q.question_text || q.questionText,
          options: q.options,
          correctAnswers: q.correct_answers || q.correctAnswers,
          explanation: q.explanation || '',
          questionType: q.question_type || q.questionType || (q.correct_answers?.length > 1 ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE')
        }));
        await QuizQuestion.createBatch(id, formattedQuestions);
      }
      
      res.json({ success: true, message: 'Questions updated successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = quizController;
