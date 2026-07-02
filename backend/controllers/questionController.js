import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to recalculate and update a quiz's total marks
const updateQuizTotalMarks = async (quizId) => {
  try {
    const questions = await Question.find({ quizId });
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    await Quiz.findByIdAndUpdate(quizId, { totalMarks });
  } catch (error) {
    console.error(`Error updating quiz total marks: ${error.message}`);
  }
};

// @desc    Add a question to a quiz
// @route   POST /api/questions
// @access  Private/Admin
export const addQuestion = async (req, res) => {
  try {
    const { quizId, questionText, options, correctAnswers, questionType, marks } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const question = new Question({
      quizId,
      questionText,
      options,
      correctAnswers,
      questionType,
      marks: marks || 1,
    });

    const createdQuestion = await question.save();
    
    // Recalculate total marks for the quiz
    await updateQuizTotalMarks(quizId);

    res.status(201).json({ success: true, data: createdQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all questions for a quiz (Admin only)
// @route   GET /api/questions/quiz/:quizId
// @access  Private/Admin
export const getQuestionsByQuiz = async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const { questionText, options, correctAnswers, questionType, marks } = req.body;

    question.questionText = questionText !== undefined ? questionText : question.questionText;
    question.options = options !== undefined ? options : question.options;
    question.correctAnswers = correctAnswers !== undefined ? correctAnswers : question.correctAnswers;
    question.questionType = questionType !== undefined ? questionType : question.questionType;
    question.marks = marks !== undefined ? marks : question.marks;

    const updatedQuestion = await question.save();

    // Recalculate total marks for the quiz
    await updateQuizTotalMarks(question.quizId);

    res.json({ success: true, data: updatedQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const quizId = question.quizId;
    await Question.findByIdAndDelete(req.params.id);

    // Recalculate total marks for the quiz
    await updateQuizTotalMarks(quizId);

    res.json({ success: true, message: 'Question deleted and quiz total marks updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate questions using Gemini API
// @route   POST /api/questions/generate
// @access  Private/Admin
export const generateQuestions = async (req, res) => {
  try {
    const { quizId, numQuestions = 5, promptHint = '' } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(400).json({
        success: false,
        message: 'Gemini API Key is not configured. Please set GEMINI_API_KEY in backend .env'
      });
    }

    // Initialize Gemini SDK

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

    const prompt = `
      You are an expert quiz generator. Generate exactly ${numQuestions} multiple choice questions for a quiz with the following metadata:
      - Title: "${quiz.title}"
      - Description: "${quiz.description}"
      - Category: "${quiz.category}"
      - Difficulty: "${quiz.difficulty}"

      Additional instructions/topics to cover: ${promptHint || 'None'}

      Each question must have:
      1. A clear "questionText".
      2. Exactly 4 "options" (array of 4 strings).
      3. An array of "correctAnswers" representing the 0-based indices of the correct options in the options array. For example, if option 1 is correct, it should be [0]. If options 1 and 3 are correct, it should be [0, 2].
      4. A "questionType" which must be either "single" (only 1 element in correctAnswers) or "multiple" (more than 1 element in correctAnswers).
      5. "marks" which should be a number, e.g. 1, 2, or 3, fitting the difficulty level.

      You must return the response as a single JSON object matching this schema:
      {
        "questions": [
          {
            "questionText": string,
            "options": [string, string, string, string],
            "correctAnswers": [number],
            "questionType": "single" | "multiple",
            "marks": number
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(textResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output:', textResponse);
      return res.status(500).json({ success: false, message: 'Gemini AI returned invalid JSON structure' });
    }

    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      return res.status(500).json({ success: false, message: 'Gemini response is missing questions array' });
    }

    const createdQuestions = [];

    for (const q of parsedData.questions) {
      // Validate structure before inserting
      if (
        !q.questionText ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        !Array.isArray(q.correctAnswers) ||
        q.correctAnswers.length === 0
      ) {
        continue; // Skip invalid question schemas
      }

      const questionType = q.correctAnswers.length > 1 ? 'multiple' : 'single';

      const question = new Question({
        quizId: quiz._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswers: q.correctAnswers,
        questionType,
        marks: q.marks || 1,
      });

      const savedQ = await question.save();
      createdQuestions.push(savedQ);
    }

    // Recalculate total marks for the quiz
    await updateQuizTotalMarks(quiz._id);

    res.status(201).json({
      success: true,
      message: `Successfully generated and saved ${createdQuestions.length} questions.`,
      data: createdQuestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

