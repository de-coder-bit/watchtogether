import { api } from './api';
import { Video, VideoUploadChunkResponse } from '../types';

export const videoService = {
  async getAllVideos(): Promise<Video[]> {
    const res = await api.get<Video[]>('/api/videos');
    return res.data;
  },

  async searchVideos(query: string, page = 0, size = 20): Promise<{ content: Video[]; totalPages: number; totalElements: number }> {
    const res = await api.get('/api/videos/search', {
      params: { q: query, page, size }
    });
    return res.data;
  },

  async getVideosByGenre(genre: string): Promise<Video[]> {
    const res = await api.get<Video[]>(`/api/videos/genres/${genre}`);
    return res.data;
  },

  async getMyUploads(): Promise<Video[]> {
    const res = await api.get<Video[]>('/api/videos/my-uploads');
    return res.data;
  },

  async getVideoById(id: number): Promise<Video> {
    const res = await api.get<Video>(`/api/videos/${id}`);
    return res.data;
  },

  async deleteVideo(id: number): Promise<void> {
    await api.delete(`/api/videos/${id}`);
  },

  async uploadDirect(
    file: File,
    title: string,
    description: string,
    genres: string,
    onProgress?: (percent: number) => void
  ): Promise<Video> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) formData.append('description', description);
    if (genres) formData.append('genres', genres);

    const res = await api.post<Video>('/api/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    return res.data;
  },

  async uploadChunked(
    file: File,
    title: string,
    description: string,
    genres: string,
    chunkSize = 2 * 1024 * 1024, // 2MB chunks
    onProgress?: (percent: number) => void
  ): Promise<Video> {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = 'up_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    let finalVideo: Video | undefined;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunkBlob = file.slice(start, end);
      const chunkFile = new File([chunkBlob], file.name, { type: file.type });

      const formData = new FormData();
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('chunk', chunkFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('genres', genres);
      formData.append('originalFilename', file.name);

      const res = await api.post<VideoUploadChunkResponse>('/api/videos/upload/chunk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (onProgress) {
        const percent = Math.round(((chunkIndex + 1) * 100) / totalChunks);
        onProgress(percent);
      }

      if (res.data.isComplete && res.data.video) {
        finalVideo = res.data.video;
      }
    }

    if (!finalVideo) {
      throw new Error('Chunked upload did not return final video metadata');
    }

    return finalVideo;
  }
};
