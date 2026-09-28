import { api } from './api';
import { ODApplication, Department } from '../types';

export interface AdminOverviewData {
  metrics: {
    totalStudents: number;
    totalFaculty: number;
    totalApplications: number;
    pendingFaculty: number;
    pendingAdmin: number;
    approved: number;
    rejected: number;
  };
  departmentStats: Array<{
    id: string;
    code: string;
    name: string;
    totalApplications: number;
    approvedApplications: number;
  }>;
  eventStats: Array<{
    id: string;
    title: string;
    fullTitle: string;
    applicationCount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    total: number;
    approved: number;
    pending: number;
  }>;
}

export interface FacultyOverviewData {
  department: Department;
  pendingReviewCount: number;
  forwardedToAdminCount: number;
  approvedCount: number;
  rejectedCount: number;
  recentApplications: ODApplication[];
}

export interface StudentOverviewData {
  metrics: {
    totalApplications: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
  upcomingApprovedDates: Array<{
    applicationId: string;
    applicationNumber: string;
    eventTitle: string;
    date: string;
    isFullDay: boolean;
    periods: number[];
  }>;
  recentApplications: ODApplication[];
}

export const analyticsService = {
  async getAdminOverview(): Promise<AdminOverviewData> {
    const res = await api.get<AdminOverviewData>('/analytics/admin-overview');
    return res.data;
  },

  async getFacultyOverview(): Promise<FacultyOverviewData> {
    const res = await api.get<FacultyOverviewData>('/analytics/faculty-overview');
    return res.data;
  },

  async getStudentOverview(): Promise<StudentOverviewData> {
    const res = await api.get<StudentOverviewData>('/analytics/student-overview');
    return res.data;
  },

  async exportCsv(): Promise<Blob> {
    const res = await api.get('/analytics/export-csv', { responseType: 'blob' });
    return res.data;
  },
};
