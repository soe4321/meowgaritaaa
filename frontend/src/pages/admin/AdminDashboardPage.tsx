import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, AdminOverviewData } from '../../services/analytics.service';
import { odService } from '../../services/od.service';
import { reviewService } from '../../services/review.service';
import { ODApplication, ReviewDecision } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  GraduationCap,
  Users,
  Download,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [queue, setQueue] = useState<ODApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal
  const [selectedApp, setSelectedApp] = useState<ODApplication | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState<ReviewDecision>('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ov, resQueue] = await Promise.all([
        analyticsService.getAdminOverview(),
        odService.getAllApplications({ status: 'PENDING_ADMIN', limit: 50 }),
      ]);
      setData(ov);
      setQueue(resQueue.items || []);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCsv = async () => {
    try {
      const blob = await analyticsService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CampusOD_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
    }
  };

  const openSignOff = (app: ODApplication) => {
    setSelectedApp(app);
    setDecision('APPROVED');
    setRemarks('Official institutional OD granted. Verified attendance credit.');
    setReviewError('');
    setReviewModalOpen(true);
  };

  const handleSignOffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setIsSubmitting(true);
    setReviewError('');

    try {
      await reviewService.adminReview(selectedApp.id, {
        decision,
        remarks,
      });
      setReviewModalOpen(false);
      setSelectedApp(null);
      await loadData();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Error processing administrative sign-off.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-6 font-sans">
      {/* Admin Title Header */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-charcoal-900">Office of Academic Administration</h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-terracotta-100 text-terracotta-800">
              DEAN'S OFFICE
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Institutional overview, final sanction desk, and cross-departmental attendance audit.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-soft flex items-center gap-2 transition-colors shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export OD Audit (CSV)
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Pending Dean Approval"
          value={data?.metrics.pendingAdmin ?? 0}
          icon={<Clock className="w-5 h-5 text-terracotta-700" />}
          accentColor="terracotta"
          subtext="Awaiting final sign-off"
        />
        <StatCard
          label="Pending Faculty"
          value={data?.metrics.pendingFaculty ?? 0}
          icon={<Users className="w-5 h-5 text-mustard-700" />}
          accentColor="mustard"
          subtext="With department advisors"
        />
        <StatCard
          label="Total Approved ODs"
          value={data?.metrics.approved ?? 0}
          icon={<CheckCircle2 className="w-5 h-5 text-forest-700" />}
          accentColor="forest"
          subtext="Certified attendance"
        />
        <StatCard
          label="Total Student Body"
          value={data?.metrics.totalStudents ?? 0}
          icon={<GraduationCap className="w-5 h-5 text-forest-700" />}
          accentColor="forest"
          subtext="Enrolled across departments"
        />
      </div>

      {/* Department Breakdown Chart */}
      {data?.departmentStats && data.departmentStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-soft">
          <div className="mb-6">
            <h3 className="text-base font-serif font-bold text-charcoal-900">
              Departmental OD Distribution & Approval Volume
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Comparison between total requisitions submitted vs final approvals granted by department
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EFEB" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#7A827E' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7A827E' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #ECE3DB',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="totalApplications" name="Total Applied" fill="#C9CDCB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approvedApplications" name="Approved" fill="#1B4332" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pending Admin Queue */}
      <div className="bg-white rounded-2xl border border-ivory-300 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-ivory-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-charcoal-900">
              Applications Awaiting Final Institutional Approval
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              These applications have been vetted and endorsed by Department Faculty Advisors
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-terracotta-800 bg-terracotta-50 px-3 py-1 rounded-full">
            {queue.length} Pending
          </span>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-xs text-charcoal-400 font-mono">Loading approval queue...</div>
        ) : queue.length === 0 ? (
          <div className="p-16 text-center text-xs text-charcoal-500">
            No applications awaiting dean sign-off.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory-50/80 border-b border-ivory-200 text-charcoal-600 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">App Ref</th>
                  <th className="py-3.5 px-6">Student & Dept</th>
                  <th className="py-3.5 px-6">Event Title</th>
                  <th className="py-3.5 px-6">Faculty Endorsement</th>
                  <th className="py-3.5 px-6">Dates Requested</th>
                  <th className="py-3.5 px-6 text-right">Dean Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {queue.map((app) => {
                  const facultyReview = app.reviews?.find((r) => r.role === 'FACULTY');
                  return (
                    <tr key={app.id} className="hover:bg-ivory-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-charcoal-900">
                        {app.applicationNumber}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-charcoal-900 block">
                          {app.studentProfile?.user?.fullName}
                        </span>
                        <span className="text-[11px] text-charcoal-500 font-mono">
                          {app.studentProfile?.registerNumber} ({app.studentProfile?.department?.code})
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-charcoal-900 max-w-xs truncate">
                        {app.event?.title || app.customEventTitle}
                      </td>
                      <td className="py-4 px-6">
                        {facultyReview ? (
                          <div className="max-w-xs">
                            <span className="font-semibold text-forest-800 text-[11px] block">
                              ✓ {facultyReview.reviewer?.fullName || 'Faculty Advisor'}
                            </span>
                            <span className="text-[10px] text-charcoal-500 italic truncate block">
                              "{facultyReview.remarks}"
                            </span>
                          </div>
                        ) : (
                          <span className="text-charcoal-400">Direct Submission</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-charcoal-900">{app.dates.length} Day(s)</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openSignOff(app)}
                          className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                        >
                          Sign-Off OD
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Sign-Off Modal */}
      {selectedApp && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Administrative Final Sanction: ${selectedApp.applicationNumber}`}
          subtitle={`Student: ${selectedApp.studentProfile?.user?.fullName} (${selectedApp.studentProfile?.registerNumber})`}
          maxWidth="md"
        >
          <form onSubmit={handleSignOffSubmit} className="space-y-4 text-xs font-sans">
            {reviewError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {reviewError}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800 mb-2">
                Executive Action
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-forest-50/60 border border-forest-300 rounded-xl cursor-pointer">
                  <input
                    type="radio"
                    name="adminDecision"
                    value="APPROVED"
                    checked={decision === 'APPROVED'}
                    onChange={() => setDecision('APPROVED')}
                    className="text-forest-800"
                  />
                  <div>
                    <span className="font-bold text-forest-950 block">Grant Official Approval</span>
                    <span className="text-[11px] text-forest-700">Authorize attendance credits & generate verification code</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-red-50/60 border border-red-200 rounded-xl cursor-pointer">
                  <input
                    type="radio"
                    name="adminDecision"
                    value="REJECTED"
                    checked={decision === 'REJECTED'}
                    onChange={() => setDecision('REJECTED')}
                    className="text-red-700"
                  />
                  <div>
                    <span className="font-bold text-red-950 block">Decline Application</span>
                    <span className="text-[11px] text-red-700">No attendance exemption authorized</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                Official Dean Sign-Off Remarks *
              </label>
              <textarea
                required
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Institutional note certifying final sanction..."
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
                disabled={isSubmitting}
                className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-semibold shadow-soft disabled:opacity-50"
              >
                {isSubmitting ? 'Signing Off...' : 'Execute Sign-Off'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
