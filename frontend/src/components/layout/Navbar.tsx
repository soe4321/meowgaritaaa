import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationDrawer } from '../common/NotificationDrawer';
import {
  GraduationCap,
  Bell,
  LogOut,
  User,
  PlusCircle,
  FileCheck2,
  Calendar,
  Layers,
  Menu,
  X,
  Shield,
  BookOpen,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-ivory-300 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & College Title */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-forest-800 text-ivory-100 flex items-center justify-center shadow-sm group-hover:bg-forest-900 transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-charcoal-900 tracking-tight block leading-none">
                  Campus<span className="text-forest-700">OD</span>
                </span>
                <span className="text-[10px] font-sans text-charcoal-500 uppercase tracking-widest block mt-0.5">
                  Institutional Portal
                </span>
              </div>
            </Link>

            {/* Role Specific Desktop Links */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-ivory-300">
                {user?.role === 'STUDENT' && (
                  <>
                    <Link
                      to="/student/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive('/student/dashboard')
                          ? 'bg-forest-50 text-forest-800 font-semibold'
                          : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/student/apply"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        isActive('/student/apply')
                          ? 'bg-forest-800 text-white font-semibold'
                          : 'bg-forest-50 text-forest-800 hover:bg-forest-100'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Apply for OD
                    </Link>
                    <Link
                      to="/student/applications"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive('/student/applications')
                          ? 'bg-forest-50 text-forest-800 font-semibold'
                          : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                      }`}
                    >
                      My Applications
                    </Link>
                  </>
                )}

                {user?.role === 'FACULTY' && (
                  <>
                    <Link
                      to="/faculty/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive('/faculty/dashboard')
                          ? 'bg-forest-50 text-forest-800 font-semibold'
                          : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                      }`}
                    >
                      Review Queue
                    </Link>
                  </>
                )}

                {user?.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive('/admin/dashboard')
                          ? 'bg-forest-50 text-forest-800 font-semibold'
                          : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                      }`}
                    >
                      Admin Center
                    </Link>
                    <Link
                      to="/admin/events"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive('/admin/events')
                          ? 'bg-forest-50 text-forest-800 font-semibold'
                          : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                      }`}
                    >
                      Events
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive('/admin/users')
                          ? 'bg-forest-50 text-forest-800 font-semibold'
                          : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                      }`}
                    >
                      Directory
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login/student"
                  className="px-3.5 py-2 text-xs font-medium text-forest-900 hover:text-forest-950 hover:bg-ivory-200/70 rounded-lg transition-colors"
                >
                  Student Portal
                </Link>
                <Link
                  to="/login/faculty"
                  className="px-4 py-2 text-xs font-medium text-white bg-forest-800 hover:bg-forest-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" /> Faculty / Admin
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-200 rounded-lg transition-colors relative"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta-600 text-[10px] font-bold text-white shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
                </div>

                {/* Profile Pill */}
                <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-ivory-300">
                  <div className="w-8 h-8 rounded-full bg-ivory-200 border border-ivory-300 flex items-center justify-center text-charcoal-700 font-serif font-bold text-sm">
                    {user?.fullName.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-charcoal-900 truncate max-w-[120px]">
                      {user?.fullName}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                        user?.role === 'ADMIN'
                          ? 'bg-terracotta-100 text-terracotta-800'
                          : user?.role === 'FACULTY'
                          ? 'bg-mustard-100 text-mustard-800'
                          : 'bg-forest-100 text-forest-800'
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-charcoal-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-charcoal-600 hover:bg-ivory-200 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-ivory-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="pb-3 border-b border-ivory-200">
                <p className="text-xs font-semibold text-charcoal-900">{user?.fullName}</p>
                <p className="text-[11px] text-charcoal-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-forest-100 text-forest-800">
                  {user?.role} Portal
                </span>
              </div>

              {user?.role === 'STUDENT' && (
                <>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-charcoal-800 hover:bg-ivory-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/student/apply"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-forest-800 font-medium bg-forest-50"
                  >
                    + Apply for OD
                  </Link>
                  <Link
                    to="/student/applications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-charcoal-800 hover:bg-ivory-100"
                  >
                    My Applications
                  </Link>
                </>
              )}

              {user?.role === 'FACULTY' && (
                <Link
                  to="/faculty/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-charcoal-800 hover:bg-ivory-100"
                >
                  Faculty Review Queue
                </Link>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-charcoal-800 hover:bg-ivory-100"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/events"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-charcoal-800 hover:bg-ivory-100"
                  >
                    Events Management
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-charcoal-800 hover:bg-ivory-100"
                  >
                    User Directory
                  </Link>
                </>
              )}

              <div className="pt-2 border-t border-ivory-200">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login/student"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-medium text-forest-900 border border-ivory-300 rounded-lg bg-ivory-50"
              >
                Student Portal
              </Link>
              <Link
                to="/login/faculty"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-medium text-white bg-forest-800 rounded-lg"
              >
                Faculty / Admin Login
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
