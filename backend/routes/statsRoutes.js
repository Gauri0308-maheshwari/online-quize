import express from 'express';
import { getAdminStats, getStudentStats } from '../controllers/statsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, admin, getAdminStats);
router.get('/student', protect, getStudentStats);

export default router;
