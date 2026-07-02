import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiCamera, FiAward, FiCheckCircle, FiClock } from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPreview(user.profilePicture || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchPersonalStats = async () => {
      try {
        const endpoint = user?.role === 'admin' ? '/stats/admin' : '/stats/student';
        const res = await api.get(endpoint);
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load profile statistics');
      }
    };
    if (user) {
      fetchPersonalStats();
    }
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password && password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (password) formData.append('password', password);
    if (file) formData.append('profilePicture', file);

    const res = await updateProfile(formData);
    setLoading(false);

    if (res.success) {
      toast.success('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setFile(null);
    } else {
      toast.error(res.message || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-8 page-transition">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Your Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal details, credentials, and track your history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Card and Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Photo Card */}
          <div className="md:col-span-4 glass-card p-6 sm:p-7 rounded-3xl shadow-lg flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-primary-500/20"
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-primary-105 dark:bg-primary-955/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-4xl border border-primary-500/20">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <label className="absolute bottom-1 right-1 p-2 bg-primary-600 hover:bg-primary-705 text-white rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105">
                <FiCamera className="w-4.5 h-4.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[180px]">
                {user?.name}
              </h3>
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase mt-1 tracking-wider">
                {user?.role}
              </p>
            </div>
          </div>

          {/* Details Form */}
          <div className="md:col-span-8 glass-card p-6 sm:p-7 rounded-3xl shadow-lg space-y-5">
            <h3 className="text-base font-bold text-gray-850 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              Account Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-750 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <FiUser />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-755 dark:text-gray-300 mb-1.5">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-sm font-semibold text-gray-750 dark:text-gray-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <FiLock />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep same"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-750 dark:text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <FiLock />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Leave blank to keep same"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-900 dark:text-white transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/15 transition cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>

        {/* Stats Panel */}
        {user?.role === 'student' && stats && (
          <div className="lg:col-span-4 glass-card p-6 sm:p-7 rounded-3xl shadow-lg space-y-6">
            <h3 className="text-base font-bold text-gray-850 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              Performance Summary
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/30 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FiClock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Attempts</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">{stats.summary?.totalAttempts || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/30 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Pass Rate</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">{stats.summary?.passRate || 0}%</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/30 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FiAward className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Average Score</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">{stats.summary?.averageScore || 0}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
