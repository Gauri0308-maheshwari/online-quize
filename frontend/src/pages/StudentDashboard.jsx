import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FiCheckCircle, FiActivity, FiAward, FiClock, FiEye } from 'react-icons/fi';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/stats/student');
        const attemptsRes = await api.get('/results/user');
        
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (attemptsRes.data.success) {
          setAttempts(attemptsRes.data.data);
        }
      } catch (error) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { summary = {}, scoreTrend = [], categoryStrengths = [] } = stats || {};

  const cardList = [
    {
      title: 'Quizzes Taken',
      value: summary.totalAttempts || 0,
      icon: FiActivity,
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Pass Rate',
      value: `${summary.passRate || 0}%`,
      icon: FiCheckCircle,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Average Score',
      value: `${summary.averageScore || 0}%`,
      icon: FiClock,
      color: 'from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400',
    },
    {
      title: 'Best Score',
      value: `${summary.bestScore || 0}%`,
      icon: FiAward,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-8 page-transition">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Student Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your quiz progress, learning curves, and score history
          </p>
        </div>
        <Link
          to="/quizzes"
          className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200"
        >
          Explore Available Quizzes
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardList.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card p-6 rounded-3xl flex items-center gap-5 shadow-lg">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-405 uppercase tracking-wider">
                  {card.title}
                </p>
                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1">
                  {card.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphs Grid */}
      {summary.totalAttempts > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Score Trend Line Chart */}
          <div className="glass-card p-6 rounded-3xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quiz Score History</h3>
            <div className="h-80 w-full">
              {scoreTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="quizTitle" stroke="#9ca3af" fontSize={9} />
                    <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        borderRadius: '16px',
                        border: 'none',
                        color: '#fff',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#7c3aed"
                      strokeWidth={3}
                      dot={{ r: 4, stroke: '#7c3aed', strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-500">
                  Insufficient data for score plotting
                </div>
              )}
            </div>
          </div>

          {/* Category Strengths Bar Chart */}
          <div className="glass-card p-6 rounded-3xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Category Average Scores (%)</h3>
            <div className="h-80 w-full">
              {categoryStrengths.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStrengths} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="category" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        borderRadius: '16px',
                        border: 'none',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="avgPercentage" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-500">
                  No categories to display
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Attempts list */}
      <div className="glass-card p-6 rounded-3xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Recent Attempts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Quiz</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length > 0 ? (
                attempts.map((attempt) => (
                  <tr
                    key={attempt._id}
                    className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all duration-150"
                  >
                    <td className="py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">
                      {attempt.quizId?.title || 'Deleted Quiz'}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-450">
                      <span className="px-2.5 py-1 text-xs rounded-full bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-semibold border border-primary-100/30">
                        {attempt.quizId?.category || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">
                      {attempt.score}/{attempt.quizId?.totalMarks || 0} ({attempt.percentage}%)
                    </td>
                    <td className="py-4 px-4">
                      {attempt.passed ? (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-100/30">
                          Passed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold border border-red-100/30">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/results/${attempt._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/60 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-lg border border-primary-100/30 transition-all duration-150"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm text-gray-505 dark:text-gray-400">
                    You haven't attempted any quizzes yet.{' '}
                    <Link to="/quizzes" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                      Attempt now
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
