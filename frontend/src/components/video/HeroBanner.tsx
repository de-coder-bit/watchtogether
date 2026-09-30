import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Clock, Sparkles, Film } from 'lucide-react';
import { Video } from '../../types';
import { roomService } from '../../services/roomService';
import { useAuth } from '../../context/AuthContext';

interface HeroBannerProps {
  video: Video | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ video }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  if (!video) return null;

  const handleStartWatchParty = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const room = await roomService.createRoom(video.id, `Watch Party: ${video.title}`);
      navigate(`/room/${room.roomCode}`);
    } catch (err) {
      console.error('Failed to create watch room:', err);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '1h 35m';
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remMins}m`;
    return `${remMins}m`;
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px] overflow-hidden rounded-3xl mb-12 shadow-2xl group">
      {/* Background Poster Image with Ambient Blur */}
      <img
        src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80'}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 group-hover:scale-100 transition-transform duration-1000"
      />

      {/* Cinematic Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/80 to-transparent lg:w-3/4" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-3xl">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="flex items-center gap-1 bg-brand-600/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3 h-3" />
            Featured Premiere
          </span>
          <span className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3 text-slate-400" />
            {formatDuration(video.durationSeconds)}
          </span>
          {video.resolutions && (
            <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              HLS 720p HD
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-md">
          {video.title}
        </h1>

        {/* Description */}
        <p className="text-slate-300 text-sm sm:text-base line-clamp-3 mb-6 font-normal leading-relaxed drop-shadow">
          {video.description || 'Experience high-definition adaptive streaming and real-time synchronized playback with your partner.'}
        </p>

        {/* Genres */}
        {video.genres && (
          <div className="flex flex-wrap gap-2 mb-8">
            {video.genres.split(',').map((genre, idx) => (
              <span key={idx} className="text-xs text-slate-400 font-medium bg-slate-800/60 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700/50">
                {genre.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleStartWatchParty}
            className="flex items-center gap-2.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-2xl shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 transition-all"
          >
            <Users className="w-5 h-5" />
            <span>Watch Party with Partner</span>
          </button>

          <button
            onClick={() => navigate(`/video/${video.id}`)}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-2xl border border-slate-700 backdrop-blur-md transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-slate-200" />
            <span>Solo Stream</span>
          </button>
        </div>
      </div>
    </div>
  );
};
