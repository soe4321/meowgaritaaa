import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export const FacultyLoginPage: React.FC = () => {
  const { loginFaculty, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('faculty.cs@campus.edu');
  const [password, setPassword] = useState('Faculty@123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginFaculty(email.trim(), password);
      // Determine redirection from local stored user if any or reload
      const savedUser = JSON.parse(localStorage.getItem('campus_od_user') || '{}');
      if (savedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/faculty/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid institutional staff credentials.');
    }
  };

  const autofill = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl border border-ivory-300 shadow-elevated p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-forest-800 text-ivory-100 mx-auto flex items-center justify-center mb-3 shadow-soft">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-charcoal-900">Faculty & Admin Portal</h2>
          <p className="text-xs text-charcoal-500 mt-1 font-sans">
            Institutional authentication for Department Advisors, HODs, and Administrative Dean.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5 font-mono">
              University Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty.cs@campus.edu or admin@campus.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5 font-mono">
              Staff Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-forest-800 text-white font-semibold rounded-xl text-xs hover:bg-forest-900 transition-colors shadow-soft flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? 'Authenticating Staff...' : 'Authorize & Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-ivory-200">
          <p className="text-[11px] font-mono text-charcoal-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-mustard-600" />
            Quick Demo Staff Credentials
          </p>
          <div className="flex flex-col gap-2 text-xs">
            <button
              type="button"
              onClick={() => autofill('faculty.cs@campus.edu', 'Faculty@123')}
              className="text-left px-3 py-2 bg-ivory-100 hover:bg-ivory-200 text-charcoal-800 rounded-lg border border-ivory-300 transition-colors flex items-center justify-between"
            >
              <span>Dr. Evelyn Reed (CSE Faculty Advisor)</span>
              <span className="font-mono text-[10px] text-forest-700">Fill Demo</span>
            </button>
            <button
              type="button"
              onClick={() => autofill('faculty.ec@campus.edu', 'Faculty@123')}
              className="text-left px-3 py-2 bg-ivory-100 hover:bg-ivory-200 text-charcoal-800 rounded-lg border border-ivory-300 transition-colors flex items-center justify-between"
            >
              <span>Prof. Marcus Vance (ECE Faculty Advisor)</span>
              <span className="font-mono text-[10px] text-forest-700">Fill Demo</span>
            </button>
            <button
              type="button"
              onClick={() => autofill('admin@campus.edu', 'Admin@123')}
              className="text-left px-3 py-2 bg-forest-50 hover:bg-forest-100 text-forest-900 rounded-lg border border-forest-200 transition-colors flex items-center justify-between"
            >
              <span>Dr. Arthur Pendelton (Dean / Admin)</span>
              <span className="font-mono text-[10px] text-forest-800 font-semibold">Fill Demo</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-charcoal-500">
          Undergraduate / Graduate Student?{' '}
          <Link to="/login/student" className="text-forest-800 font-semibold hover:underline">
            Switch to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
};
