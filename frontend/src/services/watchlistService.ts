import api from './api';
import { WatchProgress } from '../types';

export const watchlistService = {
  async saveProgress(data: { videoId: number; progressSeconds: number; completed?: boolean }): Promise<WatchProgress> {
    const res = await api.post<WatchProgress>('/watchlist/progress', data);
    return res.data;
  },

  async getContinueWatching(): Promise<WatchProgress[]> {
    const res = await api.get<WatchProgress[]>('/watchlist/continue');
    return res.data;
  },

  async getProgressForVideo(videoId: number): Promise<WatchProgress | null> {
    try {
      const res = await api.get<WatchProgress>(`/watchlist/video/${videoId}`);
      return res.data;
    } catch {
      return null;
    }
  },
};
