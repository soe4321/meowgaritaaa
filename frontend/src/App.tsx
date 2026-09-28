import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { useAuth } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { StudentLoginPage } from './pages/auth/StudentLoginPage';
import { FacultyLoginPage } from './pages/auth/FacultyLoginPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { ApplyODPage } from './pages/student/ApplyODPage';
import { MyApplicationsPage } from './pages/student/MyApplicationsPage';
import { ApplicationDetailPage } from './pages/student/ApplicationDetailPage';
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { UserRole } from './types';

// Role Guard Component
const ProtectedRoute: React.FC<{
  allowedRoles: UserRole[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-charcoal-400">
        Verifying institutional session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login/student" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-charcoal-800 antialiased selection:bg-forest-100 selection:text-forest-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Routes>
          {/* Public Landing & Login */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login/student" element={<StudentLoginPage />} />
          <Route path="/login/faculty" element={<FacultyLoginPage />} />

          {/* Student Dedicated Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/apply"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <ApplyODPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
                <ApplicationDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Faculty Routes */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <FacultyDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
