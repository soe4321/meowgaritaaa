import React from 'react';
import { ODApplication, ApplicationStatus } from '../../types';
import { CheckCircle2, Clock, XCircle, AlertTriangle, UserCheck, ShieldCheck, Send } from 'lucide-react';

interface ApplicationTimelineProps {
  application: ODApplication;
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ application }) => {
  const { status, createdAt, reviews, studentProfile } = application;

  // Find faculty review and admin review
  const facultyReview = reviews.find((r) => r.role === 'FACULTY');
  const adminReview = reviews.find((r) => r.role === 'ADMIN');

  // Determine stage active/completed states
  const isSubmitted = true;
  const isFacultyDone = !!facultyReview || status === 'PENDING_ADMIN' || status === 'APPROVED';
  const isAdminDone = !!adminReview || status === 'APPROVED';

  return (
    <div className="bg-white rounded-xl border border-ivory-300 p-6 shadow-soft">
      <h3 className="text-base font-serif font-bold text-charcoal-900 mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4 text-forest-700" />
        Approval & Review Timeline
      </h3>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-ivory-300">
        {/* Step 1: Submission */}
        <div className="relative">
          <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-forest-800 text-white flex items-center justify-center ring-4 ring-white">
            <Send className="w-2.5 h-2.5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-900">Application Submitted</span>
              <span className="text-[11px] text-charcoal-400 font-mono">
                {new Date(createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-xs text-charcoal-600 mt-1">
              Submitted by {studentProfile?.user?.fullName || 'Student'} ({studentProfile?.registerNumber}). Application ID: <span className="font-mono font-semibold">{application.applicationNumber}</span>.
            </p>
          </div>
        </div>

        {/* Step 2: Faculty Review */}
        <div className="relative">
          <div
            className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
              facultyReview
                ? facultyReview.decision === 'FORWARDED_TO_ADMIN'
                  ? 'bg-forest-700 text-white'
                  : facultyReview.decision === 'RETURNED_FOR_CORRECTION'
                  ? 'bg-amber-600 text-white'
                  : 'bg-red-600 text-white'
                : status === 'PENDING_FACULTY'
                ? 'bg-mustard-500 text-white animate-pulse'
                : 'bg-ivory-300 text-charcoal-500'
            }`}
          >
            <UserCheck className="w-2.5 h-2.5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-900">Faculty Review & Recommendation</span>
              {facultyReview && (
                <span className="text-[11px] text-charcoal-400 font-mono">
                  {new Date(facultyReview.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            {facultyReview ? (
              <div className="mt-2 p-3 rounded-lg bg-ivory-50 border border-ivory-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-charcoal-800">
                    {facultyReview.reviewer?.fullName || 'Department Faculty'}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      facultyReview.decision === 'FORWARDED_TO_ADMIN'
                        ? 'bg-forest-100 text-forest-800'
                        : facultyReview.decision === 'RETURNED_FOR_CORRECTION'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {facultyReview.decision === 'FORWARDED_TO_ADMIN' ? 'Recommended & Forwarded' : facultyReview.decision}
                  </span>
                </div>
                {facultyReview.remarks && (
                  <p className="text-xs text-charcoal-600 mt-1.5 italic">
                    "{facultyReview.remarks}"
                  </p>
                )}
              </div>
            ) : status === 'PENDING_FACULTY' ? (
              <p className="text-xs text-mustard-700 mt-1 font-medium">
                Pending review by Department Faculty Advisor / HOD.
              </p>
            ) : (
              <p className="text-xs text-charcoal-400 mt-1">Awaiting review.</p>
            )}
          </div>
        </div>

        {/* Step 3: Admin Final Approval */}
        <div className="relative">
          <div
            className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
              adminReview
                ? adminReview.decision === 'APPROVED'
                  ? 'bg-forest-800 text-white'
                  : 'bg-red-600 text-white'
                : status === 'PENDING_ADMIN'
                ? 'bg-terracotta-500 text-white animate-pulse'
                : 'bg-ivory-300 text-charcoal-500'
            }`}
          >
            <ShieldCheck className="w-2.5 h-2.5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-900">Institutional Admin Final Approval</span>
              {adminReview && (
                <span className="text-[11px] text-charcoal-400 font-mono">
                  {new Date(adminReview.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            {adminReview ? (
              <div className="mt-2 p-3 rounded-lg bg-ivory-50 border border-ivory-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-charcoal-800">
                    {adminReview.reviewer?.fullName || 'Office of Administration'}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      adminReview.decision === 'APPROVED'
                        ? 'bg-forest-100 text-forest-800 font-semibold'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {adminReview.decision === 'APPROVED' ? 'Final OD Granted' : 'Rejected'}
                  </span>
                </div>
                {adminReview.remarks && (
                  <p className="text-xs text-charcoal-600 mt-1.5 italic">
                    "{adminReview.remarks}"
                  </p>
                )}
              </div>
            ) : status === 'PENDING_ADMIN' ? (
              <p className="text-xs text-terracotta-700 mt-1 font-medium">
                Faculty recommendation approved. Awaiting final sign-off from College Administrator / Dean.
              </p>
            ) : (
              <p className="text-xs text-charcoal-400 mt-1">Pending prior approvals.</p>
            )}
          </div>
        </div>

        {/* Step 4: Final Outcome */}
        <div className="relative">
          <div
            className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
              status === 'APPROVED'
                ? 'bg-forest-600 text-white'
                : status === 'REJECTED'
                ? 'bg-red-600 text-white'
                : 'bg-ivory-200 text-charcoal-400'
            }`}
          >
            {status === 'APPROVED' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : status === 'REJECTED' ? (
              <XCircle className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-charcoal-900">Final Clearance Status</span>
            <p className="text-xs text-charcoal-600 mt-1">
              {status === 'APPROVED' ? (
                <span className="text-forest-800 font-medium">
                  Official On-Duty granted. Academic attendance records updated.
                </span>
              ) : status === 'REJECTED' ? (
                <span className="text-red-700 font-medium">
                  Application rejected. Student must attend regular classes.
                </span>
              ) : status === 'RETURNED_FOR_CORRECTION' ? (
                <span className="text-amber-800 font-medium">
                  Returned for student correction. Please update details or re-upload documents.
                </span>
              ) : (
                <span className="text-charcoal-500">In review workflow.</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
