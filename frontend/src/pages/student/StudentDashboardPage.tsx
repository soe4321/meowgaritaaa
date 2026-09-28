import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, StudentOverviewData } from '../../services/analytics.service';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  Calendar,
  ChevronRight,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await analyticsService.getStudentOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load student overview:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOverview();
  }, []);

  const profile = user?.studentProfile;

  return (
    <div className="space-y-8 py-6">
      {/* Student Welcome Header Card */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-800 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-soft shrink-0">
            {user?.fullName.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-charcoal-900">{user?.fullName}</h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                STUDENT
              </span>
            </div>
            <p className="text-xs text-charcoal-600 mt-1 font-sans">
              Register No: <span className="font-mono font-semibold text-charcoal-900">{profile?.registerNumber || 'N/A'}</span>
              {' • '}Department: <span className="font-medium text-charcoal-900">{profile?.department?.name || profile?.department?.code || 'Engineering'}</span>
              {' • '}Year {profile?.year || '1'} (Section {profile?.section || 'A'})
            </p>
          </div>
        </div>

        <Link
          to="/student/apply"
          className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-soft flex items-center gap-2 transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Apply for New OD
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Submitted"
          value={data?.metrics.totalApplications ?? 0}
          icon={<FileText className="w-5 h-5 text-forest-700" />}
          accentColor="forest"
          subtext="Lifetime applications"
        />
        <StatCard
          label="Approved ODs"
          value={data?.metrics.approvedCount ?? 0}
          icon={<CheckCircle2 className="w-5 h-5 text-forest-700" />}
          accentColor="forest"
          subtext="Certified attendance"
        />
        <StatCard
          label="In Review"
          value={data?.metrics.pendingCount ?? 0}
          icon={<Clock className="w-5 h-5 text-mustard-700" />}
          accentColor="mustard"
          subtext="Faculty or Admin Queue"
        />
        <StatCard
          label="Returned / Issues"
          value={data?.metrics.rejectedCount ?? 0}
          icon={<AlertTriangle className="w-5 h-5 text-terracotta-700" />}
          accentColor="terracotta"
          subtext="Action required"
        />
      </div>

      {/* Upcoming Approved ODs */}
      {data?.upcomingApprovedDates && data.upcomingApprovedDates.length > 0 && (
        <div className="bg-forest-50/70 border border-forest-200/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-serif font-bold text-forest-950 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-forest-700" />
              Upcoming Officially Approved On-Duty Schedule
            </h3>
            <span className="text-[11px] font-mono text-forest-700">Attendance Credit Enabled</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.upcomingApprovedDates.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-forest-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-forest-900">{item.applicationNumber}</span>
                  <span className="text-[10px] font-medium text-forest-600 bg-forest-50 px-2 py-0.5 rounded">
                    {item.isFullDay ? 'Full Day' : `Periods: ${item.periods.join(', ')}`}
                  </span>
                </div>
                <p className="text-xs font-semibold text-charcoal-900 mt-2 truncate">{item.eventTitle}</p>
                <p className="text-[11px] font-mono text-charcoal-500 mt-1">
                  Date: {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <Link
                  to={`/student/applications/${item.applicationId}`}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-forest-800 hover:underline"
                >
                  View Approved Letter <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-ivory-300 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-ivory-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-charcoal-900">Recent Applications</h3>
            <p className="text-xs text-charcoal-500 mt-0.5">Tracking your latest On-Duty submissions and reviews</p>
          </div>
          <Link
            to="/student/applications"
            className="text-xs font-semibold text-forest-800 hover:text-forest-950 flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-charcoal-500 font-mono">Loading records...</div>
        ) : !data?.recentApplications || data.recentApplications.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">
            No applications found. Click "Apply for New OD" to submit your first request.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory-50/80 border-b border-ivory-200 text-charcoal-600 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-6">Application ID</th>
                  <th className="py-3 px-6">Event / Purpose</th>
                  <th className="py-3 px-6">Reason</th>
                  <th className="py-3 px-6">Dates Requested</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {data.recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-semibold text-charcoal-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-charcoal-900 block max-w-xs truncate">
                        {app.event?.title || app.customEventTitle || 'Academic Activity'}
                      </span>
                      <span className="text-[11px] text-charcoal-500 block truncate">
                        {app.event?.venue || app.customVenue || 'Campus'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-ivory-100 text-charcoal-700">
                        {app.reason}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-charcoal-600">
                      {app.dates?.length} day(s)
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/student/applications/${app.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-forest-800 hover:text-forest-950 text-xs"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
