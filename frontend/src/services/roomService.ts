import { api } from './api';
import { WatchRoom, ChatMessage } from '../types';

export const roomService = {
  async createRoom(videoId: number, title?: string): Promise<WatchRoom> {
    const res = await api.post<WatchRoom>('/api/rooms/create', { videoId, title });
    return res.data;
  },

  async getRoom(roomCode: string): Promise<WatchRoom> {
    const res = await api.get<WatchRoom>(`/api/rooms/${roomCode}`);
    return res.data;
  },

  async updateRoomState(roomCode: string, isPlaying: boolean, currentPositionSeconds: number): Promise<void> {
    await api.put(`/api/rooms/${roomCode}/state`, { isPlaying, currentPositionSeconds });
  },

  async getRoomMessages(roomCode: string): Promise<ChatMessage[]> {
    const res = await api.get<ChatMessage[]>(`/api/rooms/${roomCode}/messages`);
    return res.data;
  },

  async sendChatMessage(roomCode: string, content: string): Promise<ChatMessage> {
    const res = await api.post<ChatMessage>(`/api/rooms/${roomCode}/messages`, { content });
    return res.data;
  }
};
