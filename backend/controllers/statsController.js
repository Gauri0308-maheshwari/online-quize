import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import mongoose from 'mongoose';

// @desc    Get admin dashboard statistics
// @route   GET /api/stats/admin
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    // 1. Core Card Metrics
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await Result.countDocuments();

    const avgScoreAggregation = await Result.aggregate([
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: '$percentage' },
        },
      },
    ]);
    const averageScore = avgScoreAggregation.length > 0 ? Math.round(avgScoreAggregation[0].avgPercentage) : 0;

    // 2. Most Attempted Quizzes
    const mostAttempted = await Result.aggregate([
      {
        $group: {
          _id: '$quizId',
          attemptsCount: { $sum: 1 },
        },
      },
      { $sort: { attemptsCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: '_id',
          as: 'quizDetails',
        },
      },
      { $unwind: '$quizDetails' },
      {
        $project: {
          title: '$quizDetails.title',
          category: '$quizDetails.category',
          attemptsCount: 1,
        },
      },
    ]);

    // 3. Quiz Performance (Average scores per quiz)
    const quizPerformance = await Result.aggregate([
      {
        $group: {
          _id: '$quizId',
          avgScore: { $avg: '$percentage' },
          attempts: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: '_id',
          as: 'quizDetails',
        },
      },
      { $unwind: '$quizDetails' },
      {
        $project: {
          title: '$quizDetails.title',
          avgScore: { $round: ['$avgScore', 1] },
          attempts: 1,
        },
      },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
    ]);

    // 4. Monthly/Daily Attempt Trends (Last 7 days or months)
    const attemptTrends = await Result.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 10 },
      {
        $project: {
          date: '$_id',
          attempts: '$count',
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        cards: {
          totalUsers,
          totalQuizzes,
          totalAttempts,
          averageScore,
        },
        mostAttempted,
        quizPerformance,
        attemptTrends,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student profile & performance statistics
// @route   GET /api/stats/student
// @access  Private
export const getStudentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. General performance summary
    const totalAttempts = await Result.countDocuments({ userId });
    const passedAttempts = await Result.countDocuments({ userId, passed: true });
    
    const statsAggregation = await Result.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: '$percentage' },
          bestPercentage: { $max: '$percentage' },
        },
      },
    ]);

    const averageScore = statsAggregation.length > 0 ? Math.round(statsAggregation[0].avgPercentage) : 0;
    const bestScore = statsAggregation.length > 0 ? statsAggregation[0].bestPercentage : 0;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    // 2. Score trend over attempts (last 10 attempts chronological)
    const attempts = await Result.find({ userId })
      .populate('quizId', 'title')
      .sort({ createdAt: 1 })
      .limit(10);

    const scoreTrend = attempts.map((attempt) => ({
      quizTitle: attempt.quizId ? attempt.quizId.title : 'Deleted Quiz',
      percentage: attempt.percentage,
      date: attempt.createdAt.toLocaleDateString(),
    }));

    // 3. Category strengths (average percentage per category)
    const categoryStrengths = await Result.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quizId',
          foreignField: '_id',
          as: 'quizDetails',
        },
      },
      { $unwind: '$quizDetails' },
      {
        $group: {
          _id: '$quizDetails.category',
          avgPercentage: { $avg: '$percentage' },
          attempts: { $sum: 1 },
        },
      },
      {
        $project: {
          category: '$_id',
          avgPercentage: { $round: ['$avgPercentage', 1] },
          attempts: 1,
          _id: 0,
        },
      },
      { $sort: { avgPercentage: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalAttempts,
          passedAttempts,
          averageScore,
          bestScore,
          passRate,
        },
        scoreTrend,
        categoryStrengths,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
