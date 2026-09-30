import { api } from './api';
import { WatchProgress } from '../types';

export const watchlistService = {
  async updateProgress(videoId: number, progressSeconds: number, completed?: boolean): Promise<WatchProgress> {
    const res = await api.post<WatchProgress>('/api/watchlist/progress', {
      videoId,
      progressSeconds,
      completed
    });
    return res.data;
  },

  async getContinueWatching(): Promise<WatchProgress[]> {
    const res = await api.get<WatchProgress[]>('/api/watchlist/continue-watching');
    return res.data;
  }
};
