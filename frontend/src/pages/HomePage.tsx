import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  FileCheck2,
  Calendar,
  Search,
  CheckCircle2,
  ArrowRight,
  School,
  Clock,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { odService } from '../services/od.service';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;
    setIsVerifying(true);
    setVerifyError('');
    setVerifyResult(null);

    try {
      // Look up application matching verification code via public or search
      const response = await odService.getAllApplications({ search: verificationCode.trim() });
      if (response && response.items && response.items.length > 0) {
        const found = response.items.find(
          (app) => app.verificationCode.toLowerCase() === verificationCode.trim().toLowerCase(),
        );
        if (found) {
          setVerifyResult(found);
        } else {
          setVerifyError('No approved OD requisition record matches this verification code.');
        }
      } else {
        setVerifyError('No record found matching the code provided.');
      }
    } catch {
      setVerifyError('Verification service temporarily unavailable.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-forest-900 text-ivory-50 px-6 py-16 sm:px-12 sm:py-20 shadow-elevated">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-800/80 border border-forest-700/60 text-xs font-mono tracking-wide text-forest-200">
            <School className="w-3.5 h-3.5 text-forest-300" />
            <span>Collegiate Academic Affairs & Attendance Integrity</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
            Institutional Student <br />
            <span className="text-mustard-300 italic">On-Duty Requisition</span> Portal
          </h1>

          <p className="text-sm sm:text-base text-forest-100/90 leading-relaxed font-sans max-w-2xl">
            A unified digital governance platform for paperless OD applications, multi-tier faculty endorsement, dean-level sign-offs, and verifiable attendance integrity.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login/student"
                  className="px-6 py-3 text-sm font-semibold rounded-xl bg-mustard-400 text-forest-950 hover:bg-mustard-300 transition-colors shadow-soft flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" /> Student Portal Login
                </Link>
                <Link
                  to="/login/faculty"
                  className="px-6 py-3 text-sm font-semibold rounded-xl bg-forest-800 hover:bg-forest-700 text-white border border-forest-700 transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" /> Faculty & Admin Access
                </Link>
              </>
            ) : (
              <Link
                to={
                  user?.role === 'STUDENT'
                    ? '/student/dashboard'
                    : user?.role === 'FACULTY'
                    ? '/faculty/dashboard'
                    : '/admin/dashboard'
                }
                className="px-6 py-3 text-sm font-semibold rounded-xl bg-mustard-400 text-forest-950 hover:bg-mustard-300 transition-colors shadow-soft flex items-center gap-2"
              >
                Go to {user?.role} Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Verification Code Checker Bar */}
      <section className="bg-white rounded-2xl border border-ivory-300 p-6 sm:p-8 shadow-card">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5 text-forest-800 mb-2">
            <FileCheck2 className="w-5 h-5" />
            <h2 className="text-xl font-serif font-bold text-charcoal-900">
              Verify Digital OD Approval Letter
            </h2>
          </div>
          <p className="text-xs text-charcoal-600 mb-4">
            Faculty members and examination staff can authenticate student OD certificates using the unique Verification Code printed on the approved requisition.
          </p>

          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Code (e.g., VER-OD-9481-AK7X)"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-xs font-mono text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2.5 bg-forest-800 text-white rounded-xl text-xs font-semibold hover:bg-forest-900 transition-colors disabled:opacity-50 shrink-0"
            >
              {isVerifying ? 'Verifying...' : 'Verify Authenticity'}
            </button>
          </form>

          {verifyError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {verifyError}
            </div>
          )}

          {verifyResult && (
            <div className="mt-4 p-4 bg-forest-50 border border-forest-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-forest-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-forest-600" />
                <span>Legitimate Institutional OD Requisition</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-forest-200/60 font-sans">
                <div>
                  <span className="text-[10px] text-forest-600 uppercase block">Application No</span>
                  <span className="font-mono font-bold text-forest-950">{verifyResult.applicationNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-forest-600 uppercase block">Student</span>
                  <span className="font-medium text-forest-950">{verifyResult.studentProfile?.user?.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-forest-600 uppercase block">Status</span>
                  <span className="font-bold text-forest-800">{verifyResult.status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-forest-600 uppercase block">Event</span>
                  <span className="font-medium text-forest-950 truncate block">
                    {verifyResult.event?.title || verifyResult.customEventTitle}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3 Portal Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-soft hover:shadow-card transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 text-forest-700 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-charcoal-900">Student Portal</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Submit single or multi-day OD requests with custom period breakdowns. Attach invitation letters and track live approval status.
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/login/student"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-forest-950"
            >
              Access Student Desk <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-soft hover:shadow-card transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-mustard-50 border border-mustard-100 text-mustard-800 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-charcoal-900">Faculty Advisor Review</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Department advisors and HODs evaluate student eligibility, verify attendance threshold (75%+), and endorse forward to central administration.
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/login/faculty"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-mustard-800 hover:text-mustard-950"
            >
              Open Faculty Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-soft hover:shadow-card transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-terracotta-50 border border-terracotta-100 text-terracotta-800 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-charcoal-900">Dean & Admin Office</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Dean of Academic Affairs final sanction. Automatic generation of digitally verifiable letters and semester-wise attendance synchronization.
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/login/faculty"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta-800 hover:text-terracotta-950"
            >
              Open Admin Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Quick Logins Helper */}
      <section className="bg-ivory-50 border border-ivory-300 rounded-2xl p-6">
        <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-500 mb-3">
          Institutional Demo Credentials
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
          <div className="bg-white p-3.5 rounded-xl border border-ivory-200">
            <span className="font-semibold text-charcoal-900 block">Student (Alex Morgan)</span>
            <p className="text-charcoal-500 font-mono text-[11px] mt-1">student1@campus.edu</p>
            <p className="text-charcoal-500 font-mono text-[11px]">Pass: Student@123</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-ivory-200">
            <span className="font-semibold text-charcoal-900 block">Faculty (Dr. Evelyn Reed)</span>
            <p className="text-charcoal-500 font-mono text-[11px] mt-1">faculty.cs@campus.edu</p>
            <p className="text-charcoal-500 font-mono text-[11px]">Pass: Faculty@123</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-ivory-200">
            <span className="font-semibold text-charcoal-900 block">Admin (Dr. Arthur Pendelton)</span>
            <p className="text-charcoal-500 font-mono text-[11px] mt-1">admin@campus.edu</p>
            <p className="text-charcoal-500 font-mono text-[11px]">Pass: Admin@123</p>
          </div>
        </div>
      </section>
    </div>
  );
};
