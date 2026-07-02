import express from 'express';
import {
  addQuestion,
  getQuestionsByQuiz,
  updateQuestion,
  deleteQuestion,
  generateQuestions,
} from '../controllers/questionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All question actions require admin privileges
router.use(protect, admin);

router.post('/', addQuestion);
router.post('/generate', generateQuestions);
router.get('/quiz/:quizId', getQuestionsByQuiz);

router
  .route('/:id')
  .put(updateQuestion)
  .delete(deleteQuestion);

export default router;
