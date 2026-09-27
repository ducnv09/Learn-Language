const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate flashcards from extracted text using Gemini AI
 * @param {string} text - Cleaned text from document
 * @returns {Promise<Array>} Array of flashcard objects
 */
async function generateFlashcards(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a vocabulary extraction engine. Your task is to extract EVERY SINGLE English word or phrase from the text below and convert each into a flashcard.

STRICT RULES:
1. Extract EVERY word/phrase — do NOT skip, filter, or summarize. If the text has 30 items, return exactly 30 items.
2. Keep the EXACT SAME ORDER as they appear in the text (top to bottom, left to right).
3. If the text already contains Vietnamese translations or meanings, USE THEM in the "translation" field — do not make up new ones.
4. If the text is a table (with columns like No., Word, Meaning), extract each row as one flashcard.

For each item, provide:
- word: the English word or phrase (exactly as written)
- definition: clear English definition
- translation: Vietnamese translation (use existing one from text if available)
- pronunciation: IPA phonetic transcription
- example_sentence: a natural example sentence using the word

IMPORTANT: Return ONLY a valid JSON array. No markdown, no explanation, no code blocks.

Example:
[{"word":"souvenir","definition":"An object kept as a reminder of a place or event","translation":"quà lưu niệm","pronunciation":"/ˌsuː.vəˈnɪr/","example_sentence":"I bought a souvenir from the gift shop."}]

Text to extract from:
${text}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Clean response - remove markdown code blocks if present
  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const cards = JSON.parse(cleaned);
    if (!Array.isArray(cards)) throw new Error('Response is not an array');
    console.log(`✅ AI extracted ${cards.length} flashcards`);
    // Validate each card has required fields
    return cards.filter(card => card.word && card.definition).map(card => ({
      word: card.word || '',
      definition: card.definition || '',
      translation: card.translation || '',
      pronunciation: card.pronunciation || '',
      example_sentence: card.example_sentence || '',
    }));
  } catch (err) {
    console.error('❌ Failed to parse AI response:', err.message);
    console.error('Raw response:', response.substring(0, 500));
    throw new Error('AI returned invalid JSON. Please try again.');
  }
}

/**
 * Generate exercises from flashcards using Gemini AI
 * @param {Array} flashcards - Array of flashcard objects
 * @returns {Promise<Array>} Array of exercise objects
 */
async function generateExercises(flashcards) {
  if (!flashcards || flashcards.length === 0) return [];

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const wordList = flashcards.map(c => `${c.word} - ${c.definition}`).join('\n');

  const prompt = `You are an English language exercise creator. Create practice exercises for these vocabulary words:

${wordList}

For each word, create TWO exercises:
1. A multiple_choice question (4 options, only 1 correct)
2. A fill_blank question (sentence with a blank ___ where the word should go)

IMPORTANT: Return ONLY a valid JSON array. No markdown, no explanation, no code blocks.

Format:
[
  {
    "word": "accomplish",
    "type": "multiple_choice",
    "question": "What does 'accomplish' mean?",
    "options": ["To fail at something","To succeed in doing something","To start something","To avoid something"],
    "correct_answer": "To succeed in doing something"
  },
  {
    "word": "accomplish",
    "type": "fill_blank",
    "question": "She managed to ___ all her goals before the deadline.",
    "options": null,
    "correct_answer": "accomplish"
  }
]`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const exercises = JSON.parse(cleaned);
    if (!Array.isArray(exercises)) throw new Error('Response is not an array');
    return exercises.filter(ex => ex.question && ex.correct_answer).map(ex => ({
      word: ex.word || '',
      type: ex.type || 'multiple_choice',
      question: ex.question || '',
      options: ex.options || null,
      correct_answer: ex.correct_answer || '',
    }));
  } catch (err) {
    console.error('❌ Failed to parse AI exercises response:', err.message);
    throw new Error('AI returned invalid JSON for exercises. Please try again.');
  }
}

/**
 * Generate flashcards directly from an image using Gemini Vision
 * Bypasses Tesseract OCR — much more accurate for tables and structured content
 * @param {Buffer} imageBuffer - Image file buffer (JPG/PNG)
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Array>} Array of flashcard objects
 */
