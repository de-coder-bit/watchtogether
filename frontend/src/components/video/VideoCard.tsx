import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Clock, Trash2 } from 'lucide-react';
import { Video } from '../../types';
import { roomService } from '../../services/roomService';
import { useAuth } from '../../context/AuthContext';

interface VideoCardProps {
  video: Video;
  showProgress?: boolean;
  progressPercent?: number;
  resumeSeconds?: number;
  onDelete?: (id: number) => void;
  canDelete?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  showProgress = false,
  progressPercent = 0,
  resumeSeconds,
  onDelete,
  canDelete = false
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartWatchParty = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const room = await roomService.createRoom(video.id, `Watch Party: ${video.title}`);
      navigate(`/room/${room.roomCode}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '1h 20m';
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remMins}m`;
    return `${remMins}m`;
  };

  return (
    <div
      onClick={() => navigate(`/video/${video.id}`)}
      className="group relative bg-slate-900 border border-slate-800/80 hover:border-brand-500/50 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
    >
      {/* Thumbnail Aspect Box */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'}
          alt={video.title}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Duration Badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-200 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {formatDuration(video.durationSeconds)}
        </div>

        {/* Resolutions / Status Badge */}
        {video.status === 'READY' ? (
          <div className="absolute top-2.5 left-2.5 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
            HLS
          </div>
        ) : (
          <div className="absolute top-2.5 left-2.5 bg-amber-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
            Processing {video.processingProgress ? `${video.processingProgress}%` : ''}
          </div>
        )}

        {/* Hover Overlay Buttons */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            onClick={handleStartWatchParty}
            className="w-11 h-11 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-600/40 hover:scale-110 transition-transform"
            title="Start Synced Watch Party"
          >
            <Users className="w-5 h-5" />
          </button>
          <div
            className="w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-600/40 hover:scale-110 transition-transform"
            title="Play Stream"
          >
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Progress Bar (Continue Watching) */}
        {showProgress && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-pink-500 rounded-r"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
              {video.title}
            </h3>
            {canDelete && onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(video.id); }}
                className="text-slate-500 hover:text-rose-400 p-1 -mr-1 transition-colors"
                title="Delete Media"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-normal leading-relaxed">
            {video.description || 'Adaptive HLS stream with multi-bitrate resolution support.'}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
          <span className="truncate max-w-[140px] text-brand-400/90 font-medium">
            {video.genres?.split(',')[0] || 'General'}
          </span>
          <span>{video.uploader?.username || 'WatchTogether'}</span>
        </div>
      </div>
    </div>
  );
};
