import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiSave,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSettings,
  FiCheckSquare,
  FiSquare,
  FiInfo,
} from 'react-icons/fi';

const QuizCreateEdit = () => {
  const { id } = useParams(); // quiz ID if editing
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Quiz Settings State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimit, setTimeLimit] = useState(15);
  const [passingPercentage, setPassingPercentage] = useState(40);
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [negativeMarkingValue, setNegativeMarkingValue] = useState(0.25);
  const [totalMarks, setTotalMarks] = useState(0);

  // Questions Builder State
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null); // null means new question, else holds id
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  
  // Single Question Form State
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState([]); // Array of indices (0-3)
  const [questionType, setQuestionType] = useState('single');
  const [marks, setMarks] = useState(1);

  const [loading, setLoading] = useState(false);

  // Gemini AI Generator State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiPromptHint, setAiPromptHint] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchQuizDetails();
    }
  }, [id]);

  const fetchQuizDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/quizzes/${id}`);
      if (res.data.success) {
        const { quiz, questions: quizQuestions } = res.data.data;
        setTitle(quiz.title);
        setDescription(quiz.description);
        setCategory(quiz.category);
        setDifficulty(quiz.difficulty);
        setTimeLimit(quiz.timeLimit);
        setPassingPercentage(quiz.passingPercentage);
        setRandomizeQuestions(quiz.randomizeQuestions);
        setNegativeMarking(quiz.negativeMarking);
        setNegativeMarkingValue(quiz.negativeMarkingValue || 0.25);
        setTotalMarks(quiz.totalMarks);

        // Fetch questions from admin endpoint (which includes correctAnswers)
        const qRes = await api.get(`/questions/quiz/${id}`);
        if (qRes.data.success) {
          setQuestions(qRes.data.data);
        }
      }
    } catch (error) {
      toast.error('Failed to load quiz configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuizSettings = async (e) => {
    e.preventDefault();
    if (!title || !description || !category) {
      return toast.error('Please enter title, description, and category');
    }

    const quizPayload = {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      passingPercentage,
      randomizeQuestions,
      negativeMarking,
      negativeMarkingValue: negativeMarking ? negativeMarkingValue : 0,
    };

    try {
      setLoading(true);
      if (isEditMode) {
        const res = await api.put(`/quizzes/${id}`, quizPayload);
        if (res.data.success) {
          toast.success('Quiz settings updated successfully!');
          setTotalMarks(res.data.data.totalMarks);
        }
      } else {
        const res = await api.post('/quizzes', quizPayload);
        if (res.data.success) {
          toast.success('Quiz created! Now, configure its questions.');
          navigate(`/quizzes/edit/${res.data.data._id}`);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save quiz settings');
    } finally {
      setLoading(false);
    }
  };

  // Question handlers
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const toggleCorrectAnswer = (index) => {
    if (questionType === 'single') {
      setCorrectAnswers([index]);
    } else {
      setCorrectAnswers((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    }
  };

  const resetQuestionForm = () => {
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswers([]);
    setQuestionType('single');
    setMarks(1);
    setEditingQuestionId(null);
    setShowQuestionForm(false);
  };

  const openEditQuestion = (q) => {
    setEditingQuestionId(q._id);
    setQuestionText(q.questionText);
    setOptions(q.options);
    setCorrectAnswers(q.correctAnswers);
    setQuestionType(q.questionType);
    setMarks(q.marks);
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    if (!questionText) {
      return toast.error('Please enter the question text');
    }
    if (options.some((opt) => !opt.trim())) {
      return toast.error('Please enter all 4 option choices');
    }
    if (correctAnswers.length === 0) {
      return toast.error('Please select at least 1 correct answer');
    }
    if (questionType === 'single' && correctAnswers.length > 1) {
      return toast.error('Single choice questions can only have 1 correct answer');
    }

    const questionPayload = {
      quizId: id,
      questionText,
      options,
      correctAnswers,
      questionType,
      marks,
    };

    try {
      if (editingQuestionId) {
        // Edit question
        const res = await api.put(`/questions/${editingQuestionId}`, questionPayload);
        if (res.data.success) {
          toast.success('Question updated!');
          setQuestions((prev) =>
            prev.map((q) => (q._id === editingQuestionId ? res.data.data : q))
          );
          resetQuestionForm();
          // Reload settings to get updated totalMarks
          fetchQuizDetails();
        }
      } else {
        // Create question
        const res = await api.post('/questions', questionPayload);
        if (res.data.success) {
          toast.success('Question added successfully!');
          setQuestions((prev) => [...prev, res.data.data]);
          resetQuestionForm();
          // Reload settings to get updated totalMarks
          fetchQuizDetails();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (window.confirm('Delete this question?')) {
      try {
        const res = await api.delete(`/questions/${qId}`);
        if (res.data.success) {
          toast.success('Question deleted');
          setQuestions((prev) => prev.filter((q) => q._id !== qId));
          fetchQuizDetails();
        }
      } catch (error) {
        toast.error('Failed to delete question');
      }
    }
  };

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await api.post('/questions/generate', {
        quizId: id,
        numQuestions: aiNumQuestions,
        promptHint: aiPromptHint,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Questions generated successfully!');
        setShowAiModal(false);
        fetchQuizDetails();
      } else {
        toast.error(res.data.message || 'AI Generation failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate questions. Verify GEMINI_API_KEY is configured.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading && !isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 page-transition">
      <div className="flex items-center gap-3">
        <Link
          to="/quizzes"
          className="p-2 text-gray-500 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-xl transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isEditMode ? 'Edit Quiz' : 'Create Quiz'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isEditMode ? 'Configure settings and construct the question pool' : 'Set up basic details to define your quiz'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Panel */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-7 rounded-3xl shadow-lg space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <FiSettings className="text-primary-600 dark:text-primary-400 w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-850 dark:text-white">Quiz Settings</h2>
          </div>

          <form onSubmit={handleSaveQuizSettings} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                Quiz Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. JavaScript Closures & Scope"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief overview of this quiz..."
                rows="3"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-750 dark:text-gray-300 transition"
                >
                  <option value="Programming">Programming</option>
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="History">History</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-755 dark:text-gray-300 transition"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                  Time Limit (Mins)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-gray-750 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-primary-650 focus:ring-primary-500/20"
                />
                <span>Randomize questions order for student</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-gray-755 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-primary-650 focus:ring-primary-500/20"
                />
                <span>Enable negative marking</span>
              </label>
            </div>

            {negativeMarking && (
              <div className="p-4 bg-red-50/50 dark:bg-red-955/10 border border-red-200/20 rounded-2xl">
                <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1.5">
                  Marks to Deduct per Wrong Answer
                </label>
                <input
                  type="number"
                  required
                  step="0.05"
                  min="0"
                  value={negativeMarkingValue}
                  onChange={(e) => setNegativeMarkingValue(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-red-300/35 dark:border-red-900/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/10 text-gray-900 dark:text-white transition"
                />
              </div>
            )}

            {isEditMode && (
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100/50 dark:bg-gray-800/40 border border-gray-250/20 px-3.5 py-2.5 rounded-xl">
                <FiInfo className="text-primary-600 dark:text-primary-400" />
                <span>Current Total Marks: {totalMarks}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/15 hover:shadow-primary-500/25 transition cursor-pointer"
            >
              <FiSave />
              <span>{isEditMode ? 'Update Quiz Settings' : 'Create Quiz'}</span>
            </button>
          </form>
        </div>

        {/* Questions Panel */}
        <div className="lg:col-span-7 space-y-6">
          {!isEditMode ? (
            <div className="glass-card p-10 rounded-3xl text-center text-gray-500">
              <FiSettings className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-4 animate-spin-slow" />
              <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">Construct Questions</p>
              <p className="text-sm mt-1 max-w-xs mx-auto">
                Create the quiz first. Once created, you will be redirect to construct options, answers, and marks.
              </p>
            </div>
          ) : (
            <>
              {/* Question list & Add button */}
              <div className="flex justify-between items-center bg-white/40 dark:bg-gray-800/40 p-4 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Questions Pool ({questions.length})</h3>
                <div className="flex gap-2">
                  {!showQuestionForm && !showAiModal && (
                    <>
                      <button
                        onClick={() => {
                          setShowAiModal(true);
                          setAiNumQuestions(5);
                          setAiPromptHint('');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-605 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/15 transition cursor-pointer"
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>Generate with AI</span>
                      </button>
                      <button
                        onClick={() => {
                          resetQuestionForm();
                          setShowQuestionForm(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/15 transition cursor-pointer"
                      >
                        <FiPlus />
                        <span>Add Question</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* AI Question Generation Form */}
              {showAiModal && (
                <form
                  onSubmit={handleGenerateQuestions}
                  className="glass-card p-6 sm:p-7 rounded-3xl shadow-lg space-y-5 border-l-4 border-l-indigo-500"
                >
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h4 className="font-bold text-gray-850 dark:text-white flex items-center gap-2">
                      <FiSettings className="text-indigo-600 dark:text-indigo-400" />
                      <span>Generate Questions with Gemini AI</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAiModal(false)}
                      className="text-xs font-semibold text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                        Number of Questions (Max 10)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="10"
                        value={aiNumQuestions}
                        onChange={(e) => setAiNumQuestions(Math.min(10, Math.max(1, Number(e.target.value))))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 dark:text-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                        Target Difficulty
                      </label>
                      <input
                        type="text"
                        disabled
                        value={difficulty.toUpperCase()}
                        className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-855 rounded-xl text-gray-500 cursor-not-allowed font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                      Topics/Keywords Hint (Optional)
                    </label>
                    <textarea
                      value={aiPromptHint}
                      onChange={(e) => setAiPromptHint(e.target.value)}
                      placeholder="e.g. Focus on React hooks lifecycle, state dependency arrays, and custom hook design."
                      rows="3"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 dark:text-white transition"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition cursor-pointer"
                  >
                    {aiLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FiSettings />
                        <span>Generate Questions</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Question Construction Form */}
              {showQuestionForm && (
                <form
                  onSubmit={handleSaveQuestion}
                  className="glass-card p-6 sm:p-7 rounded-3xl shadow-lg space-y-5 border-l-4 border-l-primary-500"
                >
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h4 className="font-bold text-gray-850 dark:text-white">
                      {editingQuestionId ? 'Edit Question' : 'New Question Constructor'}
                    </h4>
                    <button
                      type="button"
                      onClick={resetQuestionForm}
                      className="text-xs font-semibold text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                      Question Description Text
                    </label>
                    <input
                      type="text"
                      required
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="e.g. Which keyword is used to declare block-scoped variables in modern JS?"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                        Answer Type
                      </label>
                      <select
                        value={questionType}
                        onChange={(e) => {
                          setQuestionType(e.target.value);
                          setCorrectAnswers([]); // reset CorrectAnswers to avoid mismatch
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-750 dark:text-gray-350 transition"
                      >
                        <option value="single">Single Correct Answer</option>
                        <option value="multiple">Multiple Correct Answers</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305 mb-1.5">
                        Marks Allocated
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={marks}
                        onChange={(e) => setMarks(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
                      />
                    </div>
                  </div>

                  {/* 4 Options */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-305">
                      Choices & Select Correct Option(s)
                    </label>

                    {options.map((opt, idx) => {
                      const isCorrect = correctAnswers.includes(idx);
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleCorrectAnswer(idx)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isCorrect
                                ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/10'
                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-450 hover:bg-gray-100'
                            }`}
                            title="Toggle correct state"
                          >
                            {questionType === 'single' ? (
                              isCorrect ? (
                                <FiCheckSquare className="w-5 h-5" />
                              ) : (
                                <FiSquare className="w-5 h-5" />
                              )
                            ) : isCorrect ? (
                              <FiCheckSquare className="w-5 h-5" />
                            ) : (
                              <FiSquare className="w-5 h-5" />
                            )}
                          </button>

                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-grow px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/10 transition cursor-pointer"
                  >
                    <span>{editingQuestionId ? 'Save Question Changes' : 'Add Question to Pool'}</span>
                  </button>
                </form>
              )}

              {/* Questions List display */}
              <div className="space-y-4">
                {questions.length > 0 ? (
                  questions.map((q, qIndex) => (
                    <div
                      key={q._id}
                      className="glass-card p-5 sm:p-6 rounded-3xl shadow-md space-y-4 hover:border-primary-500/20 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 capitalize">
                            Question {qIndex + 1} • {q.questionType === 'single' ? 'Single Select' : 'Multi Select'} • {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                          </span>
                          <h4 className="text-base font-bold text-gray-800 dark:text-white leading-snug">
                            {q.questionText}
                          </h4>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => openEditQuestion(q)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Options indicator */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = q.correctAnswers.includes(oIdx);
                          return (
                            <div
                              key={oIdx}
                              className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/35 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 font-semibold'
                                  : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              <span className="w-5 h-5 rounded bg-white dark:bg-gray-850 flex items-center justify-center font-semibold text-xs border border-gray-200 dark:border-gray-750">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="truncate">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-card p-12 text-center text-gray-500">
                    <p className="font-semibold text-base text-gray-800 dark:text-gray-200">Empty Question Pool</p>
                    <p className="text-xs mt-1">Click "Add Question" above to start populating this quiz.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCreateEdit;
