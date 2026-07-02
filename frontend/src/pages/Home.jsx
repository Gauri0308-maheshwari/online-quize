import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiBookOpen, FiAward, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FiBookOpen,
      title: 'Diverse Categories',
      desc: 'Explore quizzes across multiple technical and academic domains.',
    },
    {
      icon: FiAward,
      title: 'Official Certificates',
      desc: 'Earn a dynamic PDF certificate upon passing a quiz to showcase your skills.',
    },
    {
      icon: FiTrendingUp,
      title: 'Detailed Analytics',
      desc: 'Track score metrics and category strengths with comprehensive analytics charts.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-61px)] flex flex-col justify-between glow-bg dark:glow-bg-dark page-transition">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex-grow flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100/50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-800/30 text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-semibold mb-6">
          <FiCheckCircle className="w-4 h-4 animate-bounce" />
          <span>New: Customizable MCQ & Multi-correct Quizzes</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl">
          Supercharge Your Learning with{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-300">
            QuizPulse
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
          An advanced real-time testing platform equipped with live timers, automated grading, leaderboard rankings, and student metrics.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200"
            >
              <span>Go to Dashboard</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200"
              >
                <span>Get Started Free</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center justify-center transition-all duration-200"
              >
                <span>Browse Quizzes</span>
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 sm:mt-28 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 sm:p-8 rounded-3xl hover:translate-y-[-4px] hover:shadow-2xl hover:border-primary-500/30 transition-all duration-300 text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/50 dark:border-gray-800/50 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2026 QuizPulse Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
