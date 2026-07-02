import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import QuizList from './pages/QuizList';
import QuizCreateEdit from './pages/QuizCreateEdit';
import QuizAttempt from './pages/QuizAttempt';
import QuizResult from './pages/QuizResult';
import Profile from './pages/Profile';

// Toast Notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Dashboard Dispatcher based on Role
const DashboardDispatcher = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
};

// Main Layout Wrapper
const Layout = () => {
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-250">
      <Navbar toggleMobileSidebar={toggleMobileSidebar} />
      
      <div className="flex flex-1 relative">
        {user && (
          <Sidebar isOpen={mobileSidebarOpen} toggleSidebar={toggleMobileSidebar} />
        )}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ${user ? 'w-full md:max-w-[calc(100vw-256px)]' : 'max-w-7xl mx-auto w-full'}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

            {/* Protected Role-Based Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardDispatcher />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <QuizList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/create"
              element={
                <ProtectedRoute adminOnly={true}>
                  <QuizCreateEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/edit/:id"
              element={
                <ProtectedRoute adminOnly={true}>
                  <QuizCreateEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/attempt/:id"
              element={
                <ProtectedRoute>
                  <QuizAttempt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:id"
              element={
                <ProtectedRoute>
                  <QuizResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Layout />
          <ToastContainer
            position="top-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
