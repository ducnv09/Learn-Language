const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/', quizController.getAllQuizBanks);
router.get('/:id', quizController.getQuizBank);
router.get('/:id/questions', quizController.getQuizQuestions);
router.post('/process', quizController.processQuiz);
router.put('/:id', quizController.updateQuizBank);
router.put('/:id/questions', quizController.updateQuizQuestions);
router.delete('/:id', quizController.deleteQuizBank);

module.exports = router;
