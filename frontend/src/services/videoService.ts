import api from './api';
import { Video } from '../types';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for smooth upload

export const videoService = {
  async getAllVideos(): Promise<Video[]> {
    const res = await api.get<Video[]>('/videos');
    return res.data;
  },

  async searchVideos(query?: string, genre?: string, page = 0, size = 12): Promise<{ content: Video[]; totalPages: number }> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (genre) params.append('genre', genre);
    params.append('page', page.toString());
    params.append('size', size.toString());
    const res = await api.get(`/videos/search?${params.toString()}`);
    return res.data;
  },

  async getVideoById(id: number): Promise<Video> {
    const res = await api.get<Video>(`/videos/${id}`);
    return res.data;
  },

  async getMyVideos(): Promise<Video[]> {
    const res = await api.get<Video[]>('/videos/my');
    return res.data;
  },

  async uploadVideoWithChunks(
    file: File,
    metadata: { title: string; description?: string; genres?: string },
    onProgress?: (progress: number) => void
  ): Promise<Video> {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = 'upload_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    let finalVideo: Video | null = null;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunkBlob = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunkBlob, file.name);
      formData.append('chunkIndex', i.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('uploadId', uploadId);
      if (metadata.title) formData.append('title', metadata.title);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.genres) formData.append('genres', metadata.genres);

      const res = await api.post('/videos/upload-chunk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const currentProgress = Math.round(((i + 1) / totalChunks) * 100);
      if (onProgress) onProgress(currentProgress);

      if (res.data?.isComplete && res.data?.video) {
        finalVideo = res.data.video;
      }
    }

    if (!finalVideo) {
      throw new Error('Upload completed but video record was not returned');
    }

    return finalVideo;
  },

  async updateVideo(id: number, data: { title: string; description?: string; genres?: string }): Promise<Video> {
    const res = await api.put<Video>(`/videos/${id}`, data);
    return res.data;
  },

  async deleteVideo(id: number): Promise<void> {
    await api.delete(`/videos/${id}`);
  },
};
