import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  FiBookOpen,
  FiClock,
  FiAward,
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiGlobe,
  FiLock,
  FiPlus,
} from 'react-icons/fi';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;

      const res = await api.get('/quizzes', { params });
      if (res.data.success) {
        setQuizzes(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchQuizzes();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, difficulty]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz, its questions, and all attempt results?')) {
      try {
        const res = await api.delete(`/quizzes/${id}`);
        if (res.data.success) {
          toast.success(res.data.message);
          setQuizzes((prev) => prev.filter((q) => q._id !== id));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete quiz');
      }
    }
  };

  const togglePublish = async (quiz) => {
    try {
      const res = await api.put(`/quizzes/${quiz._id}`, { isPublished: !quiz.isPublished });
      if (res.data.success) {
        toast.success(`Quiz successfully ${!quiz.isPublished ? 'published' : 'unpublished'}`);
        setQuizzes((prev) =>
          prev.map((q) => (q._id === quiz._id ? { ...q, isPublished: !quiz.isPublished } : q))
        );
      }
    } catch (error) {
      toast.error('Failed to change publish status');
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100/30';
      case 'medium':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 border border-amber-100/30';
      case 'hard':
        return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100/30';
      default:
        return 'bg-gray-50 dark:bg-gray-900 text-gray-500 border border-gray-100/30';
    }
  };

  return (
    <div className="space-y-8 page-transition">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isAdmin ? 'Quiz Management' : 'Quizzes'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin ? 'Configure, edit, and publish platform quizzes' : 'Choose a quiz and test your knowledge'}
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/quizzes/create"
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Quiz</span>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/40 dark:bg-gray-800/40 p-4 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
            <FiSearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition-all"
          />
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
            <FiBookOpen />
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-700 dark:text-gray-300 transition-all"
          >
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Science">Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="History">History</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
            <FiFilter />
          </span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-700 dark:text-gray-300 transition-all"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="glass-card rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300 border border-gray-200/40 dark:border-gray-850"
            >
              <div>
                {/* Header indicators */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => togglePublish(quiz)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 border ${
                        quiz.isPublished
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-150'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-550 dark:text-gray-400 border-gray-250'
                      }`}
                      title={quiz.isPublished ? 'Click to Unpublish' : 'Click to Publish'}
                    >
                      {quiz.isPublished ? <FiGlobe /> : <FiLock />}
                      <span>{quiz.isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{quiz.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 line-clamp-2">{quiz.description}</p>
                
                <div className="mt-4 p-2 bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-2xl inline-block">
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider px-2">
                    {quiz.category}
                  </span>
                </div>
              </div>

              {/* Specs & Action */}
              <div className="mt-6 pt-5 border-t border-gray-150 dark:border-gray-800/60">
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span>{quiz.timeLimit} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiAward className="w-4 h-4 text-gray-400" />
                    <span>{quiz.totalMarks} Marks</span>
                  </div>
                </div>

                {/* Actions Button Group */}
                <div className="flex gap-2">
                  {isAdmin ? (
                    <>
                      <Link
                        to={`/quizzes/edit/${quiz._id}`}
                        className="flex-grow flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary-500/15 transition-all"
                      >
                        <FiEdit />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200/20 rounded-xl transition-all cursor-pointer"
                        title="Delete Quiz"
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  ) : (
                    <Link
                      to={`/quizzes/attempt/${quiz._id}`}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/15 transition-all"
                    >
                      <span>Start Attempt</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center text-gray-500">
          <FiBookOpen className="w-12 h-12 mx-auto text-gray-350 dark:text-gray-600 mb-4" />
          <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">No quizzes found</p>
          <p className="text-sm mt-1">Try modifying your search or filter keywords</p>
        </div>
      )}
    </div>
  );
};

export default QuizList;
