import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { eventService } from '../../services/event.service';
import { odService, CreateODDatePayload } from '../../services/od.service';
import { Event, ODReason } from '../../types';
import {
  Calendar,
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FileCheck2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ApplyODPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isCustomEvent, setIsCustomEvent] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customVenue, setCustomVenue] = useState('');
  const [customOrganizer, setCustomOrganizer] = useState('');
  const [reason, setReason] = useState<ODReason>('EVENT');

  // Dates and Periods
  const [dates, setDates] = useState<CreateODDatePayload[]>([
    {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isFullDay: true,
      periods: [1, 2, 3, 4, 5, 6, 7, 8],
    },
  ]);

  // Documents
  const [uploadedDocIds, setUploadedDocIds] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successAppNumber, setSuccessAppNumber] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const list = await eventService.getEvents(true);
        setEvents(list);
        if (list.length > 0) {
          setSelectedEventId(list[0].id);
        } else {
          setIsCustomEvent(true);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
        setIsCustomEvent(true);
      }
    };
    loadEvents();
  }, []);

  const addDateRow = () => {
    setDates((prev) => [
      ...prev,
      {
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isFullDay: true,
        periods: [1, 2, 3, 4, 5, 6, 7, 8],
      },
    ]);
  };

  const removeDateRow = (index: number) => {
    if (dates.length <= 1) return;
    setDates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDate = (index: number, val: string) => {
    setDates((prev) =>
      prev.map((d, i) => (i === index ? { ...d, date: val } : d)),
    );
  };

  const toggleFullDay = (index: number, isFull: boolean) => {
    setDates((prev) =>
      prev.map((d, i) =>
        i === index
          ? {
              ...d,
              isFullDay: isFull,
              periods: isFull ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3],
            }
          : d,
      ),
    );
  };

  const togglePeriod = (dateIndex: number, periodNum: number) => {
    setDates((prev) =>
      prev.map((d, i) => {
        if (i !== dateIndex) return d;
        const currentPeriods = d.periods || [];
        const exists = currentPeriods.includes(periodNum);
        const newPeriods = exists
          ? currentPeriods.filter((p) => p !== periodNum)
          : [...currentPeriods, periodNum].sort((a, b) => a - b);
        return {
          ...d,
          isFullDay: newPeriods.length === 8,
          periods: newPeriods,
        };
      }),
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError('');

    try {
      const res = await odService.uploadDocument(file);
      setUploadedDocIds((prev) => [...prev, res.id]);
      setUploadedFiles((prev) => [...prev, { id: res.id, name: res.originalName }]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload supporting document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!declarationAccepted) {
      setError('You must accept the collegiate declaration before submitting.');
      return;
    }

    if (isCustomEvent && !customTitle.trim()) {
      setError('Please provide a title for the custom event.');
      return;
    }

    // Validate dates
    for (const d of dates) {
      if (!d.date) {
        setError('Please select valid date(s) for the OD request.');
        return;
      }
      if (!d.isFullDay && (!d.periods || d.periods.length === 0)) {
        setError('Please select at least one period for each date requested.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        reason,
        eventId: isCustomEvent ? undefined : selectedEventId,
        customEventTitle: isCustomEvent ? customTitle : undefined,
        customVenue: isCustomEvent ? customVenue : undefined,
        customOrganizer: isCustomEvent ? customOrganizer : undefined,
        dates: dates.map((d) => ({
          date: d.date,
          isFullDay: d.isFullDay,
          periods: d.isFullDay ? undefined : d.periods,
        })),
        documentIds: uploadedDocIds,
        declarationAccepted,
      };

      const result = await odService.submitApplication(payload);
      setSuccessAppNumber(result.applicationNumber);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating OD application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successAppNumber) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl border border-forest-200 p-8 sm:p-10 shadow-elevated space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-charcoal-900">
            Application Submitted Successfully!
          </h2>
          <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
            Your On-Duty requisition has been logged under Application ID{' '}
            <span className="font-mono font-bold text-forest-800 text-sm">{successAppNumber}</span>. It is now queued for your Department Faculty Advisor's review.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/student/applications')}
              className="w-full sm:w-auto px-6 py-3 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-soft"
            >
              View My Applications
            </button>
            <button
              onClick={() => {
                setSuccessAppNumber('');
                setDeclarationAccepted(false);
                setUploadedDocIds([]);
                setUploadedFiles([]);
              }}
              className="w-full sm:w-auto px-5 py-3 bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 text-xs font-semibold rounded-xl border border-ivory-300 transition-colors"
            >
              Submit Another OD
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card p-6 sm:p-10">
        <div className="border-b border-ivory-200 pb-6 mb-8">
          <span className="text-[11px] font-mono text-forest-700 uppercase tracking-widest block font-semibold mb-1">
            Official Requisition Form
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-900">
            Apply for Student On-Duty (OD)
          </h1>
          <p className="text-xs text-charcoal-500 mt-1 font-sans">
            Submit your application with attached event documentation at least 24 hours prior.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 font-sans">
          {/* Step 1: Event Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800">
                1. Select Event or Activity
              </label>
              <button
                type="button"
                onClick={() => setIsCustomEvent(!isCustomEvent)}
                className="text-xs text-forest-800 font-semibold hover:underline"
              >
                {isCustomEvent ? 'Pick from Campus Events' : '+ Enter Other External Event'}
              </button>
            </div>

            {!isCustomEvent ? (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full p-3 bg-ivory-50 border border-ivory-300 rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.organizer})
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-3 p-4 bg-ivory-50 border border-ivory-200 rounded-xl">
                <div>
                  <label className="block text-[11px] text-charcoal-600 mb-1 font-mono">
                    Event / Symposium Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g., Regional Robotics Competition 2026"
                    className="w-full p-2.5 bg-white border border-ivory-300 rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-charcoal-600 mb-1 font-mono">
                      Venue / Host Institution
                    </label>
                    <input
                      type="text"
                      value={customVenue}
                      onChange={(e) => setCustomVenue(e.target.value)}
                      placeholder="e.g., National Tech Institute"
                      className="w-full p-2.5 bg-white border border-ivory-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-charcoal-600 mb-1 font-mono">
                      Organizing Body
                    </label>
                    <input
                      type="text"
                      value={customOrganizer}
                      onChange={(e) => setCustomOrganizer(e.target.value)}
                      placeholder="e.g., IEEE Student Chapter"
                      className="w-full p-2.5 bg-white border border-ivory-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800 block">
              2. Nature of Duty (Reason)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'EVENT', title: 'Main Event', desc: 'Direct participation or competition during official event dates' },
                { id: 'PRE_WORK', title: 'Pre-Work Duty', desc: 'Preparation, arena setup, or technical rehearsal before event' },
                { id: 'POST_WORK', title: 'Post-Work Duty', desc: 'Dismantling, documentation, or report compilation post-event' },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    reason === item.id
                      ? 'border-forest-700 bg-forest-50/60 ring-1 ring-forest-700'
                      : 'border-ivory-300 bg-white hover:bg-ivory-50/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={item.id}
                    checked={reason === item.id}
                    onChange={() => setReason(item.id as ODReason)}
                    className="sr-only"
                  />
                  <span className="font-semibold text-xs text-charcoal-900 block">{item.title}</span>
                  <span className="text-[11px] text-charcoal-500 block mt-1 leading-snug">{item.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Dates & Periods Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800">
                3. Requested Dates & Hourly Periods
              </label>
              <button
                type="button"
                onClick={addDateRow}
                className="text-xs text-forest-800 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Date
              </button>
            </div>

            <div className="space-y-4">
              {dates.map((d, index) => (
                <div key={index} className="p-4 bg-ivory-50 border border-ivory-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        required
                        value={d.date}
                        onChange={(e) => updateDate(index, e.target.value)}
                        className="p-2 bg-white border border-ivory-300 rounded-lg text-xs font-mono"
                      />
                      <label className="flex items-center gap-2 text-xs font-medium text-charcoal-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={d.isFullDay}
                          onChange={(e) => toggleFullDay(index, e.target.checked)}
                          className="rounded text-forest-700 focus:ring-forest-600"
                        />
                        Full Day Duty (8 Periods)
                      </label>
                    </div>

                    {dates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDateRow(index)}
                        className="text-red-600 hover:text-red-800 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {!d.isFullDay && (
                    <div className="pt-2 border-t border-ivory-200">
                      <span className="text-[11px] font-mono text-charcoal-500 block mb-2">
                        Select specific class periods:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => {
                          const isSelected = d.periods?.includes(periodNum);
                          return (
                            <button
                              key={periodNum}
                              type="button"
                              onClick={() => togglePeriod(index, periodNum)}
                              className={`w-9 h-8 rounded-lg text-xs font-mono font-medium transition-colors ${
                                isSelected
                                  ? 'bg-forest-800 text-white font-bold'
                                  : 'bg-white border border-ivory-300 text-charcoal-700 hover:bg-ivory-100'
                              }`}
                            >
                              P{periodNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Supporting Document Upload */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800 block">
              4. Supporting Official Documentation
            </label>
            <div className="p-5 border-2 border-dashed border-ivory-300 hover:border-forest-400 rounded-2xl bg-ivory-50/50 text-center transition-colors">
              <Upload className="w-8 h-8 text-forest-700 mx-auto mb-2" />
              <p className="text-xs text-charcoal-700 font-medium">
                Upload Invitation Letter, Acceptance Notice, or Organizer Email (PDF / JPEG / PNG)
              </p>
              <p className="text-[11px] text-charcoal-400 mt-1">Maximum file size 10MB</p>
              <label className="mt-3 inline-block px-4 py-2 bg-white border border-ivory-300 hover:bg-ivory-100 rounded-xl text-xs font-semibold text-charcoal-800 cursor-pointer shadow-xs">
                {isUploading ? 'Uploading Document...' : 'Browse Computer'}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="sr-only"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mt-2">
                {uploadedFiles.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-forest-50 border border-forest-200 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-forest-700" />
                      <span className="font-medium text-forest-950">{doc.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-forest-700">Uploaded</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 5: Academic Honor Code Declaration */}
          <div className="p-4 bg-mustard-50/60 border border-mustard-200/80 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-1 rounded text-forest-800 focus:ring-forest-600"
              />
              <span className="text-xs text-charcoal-800 leading-relaxed">
                <strong className="text-charcoal-900 font-serif">Collegiate Honor Declaration:</strong> I solemnly declare that the dates and event details submitted are genuine and related to college-approved activities. Any misrepresentation shall lead to forfeiture of attendance credits and disciplinary action.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full py-3.5 bg-forest-800 text-white font-semibold rounded-xl text-xs hover:bg-forest-900 transition-colors shadow-soft flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? 'Transmitting Application...' : 'Submit On-Duty Application'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
