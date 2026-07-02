import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error('Please enter your email');
    }

    setLoading(true);
    setResetLink('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        toast.success('Reset link generated successfully!');
        if (res.data.resetToken) {
          // Expose link locally for ease of testing
          setResetLink(`http://localhost:5173/reset-password/${res.data.resetToken}`);
        }
      } else {
        toast.error(res.data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-61px)] flex items-center justify-center px-4 py-12 glow-bg dark:glow-bg-dark page-transition">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Recover Password</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <FiMail />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition-all duration-200 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Send Reset Link</span>
                <FiSend />
              </>
            )}
          </button>
        </form>

        {resetLink && (
          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900 rounded-2xl">
            <p className="text-xs font-semibold text-primary-800 dark:text-primary-300 mb-1">
              Development Reset Link:
            </p>
            <a
              href={resetLink}
              className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline break-all"
            >
              {resetLink}
            </a>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <FiArrowLeft />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
