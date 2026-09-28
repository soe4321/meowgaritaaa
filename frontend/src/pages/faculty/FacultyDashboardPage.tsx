import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, FacultyOverviewData } from '../../services/analytics.service';
import { odService } from '../../services/od.service';
import { reviewService } from '../../services/review.service';
import { ODApplication, ReviewDecision } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Send,
  Eye,
  FileCheck2,
  Download,
  School,
  XCircle,
} from 'lucide-react';

export const FacultyDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<FacultyOverviewData | null>(null);
  const [queue, setQueue] = useState<ODApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state
  const [selectedApp, setSelectedApp] = useState<ODApplication | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState<ReviewDecision>('FORWARDED_TO_ADMIN');
  const [remarks, setRemarks] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ov, resQueue] = await Promise.all([
        analyticsService.getFacultyOverview(),
        odService.getAllApplications({ status: 'PENDING_FACULTY', limit: 50 }),
      ]);
      setOverview(ov);
      setQueue(resQueue.items || []);
    } catch (err) {
      console.error('Failed to load faculty dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReviewModal = (app: ODApplication) => {
    setSelectedApp(app);
    setDecision('FORWARDED_TO_ADMIN');
    setRemarks('Attendance threshold verified (>75%). Endorsed for institutional OD.');
    setReviewError('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setIsSubmittingReview(true);
    setReviewError('');

    try {
      await reviewService.facultyReview(selectedApp.id, {
        decision,
        remarks,
      });
      setReviewModalOpen(false);
      setSelectedApp(null);
      await loadData();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit faculty review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const facultyProfile = user?.facultyProfile;

  return (
    <div className="space-y-8 py-6 font-sans">
      {/* Faculty Advisor Header */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-800 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-soft shrink-0">
            {user?.fullName.charAt(0) || 'F'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-charcoal-900">{user?.fullName}</h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-mustard-100 text-mustard-900">
                FACULTY ADVISOR
              </span>
            </div>
            <p className="text-xs text-charcoal-600 mt-1">
              Designation: <span className="font-medium text-charcoal-900">{facultyProfile?.designation || 'Faculty Advisor'}</span>
              {' • '}Department: <span className="font-semibold text-charcoal-900">{facultyProfile?.department?.name || facultyProfile?.department?.code}</span>
              {' • '}ID: <span className="font-mono">{facultyProfile?.employeeId}</span>
            </p>
          </div>
        </div>

        <div className="px-4 py-2 bg-ivory-100 border border-ivory-300 rounded-xl text-xs font-mono text-charcoal-700">
          Attendance Verification Desk
        </div>
      </div>

      {/* Faculty Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Pending Your Review"
          value={overview?.pendingReviewCount ?? 0}
          icon={<Clock className="w-5 h-5 text-mustard-700" />}
          accentColor="mustard"
          subtext="Action required"
        />
        <StatCard
          label="Forwarded to Admin"
          value={overview?.forwardedToAdminCount ?? 0}
          icon={<Send className="w-5 h-5 text-forest-700" />}
          accentColor="forest"
          subtext="Endorsed for dean approval"
        />
        <StatCard
          label="Fully Approved"
          value={overview?.approvedCount ?? 0}
          icon={<CheckCircle2 className="w-5 h-5 text-forest-700" />}
          accentColor="forest"
          subtext="Institutional OD granted"
        />
        <StatCard
          label="Returned / Rejected"
          value={overview?.rejectedCount ?? 0}
          icon={<AlertTriangle className="w-5 h-5 text-terracotta-700" />}
          accentColor="terracotta"
          subtext="Corrections flagged"
        />
      </div>

      {/* Review Queue Table */}
      <div className="bg-white rounded-2xl border border-ivory-300 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-ivory-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-charcoal-900">
              Department Student Requisition Queue
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Review and certify student attendance eligibility before dean endorsement
            </p>
          </div>
          <span className="text-xs font-mono text-forest-800 bg-forest-50 px-3 py-1 rounded-full font-bold">
            {queue.length} Pending
          </span>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-xs text-charcoal-400 font-mono">Loading review queue...</div>
        ) : queue.length === 0 ? (
          <div className="p-16 text-center text-xs text-charcoal-500">
            No pending applications in your review queue. Great job!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory-50/80 border-b border-ivory-200 text-charcoal-600 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">App Ref</th>
                  <th className="py-3.5 px-6">Student Details</th>
                  <th className="py-3.5 px-6">Event / Purpose</th>
                  <th className="py-3.5 px-6">Dates & Sessions</th>
                  <th className="py-3.5 px-6">Documents</th>
                  <th className="py-3.5 px-6 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {queue.map((app) => (
                  <tr key={app.id} className="hover:bg-ivory-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-charcoal-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-charcoal-900 block">
                        {app.studentProfile?.user?.fullName}
                      </span>
                      <span className="text-[11px] text-charcoal-500 font-mono block">
                        Reg: {app.studentProfile?.registerNumber} • Year {app.studentProfile?.year}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-charcoal-900 block max-w-xs truncate">
                        {app.event?.title || app.customEventTitle}
                      </span>
                      <span className="text-[11px] text-charcoal-500 font-mono">
                        {app.reason}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-charcoal-900 block">
                        {app.dates?.length} Day(s)
                      </span>
                      <span className="text-[11px] text-charcoal-500 font-mono">
                        {app.dates?.map((d) => new Date(d.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })).join(', ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {app.documents && app.documents.length > 0 ? (
                        <a
                          href={`/api/documents/${app.documents[0].id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-forest-800 hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" /> File Attached
                        </a>
                      ) : (
                        <span className="text-charcoal-400">No Attachment</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openReviewModal(app)}
                        className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                      >
                        Evaluate OD
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Evaluate Requisition: ${selectedApp.applicationNumber}`}
          subtitle={`Student: ${selectedApp.studentProfile?.user?.fullName} (${selectedApp.studentProfile?.registerNumber})`}
          maxWidth="lg"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-5 text-xs font-sans">
            {reviewError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {reviewError}
              </div>
            )}

            <div className="p-4 bg-ivory-50 rounded-xl border border-ivory-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Event:</span>
                <span className="font-semibold text-charcoal-900">
                  {selectedApp.event?.title || selectedApp.customEventTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Reason:</span>
                <span className="font-mono text-forest-800 font-semibold">{selectedApp.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Requested Dates:</span>
                <span className="text-charcoal-900 font-mono">
                  {selectedApp.dates.map((d) => new Date(d.date).toLocaleDateString()).join(' | ')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800 mb-2">
                Faculty Decision
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-forest-50/60 border border-forest-300 rounded-xl cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="FORWARDED_TO_ADMIN"
                    checked={decision === 'FORWARDED_TO_ADMIN'}
                    onChange={() => setDecision('FORWARDED_TO_ADMIN')}
                    className="text-forest-800"
                  />
                  <div>
                    <span className="font-bold text-forest-950 block">Endorse & Forward to Dean / Admin</span>
                    <span className="text-[11px] text-forest-700">Recommend granting official attendance credit</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-300 rounded-xl cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="RETURNED_FOR_CORRECTION"
                    checked={decision === 'RETURNED_FOR_CORRECTION'}
                    onChange={() => setDecision('RETURNED_FOR_CORRECTION')}
                    className="text-amber-800"
                  />
                  <div>
                    <span className="font-bold text-amber-950 block">Return for Student Correction</span>
                    <span className="text-[11px] text-amber-700">Request clearer documentation or altered dates</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-red-50/60 border border-red-200 rounded-xl cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="REJECTED"
                    checked={decision === 'REJECTED'}
                    onChange={() => setDecision('REJECTED')}
                    className="text-red-700"
                  />
                  <div>
                    <span className="font-bold text-red-950 block">Reject Requisition</span>
                    <span className="text-[11px] text-red-700">Attendance deficiency or non-accredited event</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                Faculty Remarks / Endorsement Note *
              </label>
              <textarea
                required
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks explaining recommendation or reason for return..."
                className="w-full p-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-xs focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-ivory-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-semibold shadow-soft disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting Evaluation...' : 'Submit Evaluation'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
