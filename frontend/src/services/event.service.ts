import { api } from './api';
import { Event } from '../types';

export interface CreateEventPayload {
  title: string;
  description: string;
  organizer: string;
  venue: string;
  startDate: string;
  endDate: string;
  deadline: string;
  requiresDocument?: boolean;
  isActive?: boolean;
}

export const eventService = {
  async getEvents(activeOnly: boolean = false): Promise<Event[]> {
    const res = await api.get<Event[]>('/events', { params: { activeOnly } });
    return res.data;
  },

  async getEventById(id: string): Promise<Event> {
    const res = await api.get<Event>(`/events/${id}`);
    return res.data;
  },

  async createEvent(payload: CreateEventPayload): Promise<Event> {
    const res = await api.post<Event>('/events', payload);
    return res.data;
  },

  async updateEvent(id: string, payload: Partial<CreateEventPayload>): Promise<Event> {
    const res = await api.put<Event>(`/events/${id}`, payload);
    return res.data;
  },

  async toggleActive(id: string): Promise<Event> {
    const res = await api.patch<Event>(`/events/${id}/toggle`);
    return res.data;
  },
};
