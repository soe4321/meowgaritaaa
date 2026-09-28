import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { odService } from '../../services/od.service';
import { ODApplication } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApplicationTimeline } from '../../components/od/ApplicationTimeline';
import {
  ArrowLeft,
  Printer,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<ODApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;
      try {
        const res = await odService.getApplicationById(id);
        setApp(res);
      } catch (err) {
        setError('Application not found or unauthorized.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  if (isLoading) {
    return <div className="py-16 text-center text-xs text-charcoal-400 font-mono">Loading details...</div>;
  }

  if (error || !app) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
          <p className="text-sm font-semibold">{error || 'Application unavailable.'}</p>
          <Link to="/student/applications" className="mt-4 inline-block text-xs underline font-sans">
            Back to applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 font-sans">
      {/* Top Header Actions (Hidden in Print) */}
      <div className="no-print flex items-center justify-between">
        <Link
          to="/student/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Applications
        </Link>

        {app.status === 'APPROVED' && (
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-semibold hover:bg-forest-900 transition-colors shadow-soft flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Approved OD Letter
          </button>
        )}
      </div>

      {/* Main Details Card (Also formatted for Print) */}
      <div className="printable-card bg-white rounded-3xl border border-ivory-300 shadow-card p-6 sm:p-10 space-y-8">
        {/* Printable Letter Header */}
        <div className="border-b border-ivory-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-800 text-ivory-100 flex items-center justify-center font-serif font-bold text-sm">
                C
              </div>
              <h1 className="text-xl font-serif font-bold text-charcoal-900">
                Official Student On-Duty Requisition
              </h1>
            </div>
            <p className="text-xs text-charcoal-500 mt-1 font-mono">
              APPLICATION REF: <span className="font-bold text-charcoal-900">{app.applicationNumber}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={app.status} size="lg" />
          </div>
        </div>

        {/* Verification Banner if Approved */}
        {app.status === 'APPROVED' && (
          <div className="p-4 bg-forest-50 border border-forest-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-forest-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-forest-900">Attendance Credit Certified</p>
                <p className="text-[11px] text-forest-700">
                  This document serves as authorized proof for class attendance exemption during the certified hours.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-mono text-forest-600 block">Verification Code</span>
              <span className="font-mono text-xs font-bold text-forest-950 bg-forest-100 px-2.5 py-1 rounded-md inline-block">
                {app.verificationCode}
              </span>
            </div>
          </div>
        )}

        {/* Student and Event Particulars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
          <div className="bg-ivory-50/70 p-5 rounded-2xl border border-ivory-200 space-y-3">
            <h3 className="font-serif font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-forest-700" /> Student Profile
            </h3>
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Student Name:</span>
                <span className="font-semibold text-charcoal-900">{app.studentProfile?.user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Register Number:</span>
                <span className="font-mono font-bold text-charcoal-900">{app.studentProfile?.registerNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Department:</span>
                <span className="font-medium text-charcoal-900">{app.studentProfile?.department?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Academic Year:</span>
                <span className="text-charcoal-900">Year {app.studentProfile?.year} (Sec {app.studentProfile?.section})</span>
              </div>
            </div>
          </div>

          <div className="bg-ivory-50/70 p-5 rounded-2xl border border-ivory-200 space-y-3">
            <h3 className="font-serif font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-forest-700" /> Event & Duty Details
            </h3>
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Event Title:</span>
                <span className="font-semibold text-charcoal-900 truncate max-w-[200px]">
                  {app.event?.title || app.customEventTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Host / Organizer:</span>
                <span className="text-charcoal-900 truncate max-w-[200px]">
                  {app.event?.organizer || app.customOrganizer || 'Campus Academic Department'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Venue:</span>
                <span className="text-charcoal-900">{app.event?.venue || app.customVenue || 'Main Auditorium'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Duty Classification:</span>
                <span className="font-mono font-semibold text-forest-800">{app.reason}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Requested Dates Table */}
        <div className="space-y-3">
          <h3 className="font-serif font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-forest-700" /> Dates & Periods Breakdown
          </h3>
          <div className="border border-ivory-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-charcoal-600 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Specific Class Periods</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {app.dates.map((d) => (
                  <tr key={d.id} className="hover:bg-ivory-50">
                    <td className="py-3 px-4 font-mono font-medium text-charcoal-900">
                      {new Date(d.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {d.isFullDay ? (
                        <span className="px-2 py-0.5 rounded bg-forest-50 text-forest-800 font-medium">
                          Full Day
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-mustard-50 text-mustard-800 font-medium">
                          Partial Duty
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-charcoal-700">
                      {d.isFullDay
                        ? 'Periods 1, 2, 3, 4, 5, 6, 7, 8 (All Sessions)'
                        : d.periods?.map((p) => `Period ${p.periodNumber}`).join(', ') || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attached Documents */}
        {app.documents && app.documents.length > 0 && (
          <div className="no-print space-y-3">
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Attached Verification Files</h3>
            <div className="space-y-2">
              {app.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-ivory-50 border border-ivory-200 rounded-xl text-xs flex items-center justify-between"
                >
                  <span className="font-medium text-charcoal-800">{doc.originalName}</span>
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-forest-800 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Component */}
        <div className="no-print pt-4 border-t border-ivory-200">
          <ApplicationTimeline application={app} />
        </div>
      </div>
    </div>
  );
};
