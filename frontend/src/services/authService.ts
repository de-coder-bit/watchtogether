import { api } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(data: { username: string; email: string; password: string; avatarUrl?: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/api/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/api/auth/login', data);
    return res.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await api.get<User>('/api/auth/me');
    return res.data;
  },

  logout(): void {
    localStorage.removeItem('wt_token');
    localStorage.removeItem('wt_user');
  }
};
