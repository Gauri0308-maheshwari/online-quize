import express from 'express';
import {
  submitQuiz,
  getUserAttempts,
  getResultById,
  getQuizLeaderboard,
} from '../controllers/resultController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/submit', submitQuiz);
router.get('/user', getUserAttempts);
router.get('/leaderboard/:quizId', getQuizLeaderboard);
router.get('/:id', getResultById);

export default router;
