import React from 'react';
import { Play, Clock, Sparkles, Video as VideoIcon } from 'lucide-react';
import { Video } from '../types';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../services/roomService';

interface VideoCardProps {
  video: Video;
  resumeProgress?: number; // percentage (0-100)
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, resumeProgress }) => {
  const navigate = useNavigate();

  const handleStartRoom = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const room = await roomService.createRoom({
        videoId: video.id,
        title: `Watch: ${video.title}`,
      });
      navigate(`/room/${room.roomCode}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'HD';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs > 0 ? secs + 's' : ''}`;
  };

  const defaultThumbnail = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
  const poster = video.thumbnailUrl || defaultThumbnail;

  return (
    <div
      onClick={() => navigate(`/video/${video.id}`)}
      className="group relative cursor-pointer rounded-2xl bg-cinema-card border border-white/5 overflow-hidden glow-card flex flex-col transition-all duration-300 hover:border-brand-500/40"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={poster}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-transparent opacity-80" />

        {/* Duration Badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-semibold text-slate-200 border border-white/10 flex items-center space-x-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formatDuration(video.durationSeconds)}</span>
        </div>

        {/* Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
          <button
            onClick={handleStartRoom}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-brand hover:scale-110 active:scale-95 transition-transform"
            title="Start Watch Party"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>

        {/* Resume Watch Progress Bar */}
        {resumeProgress !== undefined && resumeProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-pink-500"
              style={{ width: `${Math.min(100, resumeProgress)}%` }}
            />
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[11px] text-brand-400 font-medium mb-1">
            <span>{video.genres?.split(',')[0] || 'Movie'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Adaptive HLS</span>
          </div>

          <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
            {video.title}
          </h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {video.description || 'Synchronized streaming with live video call.'}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-[120px]">
            {video.uploader?.username ? `By ${video.uploader.username}` : 'Featured'}
          </span>

          <button
            onClick={handleStartRoom}
            className="text-[11px] font-semibold text-brand-300 hover:text-brand-200 flex items-center space-x-1"
          >
            <span>Watch Party</span>
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
