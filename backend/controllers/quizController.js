import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private/Admin
export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      passingPercentage,
      randomizeQuestions,
      negativeMarking,
      negativeMarkingValue,
    } = req.body;

    const quiz = new Quiz({
      title,
      description,
      category,
      difficulty,
      timeLimit,
      passingPercentage,
      randomizeQuestions,
      negativeMarking,
      negativeMarkingValue,
      createdBy: req.user._id,
    });

    const createdQuiz = await quiz.save();
    res.status(201).json({ success: true, data: createdQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private (Admin & Student)
export const getQuizzes = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    
    let query = {};

    // Filter out unpublished quizzes for students
    if (req.user.role === 'student') {
      query.isPublished = true;
    }

    // Apply category filter
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Apply difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Apply search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single quiz details
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // If it's a student, it must be published
    if (req.user.role === 'student' && !quiz.isPublished) {
      return res.status(403).json({ success: false, message: 'Quiz is not published yet' });
    }

    // Fetch questions associated with the quiz
    let questions = await Question.find({ quizId: quiz._id });

    // If student, remove correct answers for security
    if (req.user.role === 'student') {
      questions = questions.map((q) => {
        const qObj = q.toObject();
        delete qObj.correctAnswers;
        return qObj;
      });

      // Randomize questions if enabled
      if (quiz.randomizeQuestions) {
        questions.sort(() => Math.random() - 0.5);
      }
    }

    res.json({
      success: true,
      data: {
        quiz,
        questions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      passingPercentage,
      isPublished,
      randomizeQuestions,
      negativeMarking,
      negativeMarkingValue,
    } = req.body;

    quiz.title = title !== undefined ? title : quiz.title;
    quiz.description = description !== undefined ? description : quiz.description;
    quiz.category = category !== undefined ? category : quiz.category;
    quiz.difficulty = difficulty !== undefined ? difficulty : quiz.difficulty;
    quiz.timeLimit = timeLimit !== undefined ? timeLimit : quiz.timeLimit;
    quiz.passingPercentage = passingPercentage !== undefined ? passingPercentage : quiz.passingPercentage;
    quiz.isPublished = isPublished !== undefined ? isPublished : quiz.isPublished;
    quiz.randomizeQuestions = randomizeQuestions !== undefined ? randomizeQuestions : quiz.randomizeQuestions;
    quiz.negativeMarking = negativeMarking !== undefined ? negativeMarking : quiz.negativeMarking;
    quiz.negativeMarkingValue = negativeMarkingValue !== undefined ? negativeMarkingValue : quiz.negativeMarkingValue;

    const updatedQuiz = await quiz.save();
    res.json({ success: true, data: updatedQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Delete associated questions and results
    await Question.deleteMany({ quizId: quiz._id });
    await Result.deleteMany({ quizId: quiz._id });
    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Quiz and all associated questions & results deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
