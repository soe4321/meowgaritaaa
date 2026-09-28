import { api } from './api';
import { ODApplication, ODReason, ApplicationStatus } from '../types';

export interface CreateODDatePayload {
  date: string;
  isFullDay?: boolean;
  periods?: number[];
}

export interface CreateODPayload {
  reason: ODReason;
  eventId?: string;
  customEventTitle?: string;
  customVenue?: string;
  customOrganizer?: string;
  dates: CreateODDatePayload[];
  documentIds?: string[];
  declarationAccepted: boolean;
}

export interface FilterODParams {
  status?: ApplicationStatus;
  reason?: ODReason;
  departmentId?: string;
  eventId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedODResponse {
  items: ODApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const odService = {
  async submitApplication(payload: CreateODPayload): Promise<ODApplication> {
    const res = await api.post<ODApplication>('/od-applications', payload);
    return res.data;
  },

  async getMyApplications(): Promise<ODApplication[]> {
    const res = await api.get<ODApplication[]>('/od-applications/my');
    return res.data;
  },

  async getApplicationById(id: string): Promise<ODApplication> {
    const res = await api.get<ODApplication>(`/od-applications/${id}`);
    return res.data;
  },

  async cancelApplication(id: string): Promise<ODApplication> {
    const res = await api.post<ODApplication>(`/od-applications/${id}/cancel`);
    return res.data;
  },

  async getAllApplications(params?: FilterODParams): Promise<PaginatedODResponse> {
    const res = await api.get<PaginatedODResponse>('/od-applications', { params });
    return res.data;
  },

  async uploadDocument(file: File): Promise<{ id: string; fileName: string; originalName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getDocumentDownloadUrl(documentId: string): string {
    return `/api/documents/${documentId}/download`;
  },
};
