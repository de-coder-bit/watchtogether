export type VideoStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';

export interface Partner {
  id: number;
  username: string;
  email: string;
  avatarUrl: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl: string;
  role: string;
  partner?: Partner | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Video {
  id: number;
  title: string;
  description?: string;
  genres?: string;
  durationSeconds?: number;
  originalFilename?: string;
  hlsMasterUrl?: string;
  thumbnailUrl?: string;
  status: VideoStatus;
  fileSizeBytes?: number;
  resolutions?: string;
  uploader?: User;
  processingProgress?: number;
  errorMessage?: string;
  userResumePosition?: number;
  createdAt: string;
}

export interface VideoUploadChunkResponse {
  uploadId: string;
  chunkIndex: number;
  totalChunks: number;
  isComplete: boolean;
  video?: Video;
}

export interface WatchRoom {
  id: number;
  roomCode: string;
  title: string;
  host: User;
  partner?: User | null;
  video: Video;
  isPlaying: boolean;
  currentPositionSeconds: number;
  lastActionTimestamp?: number;
  createdAt: string;
}

export interface ChatMessage {
  id?: number;
  roomCode: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp?: string;
}

export type PlaybackAction = 
  | 'PLAY'
  | 'PAUSE'
  | 'SEEK'
  | 'SYNC_REQUEST'
  | 'SYNC_RESPONSE'
  | 'BUFFERING'
  | 'READY'
  | 'HEARTBEAT';

export interface PlaybackSyncMessage {
  roomCode: string;
  senderId: number;
  senderName: string;
  action: PlaybackAction;
  currentPosition: number;
  playbackRate?: number;
  clientTimestamp: number;
  serverTimestamp?: number;
}

export interface PresenceMessage {
  roomCode: string;
  userId: number;
  username: string;
  avatarUrl?: string;
  status: 'JOINED' | 'LEFT' | 'BUFFERING' | 'READY';
  timestamp: number;
}

export interface TypingMessage {
  roomCode: string;
  userId: number;
  username: string;
  isTyping: boolean;
}

export interface WatchProgress {
  id: number;
  videoId: number;
  videoTitle: string;
  videoThumbnailUrl?: string;
  durationSeconds?: number;
  progressSeconds: number;
  percentComplete: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface PartnerInviteResponse {
  inviteCode: string;
  expiresAt: string;
  inviteUrl: string;
}

export interface PartnerStatusResponse {
  isPaired: boolean;
  partner?: Partner | null;
  activeInviteCode?: string;
  inviteExpiresAt?: string;
}
