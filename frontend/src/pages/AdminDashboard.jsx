import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FiUsers, FiBookOpen, FiActivity, FiAward } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/admin');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { cards = {}, mostAttempted = [], quizPerformance = [], attemptTrends = [] } = stats || {};

  const cardList = [
    {
      title: 'Total Students',
      value: cards.totalUsers || 0,
      icon: FiUsers,
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Quizzes',
      value: cards.totalQuizzes || 0,
      icon: FiBookOpen,
      color: 'from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400',
    },
    {
      title: 'Total Attempts',
      value: cards.totalAttempts || 0,
      icon: FiActivity,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Average Score',
      value: `${cards.averageScore || 0}%`,
      icon: FiAward,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-8 page-transition">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Monitor platform activity, user performance, and quiz statistics
        </p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attempts Trend Area Chart */}
        <div className="glass-card p-6 rounded-3xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quiz Attempts Trend</h3>
          <div className="h-80 w-full">
            {attemptTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attemptTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      borderRadius: '16px',
                      border: 'none',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attempts"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAttempts)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                No attempt records yet
              </div>
            )}
          </div>
        </div>

        {/* Quiz Performance Bar Chart */}
        <div className="glass-card p-6 rounded-3xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quiz Average Scores (%)</h3>
          <div className="h-80 w-full">
            {quizPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="title" stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      borderRadius: '16px',
                      border: 'none',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="avgScore" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                No performance data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Most Attempted Quizzes Grid Table */}
      <div className="glass-card p-6 rounded-3xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Most Attempted Quizzes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {mostAttempted.length > 0 ? (
                mostAttempted.map((quiz, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all duration-150"
                  >
                    <td className="py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">{quiz.title}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      <span className="px-2.5 py-1 text-xs rounded-full bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-semibold border border-primary-100/30">
                        {quiz.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-850 dark:text-gray-305 font-bold text-right">
                      {quiz.attemptsCount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-sm text-gray-500">
                    No quizzes attempted yet
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

export default AdminDashboard;
