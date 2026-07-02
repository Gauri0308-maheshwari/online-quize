import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid,
  FiBookOpen,
  FiPlusSquare,
  FiUser,
  FiAward,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  if (!user) return null;

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/quizzes', label: 'Quizzes', icon: FiBookOpen },
    { to: '/quizzes/create', label: 'Create Quiz', icon: FiPlusSquare },
    { to: '/profile', label: 'Profile', icon: FiUser },
  ];

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/quizzes', label: 'Take Quiz', icon: FiBookOpen },
    { to: '/profile', label: 'Profile', icon: FiUser },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-[61px] left-0 z-40 w-64 h-[calc(100vh-61px)] border-r border-gray-200/50 dark:border-gray-800/50 glass-effect p-4 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Mobile close button */}
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-gray-100 dark:border-gray-800">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Menu Navigation</span>
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => isOpen && toggleSidebar()}
                  className={navLinkClass}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Mini Banner */}
        <div className="p-3 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/30 rounded-xl flex items-center gap-3">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover border border-primary-500/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">{user.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">{user.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
