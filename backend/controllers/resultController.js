import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';

// Helper to compare two arrays for equality (order-independent)
const compareAnswers = (arr1, arr2) => {
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  return arr1.every(val => arr2.includes(val)) && arr2.every(val => arr1.includes(val));
};

// @desc    Submit a quiz attempt
// @route   POST /api/results/submit
// @access  Private
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const userId = req.user._id;

    // Fetch quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Fetch all questions for this quiz
    const questions = await Question.find({ quizId });
    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Quiz has no questions' });
    }

    let totalMarks = quiz.totalMarks || questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    let earnedScore = 0;
    const evaluatedAnswers = [];

    // Map answers by questionId for fast lookup
    const userAnswersMap = {};
    if (answers && Array.isArray(answers)) {
      answers.forEach((ans) => {
        userAnswersMap[ans.questionId] = ans.selectedOptions || [];
      });
    }

    // Evaluate each question
    questions.forEach((question) => {
      const selected = userAnswersMap[question._id] || [];
      const correct = question.correctAnswers;
      
      const isCorrect = compareAnswers(selected, correct);
      
      if (isCorrect) {
        earnedScore += question.marks;
      } else {
        // Apply negative marking if configured and user actually selected something
        if (quiz.negativeMarking && selected.length > 0) {
          earnedScore -= quiz.negativeMarkingValue;
        }
      }

      evaluatedAnswers.push({
        questionId: question._id,
        selectedOptions: selected,
        isCorrect,
      });
    });

    // Score cannot be negative
    if (earnedScore < 0) {
      earnedScore = 0;
    }

    // Calculate percentage
    const percentage = totalMarks > 0 ? Math.round((earnedScore / totalMarks) * 100) : 0;
    const passed = percentage >= quiz.passingPercentage;

    // Save result
    const result = new Result({
      userId,
      quizId,
      score: earnedScore,
      percentage,
      passed,
      answers: evaluatedAnswers,
      timeTaken,
    });

    const savedResult = await result.save();

    res.status(201).json({
      success: true,
      data: savedResult,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user attempts (Student history)
// @route   GET /api/results/user
// @access  Private
export const getUserAttempts = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user._id })
      .populate({
        path: 'quizId',
        select: 'title category difficulty totalMarks timeLimit passingPercentage',
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed result by ID (includes question contents & correct answers)
// @route   GET /api/results/:id
// @access  Private
export const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('userId', 'name email profilePicture')
      .populate({
        path: 'quizId',
        select: 'title category difficulty totalMarks timeLimit passingPercentage negativeMarking negativeMarkingValue',
      });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    // Check auth: students can only view their own results, admins can view any
    if (req.user.role === 'student' && result.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this result' });
    }

    // Fetch quiz questions to return rich details
    const questions = await Question.find({ quizId: result.quizId._id });

    // Map questions with correctAnswers and user selections
    const detailedAnswers = result.answers.map((ans) => {
      const question = questions.find((q) => q._id.toString() === ans.questionId.toString());
      return {
        questionId: ans.questionId,
        questionText: question ? question.questionText : 'Question deleted',
        options: question ? question.options : [],
        correctAnswers: question ? question.correctAnswers : [],
        questionType: question ? question.questionType : 'single',
        marks: question ? question.marks : 0,
        selectedOptions: ans.selectedOptions,
        isCorrect: ans.isCorrect,
      };
    });

    res.json({
      success: true,
      data: {
        _id: result._id,
        quiz: result.quizId,
        user: result.userId,
        score: result.score,
        percentage: result.percentage,
        passed: result.passed,
        timeTaken: result.timeTaken,
        submittedAt: result.createdAt,
        answers: detailedAnswers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leaderboard for a specific quiz
// @route   GET /api/results/leaderboard/:quizId
// @access  Private
export const getQuizLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Aggregate to get unique users' top score for the quiz
    const leaderboard = await Result.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      { $sort: { score: -1, timeTaken: 1 } }, // Sort by score desc, then timeTaken asc
      {
        $group: {
          _id: '$userId',
          bestScore: { $first: '$score' },
          percentage: { $first: '$percentage' },
          passed: { $first: '$passed' },
          timeTaken: { $first: '$timeTaken' },
          submittedAt: { $first: '$createdAt' },
          resultId: { $first: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          score: '$bestScore',
          percentage: 1,
          passed: 1,
          timeTaken: 1,
          submittedAt: 1,
          resultId: 1,
          user: {
            name: '$userDetails.name',
            email: '$userDetails.email',
            profilePicture: '$userDetails.profilePicture',
          },
        },
      },
      { $sort: { score: -1, timeTaken: 1 } },
      { $limit: 10 }, // Top 10 leaders
    ]);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
