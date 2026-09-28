import { api } from './api';
import { ReviewDecision, ODApplication, ApprovalReview } from '../types';

export interface FacultyReviewPayload {
  decision: ReviewDecision;
  remarks?: string;
}

export interface AdminReviewPayload {
  decision: ReviewDecision;
  remarks?: string;
}

export const reviewService = {
  async facultyReview(applicationId: string, payload: FacultyReviewPayload): Promise<{ application: ODApplication; review: ApprovalReview }> {
    const res = await api.post(`/reviews/faculty/${applicationId}`, payload);
    return res.data;
  },

  async adminReview(applicationId: string, payload: AdminReviewPayload): Promise<{ application: ODApplication; review: ApprovalReview }> {
    const res = await api.post(`/reviews/admin/${applicationId}`, payload);
    return res.data;
  },

  async getAuditTrail(applicationId: string): Promise<ApprovalReview[]> {
    const res = await api.get<ApprovalReview[]>(`/reviews/audit/${applicationId}`);
    return res.data;
  },
};
