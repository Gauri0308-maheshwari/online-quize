import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiLogOut, FiMenu, FiUser } from 'react-icons/fi';

const Navbar = ({ toggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-effect border-b border-gray-200/50 dark:border-gray-800/50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {user && (
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary-500/20">
            Q
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-300">
            QuizPulse
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
          aria-label="Toggle Theme"
        >
          {isDark ? <FiSun className="w-5 h-5 text-amber-400" /> : <FiMoon className="w-5 h-5" />}
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            {/* User Info */}
            <Link to="/profile" className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</span>
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 capitalize">
                {user.role}
              </span>
            </Link>

            {/* Avatar */}
            <Link to="/profile" className="relative group">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover border border-primary-500"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold border border-primary-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-500/20 transition-all duration-200"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
