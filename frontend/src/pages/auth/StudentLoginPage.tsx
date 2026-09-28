import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, ArrowRight, Lock, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react';

export const StudentLoginPage: React.FC = () => {
  const { loginStudent, isLoading } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('student1@campus.edu');
  const [password, setPassword] = useState('Student@123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginStudent(identifier.trim(), password);
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid Register Number / Email or Password.');
    }
  };

  const autofillDemo = (email: string) => {
    setIdentifier(email);
    setPassword('Student@123');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl border border-ivory-300 shadow-elevated p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-forest-800 text-ivory-100 mx-auto flex items-center justify-center mb-3 shadow-soft">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-charcoal-900">Student Sign In</h2>
          <p className="text-xs text-charcoal-500 mt-1 font-sans">
            Enter your Register Number or University Email to access your On-Duty requests.
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
              Register No. or Email
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="2026CS101 or student@campus.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5 font-mono">
              Account Password
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
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Student Desk'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-ivory-200">
          <p className="text-[11px] font-mono text-charcoal-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-mustard-600" />
            Quick Demo Student Accounts
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => autofillDemo('student1@campus.edu')}
              className="px-2.5 py-1.5 bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 rounded-lg border border-ivory-300 transition-colors"
            >
              Alex (CSE)
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('student2@campus.edu')}
              className="px-2.5 py-1.5 bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 rounded-lg border border-ivory-300 transition-colors"
            >
              Priya (ECE)
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('student3@campus.edu')}
              className="px-2.5 py-1.5 bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 rounded-lg border border-ivory-300 transition-colors"
            >
              Liam (MECH)
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-charcoal-500">
          Faculty or Administrator?{' '}
          <Link to="/login/faculty" className="text-forest-800 font-semibold hover:underline">
            Switch to Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
};
