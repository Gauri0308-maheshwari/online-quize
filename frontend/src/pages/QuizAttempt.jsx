import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiClock, FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Answers state: { [questionId]: [selectedOptionIndices] }
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem(`quiz_answers_${id}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const submissionTriggeredRef = useRef(false);

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Handle answers local storage sync
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`quiz_answers_${id}`, JSON.stringify(answers));
    }
  }, [answers, id]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quizzes/${id}`);
      if (res.data.success) {
        setQuiz(res.data.data.quiz);
        setQuestions(res.data.data.questions);
        
        // Start time limit
        const limitMinutes = res.data.data.quiz.timeLimit || 10;
        setTimeLeft(limitMinutes * 60);
        startTimeRef.current = Date.now();

        // Check if there are saved answers, if not initialize
        const saved = localStorage.getItem(`quiz_answers_${id}`);
        if (!saved) {
          setAnswers({});
        }

        // Initialize Countdown Timer
        startTimer(limitMinutes * 60);
      }
    } catch (error) {
      toast.error('Failed to load quiz details');
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (durationSeconds) => {
    let timer = durationSeconds;
    timerRef.current = setInterval(() => {
      timer--;
      setTimeLeft(timer);

      if (timer <= 0) {
        clearInterval(timerRef.current);
        toast.info('Time limit reached! Auto-submitting quiz...');
        handleAutoSubmit();
      }
    }, 1000);
  };

  const handleOptionSelect = (qId, optionIdx, qType) => {
    setAnswers((prev) => {
      const currentSelections = prev[qId] || [];
      let newSelections = [];

      if (qType === 'single') {
        newSelections = [optionIdx];
      } else {
        // Multi-correct check
        newSelections = currentSelections.includes(optionIdx)
          ? currentSelections.filter((idx) => idx !== optionIdx)
          : [...currentSelections, optionIdx];
      }

      return {
        ...prev,
        [qId]: newSelections,
      };
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuizPayload = () => {
    // Map answers into array expected by backend
    const answersArray = Object.keys(answers).map((qId) => ({
      questionId: qId,
      selectedOptions: answers[qId],
    }));

    // Calculate time taken
    const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const timeTaken = Math.min(elapsedSeconds, (quiz?.timeLimit || 15) * 60);

    return {
      quizId: id,
      answers: answersArray,
      timeTaken,
    };
  };

  const submitAttempt = async (payload) => {
    if (submissionTriggeredRef.current) return;
    submissionTriggeredRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);

    try {
      const res = await api.post('/results/submit', payload);
      if (res.data.success) {
        toast.success('Quiz submitted successfully!');
        // Clean local storage
        localStorage.removeItem(`quiz_answers_${id}`);
        navigate(`/results/${res.data.data._id}`);
      }
    } catch (error) {
      toast.error('Failed to submit quiz attempt');
      setLoading(false);
      submissionTriggeredRef.current = false;
    }
  };

  const handleManualSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).filter(qId => answers[qId].length > 0).length;
    let message = 'Are you sure you want to submit?';
    if (unansweredCount > 0) {
      message = `You have ${unansweredCount} unanswered question(s). Submit anyway?`;
    }

    if (window.confirm(message)) {
      submitAttempt(getQuizPayload());
    }
  };

  const handleAutoSubmit = () => {
    submitAttempt(getQuizPayload());
  };

  if (loading && !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeQuestion = questions[activeIdx];
  const totalQuestions = questions.length;
  const isTimeCritical = timeLeft < 60; // Under 1 minute left

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start page-transition">
      {/* Quiz Body */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card p-6 sm:p-7 rounded-3xl shadow-lg flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white leading-snug">
              {quiz?.title}
            </h1>
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-450 uppercase tracking-wider mt-1">
              Category: {quiz?.category} • Passing score: {quiz?.passingPercentage}%
            </p>
          </div>

          {/* Time Limit Indicator */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-bold text-sm transition-all duration-350 ${
              isTimeCritical
                ? 'bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-450 border-red-200 timer-pulse'
                : 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border-primary-100/30'
            }`}
          >
            <FiClock className={`${isTimeCritical ? 'animate-spin-slow text-red-650' : 'text-primary-600'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Active Question Box */}
        {activeQuestion && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-lg space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                Question {activeIdx + 1} of {totalQuestions}
              </span>
              <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full">
                {activeQuestion.marks} {activeQuestion.marks === 1 ? 'Mark' : 'Marks'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
              {activeQuestion.questionText}
            </h3>

            {/* MCQ Options */}
            <div className="space-y-3">
              {activeQuestion.options.map((opt, oIdx) => {
                const isSelected = (answers[activeQuestion._id] || []).includes(oIdx);
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleOptionSelect(activeQuestion._id, oIdx, activeQuestion.questionType)}
                    className={`w-full text-left p-4 rounded-2xl border flex items-center gap-4 transition-all duration-200 hover:scale-[1.008] cursor-pointer ${
                      isSelected
                        ? 'bg-primary-50/50 dark:bg-primary-950/20 border-primary-600 text-primary-800 dark:text-primary-400 font-semibold shadow-md shadow-primary-550/5'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-850'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs border ${
                        isSelected
                          ? 'bg-primary-600 border-primary-650 text-white'
                          : 'bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-700 text-gray-500'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
                disabled={activeIdx === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-sm transition-all disabled:opacity-50"
              >
                <FiChevronLeft className="w-5 h-5" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => setActiveIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                disabled={activeIdx === totalQuestions - 1}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-sm transition-all disabled:opacity-50"
              >
                <span>Next</span>
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation panel */}
      <div className="lg:col-span-4 glass-card p-6 sm:p-7 rounded-3xl shadow-lg space-y-6">
        <h3 className="text-base font-bold text-gray-850 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
          Question Navigator
        </h3>

        {/* Navigation Grid */}
        <div className="grid grid-cols-5 gap-2.5">
          {questions.map((q, idx) => {
            const hasAnswered = (answers[q._id] || []).length > 0;
            const isActive = idx === activeIdx;

            return (
              <button
                key={q._id}
                onClick={() => setActiveIdx(idx)}
                className={`w-full aspect-square rounded-xl border flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-primary-500 border-primary-600 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 scale-105'
                    : hasAnswered
                    ? 'bg-primary-600 border-primary-650 text-white shadow-md shadow-primary-500/10'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-105 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-4.5 h-4.5 rounded bg-primary-600 border border-primary-600"></span>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4.5 h-4.5 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"></span>
            <span>Unanswered</span>
          </div>
        </div>

        <button
          onClick={handleManualSubmit}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transition cursor-pointer"
        >
          <FiCheckCircle />
          <span>Submit Quiz</span>
        </button>
      </div>
    </div>
  );
};

export default QuizAttempt;
