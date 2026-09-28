import { api } from './api';
import { User } from '../types';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  async studentLogin(identifier: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/student-login', { identifier, password });
    return res.data;
  },

  async facultyLogin(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/faculty-login', { email, password });
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};
