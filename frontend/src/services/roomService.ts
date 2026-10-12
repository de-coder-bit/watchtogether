import api from './api';
import { ChatMessage, WatchRoom } from '../types';

export const roomService = {
  async createRoom(data: { videoId: number; title?: string }): Promise<WatchRoom> {
    const res = await api.post<WatchRoom>('/rooms', data);
    return res.data;
  },

  async getRoom(roomCode: string): Promise<WatchRoom> {
    const res = await api.get<WatchRoom>(`/rooms/${roomCode}`);
    return res.data;
  },

  async joinRoom(roomCode: string): Promise<WatchRoom> {
    const res = await api.post<WatchRoom>(`/rooms/${roomCode}/join`);
    return res.data;
  },

  async getMyRooms(): Promise<WatchRoom[]> {
    const res = await api.get<WatchRoom[]>('/rooms/my');
    return res.data;
  },

  async getChatHistory(roomCode: string, limit = 50): Promise<ChatMessage[]> {
    const res = await api.get<ChatMessage[]>(`/rooms/${roomCode}/messages?limit=${limit}`);
    return res.data;
  },

  async sendChatMessage(roomCode: string, content: string): Promise<ChatMessage> {
    const res = await api.post<ChatMessage>(`/rooms/${roomCode}/messages`, { content });
    return res.data;
  },
};