async function generateFlashcardsFromImage(imageBuffer, mimeType) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType,
    },
  };

  const prompt = `You are a vocabulary extraction engine. Look at this image carefully and extract EVERY SINGLE English word or phrase into flashcards.

STRICT RULES:
1. Extract EVERY word/phrase from the image — do NOT skip any. If there are 30 items, return exactly 30.
2. Keep the EXACT SAME ORDER as they appear (top to bottom).
3. If Vietnamese translations are already in the image, USE THEM in the "translation" field.
4. If it's a table with columns (No., Word, Meaning), extract each row as one flashcard.

For each item, provide:
- word: the English word or phrase (exactly as shown)
- definition: clear English definition
- translation: Vietnamese translation (use the one from the image if available)
- pronunciation: IPA phonetic transcription
- example_sentence: a natural example sentence

IMPORTANT: Return ONLY a valid JSON array. No markdown, no code blocks, no explanation.

Example:
[{"word":"souvenir","definition":"An object kept as a reminder of a place or event","translation":"quà lưu niệm","pronunciation":"/ˌsuː.vəˈnɪr/","example_sentence":"I bought a souvenir from the gift shop."}]`;

  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response.text();

  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const cards = JSON.parse(cleaned);
    if (!Array.isArray(cards)) throw new Error('Response is not an array');
    console.log(`✅ Gemini Vision extracted ${cards.length} flashcards from image`);
    return cards.filter(card => card.word && card.definition).map(card => ({
      word: card.word || '',
      definition: card.definition || '',
      translation: card.translation || '',
      pronunciation: card.pronunciation || '',
      example_sentence: card.example_sentence || '',
    }));
  } catch (err) {
    console.error('❌ Failed to parse Gemini Vision response:', err.message);
    console.error('Raw response:', response.substring(0, 500));
    throw new Error('AI returned invalid JSON from image. Please try again.');
  }
}

/**
 * Generate multiple choice questions from document text using Gemini AI
 * @param {string} text - Cleaned text from document
 * @returns {Promise<Array>} Array of question objects
 */
async function generateQuizQuestions(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an expert at extracting and formatting multiple-choice questions from documents. Your task is to extract all questions from the provided text and convert them into a structured JSON array.

STRICT RULES:
1. Extract EVERY question from the text.
2. For each question, extract its text, all options, the correct answer(s), and the explanation if provided.
3. Determine if the question is SINGLE_CHOICE (only 1 correct answer) or MULTIPLE_CHOICE (more than 1 correct answer).
4. The "options" field must be an array of strings (the text of the options without the A), B), C) prefix).
5. The "correct_answers" field must be an array of integers representing the zero-based indices of the correct options in the "options" array.
6. The "explanation" field should contain the explanation if provided, otherwise an empty string.

IMPORTANT: Return ONLY a valid JSON array. No markdown, no explanation, no code blocks.

Example:
[
  {
    "questionText": "Which two statements are true about the tools used to configure Oracle Net Services?",
    "options": [
      "Oracle Net Manager can be used to locally configure naming methods on a database server.",
      "Oracle Net Manager can be used to centrally configure listeners on any database server target.",
      "Enterprise Manager Cloud Control can be used to centrally configure net service names for any database server target.",
      "The lsnrctl utility requires a listener.ora file to exist before it is started.",
      "The Oracle Net Configuration Assistant is only used when running the Oracle Installer."
    ],
    "correctAnswers": [0, 2],
    "explanation": "Oracle Net Services provides user interface tools...",
    "questionType": "MULTIPLE_CHOICE"
  }
]

Text to extract from:
${text}`;

  console.log(`\n🤖 [AI SERVICE] Bắt đầu gọi Gemini API để trích xuất câu hỏi trắc nghiệm...`);
  console.log(`🤖 [AI SERVICE] Độ dài văn bản gửi đi: ${text.length} ký tự. Vui lòng chờ...`);
  
  const startTime = Date.now();
  const result = await model.generateContent(prompt);
  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`🤖 [AI SERVICE] Đã nhận phản hồi từ Gemini sau ${timeTaken} giây. Bắt đầu xử lý JSON...`);
  const response = result.response.text();

  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const questions = JSON.parse(cleaned);
    if (!Array.isArray(questions)) throw new Error('Response is not an array');
    console.log(`✅ AI extracted ${questions.length} quiz questions`);
    return questions.filter(q => q.questionText && Array.isArray(q.options) && Array.isArray(q.correctAnswers)).map(q => ({
      questionText: q.questionText || '',
      options: q.options || [],
      correctAnswers: q.correctAnswers || [],
      explanation: q.explanation || '',
      questionType: q.questionType || (q.correctAnswers.length > 1 ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE'),
    }));
  } catch (err) {
    console.error('❌ Failed to parse AI response for quiz questions:', err.message);
    console.error('Raw response:', response.substring(0, 500));
    throw new Error('AI returned invalid JSON. Please try again.');
  }
}

module.exports = { generateFlashcards, generateFlashcardsFromImage, generateExercises, generateQuizQuestions };
