import React, { useState, useEffect } from 'react';
import { eventService, CreateEventPayload } from '../../services/event.service';
import { Event } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Calendar, Plus, ToggleLeft, ToggleRight, MapPin, Building, Clock, CheckCircle2 } from 'lucide-react';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Event Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [requiresDocument, setRequiresDocument] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const list = await eventService.getEvents(false);
      setEvents(list);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await eventService.toggleActive(id);
      await loadEvents();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: CreateEventPayload = {
        title,
        description,
        organizer,
        venue,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        deadline: new Date(deadline).toISOString(),
        requiresDocument,
        isActive: true,
      };
      await eventService.createEvent(payload);
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setOrganizer('');
      setVenue('');
      await loadEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 py-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal-900">Campus Events & Symposia Directory</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Registered collegiate hackathons, conferences, and sports meets eligible for student OD.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Academic Event
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-xs text-charcoal-400 font-mono">Loading events...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`bg-white rounded-2xl border p-6 shadow-soft flex flex-col justify-between transition-all ${
                ev.isActive ? 'border-ivory-300' : 'border-dashed border-charcoal-300 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      ev.isActive ? 'bg-forest-100 text-forest-800' : 'bg-charcoal-200 text-charcoal-600'
                    }`}
                  >
                    {ev.isActive ? 'Open for OD' : 'Inactive / Closed'}
                  </span>

                  <button
                    onClick={() => handleToggle(ev.id)}
                    className="text-charcoal-500 hover:text-charcoal-800 flex items-center gap-1 text-[11px]"
                  >
                    {ev.isActive ? (
                      <ToggleRight className="w-6 h-6 text-forest-700" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-charcoal-400" />
                    )}
                  </button>
                </div>

                <h3 className="text-lg font-serif font-bold text-charcoal-900 leading-snug">{ev.title}</h3>
                <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">{ev.description}</p>

                <div className="pt-2 border-t border-ivory-200 space-y-1.5 text-xs text-charcoal-600">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span className="truncate">{ev.organizer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span>{ev.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span className="font-mono text-[11px]">
                      {new Date(ev.startDate).toLocaleDateString()} – {new Date(ev.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-ivory-200 flex items-center justify-between text-[11px] text-charcoal-500 font-mono">
                <span>Deadline: {new Date(ev.deadline).toLocaleDateString()}</span>
                <span>Applications: {ev._count?.applications || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Event Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Campus Event"
        subtitle="Add an accredited institutional competition, workshop, or conference."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Annual Inter-Collegiate AI Summit 2026"
              className="w-full p-2.5 bg-ivory-50 border border-ivory-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the event activities and requirements..."
              className="w-full p-2.5 bg-ivory-50 border border-ivory-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800 mb-1">
                Organizer Body *
              </label>
              <input
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g., ACM Student Chapter"
                className="w-full p-2.5 bg-ivory-50 border border-ivory-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-charcoal-800 mb-1">
                Venue *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g., Main Auditorium"
                className="w-full p-2.5 bg-ivory-50 border border-ivory-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div>
              <label className="block text-[11px] text-charcoal-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 bg-ivory-50 border border-ivory-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-charcoal-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 bg-ivory-50 border border-ivory-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-charcoal-700 mb-1">OD Apply Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2 bg-ivory-50 border border-ivory-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-ivory-200 flex items-center justify-end gap-3 font-sans">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl font-semibold shadow-soft disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
