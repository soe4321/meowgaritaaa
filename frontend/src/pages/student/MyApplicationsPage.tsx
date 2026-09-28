import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { odService } from '../../services/od.service';
import { ODApplication, ApplicationStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
  Ban,
  Calendar,
} from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ODApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cancel dialog
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const list = await odService.getMyApplications();
      setApplications(list);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleCancelClick = (appId: string) => {
    setSelectedAppId(appId);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedAppId) return;
    setIsCancelling(true);
    try {
      await odService.cancelApplication(selectedAppId);
      setCancelModalOpen(false);
      setSelectedAppId(null);
      await loadApplications();
    } catch (err) {
      console.error('Failed to cancel:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesStatus =
      filterStatus === 'ALL' || app.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.verificationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.event?.title || app.customEventTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 py-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal-900">My On-Duty Requisitions</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Track status, download certified letters, or withdraw pending submissions.
          </p>
        </div>

        <Link
          to="/student/apply"
          className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> New OD Request
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID or Event title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'PENDING_FACULTY', 'PENDING_ADMIN', 'APPROVED', 'RETURNED_FOR_CORRECTION', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-forest-800 text-white font-semibold'
                  : 'bg-ivory-100 text-charcoal-600 hover:bg-ivory-200'
              }`}
            >
              {st === 'ALL' ? 'All Records' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-ivory-300 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs text-charcoal-400 font-mono">
            Loading your applications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-charcoal-500">
            No matching applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory-50/80 border-b border-ivory-200 text-charcoal-600 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Application ID</th>
                  <th className="py-3.5 px-6">Event & Organizer</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Dates & Breakdown</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-ivory-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-charcoal-900">
                      {app.applicationNumber}
                      {app.status === 'APPROVED' && (
                        <span className="block text-[10px] font-mono text-forest-700">
                          {app.verificationCode}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-charcoal-900 block max-w-sm truncate">
                        {app.event?.title || app.customEventTitle}
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
                    <td className="py-4 px-6">
                      <span className="text-charcoal-900 font-medium block">
                        {app.dates.length} Day(s)
                      </span>
                      <span className="text-[11px] text-charcoal-500 font-mono">
                        {app.dates.map((d) => new Date(d.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })).join(', ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/student/applications/${app.id}`}
                          className="px-2.5 py-1.5 bg-ivory-100 hover:bg-ivory-200 text-charcoal-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          View Details <ExternalLink className="w-3 h-3" />
                        </Link>
                        {['PENDING_FACULTY', 'PENDING_ADMIN', 'RETURNED_FOR_CORRECTION'].includes(app.status) && (
                          <button
                            onClick={() => handleCancelClick(app.id)}
                            className="p-1.5 text-charcoal-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Application"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancel}
        title="Withdraw OD Requisition"
        message="Are you sure you want to withdraw this On-Duty request? This action cannot be undone."
        confirmLabel="Yes, Withdraw"
        isDestructive={true}
        isLoading={isCancelling}
      />
    </div>
  );
};
