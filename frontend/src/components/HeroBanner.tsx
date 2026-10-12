import React from 'react';
import { Play, Video as VideoIcon, Info, Sparkles, Clock, Layers } from 'lucide-react';
import { Video } from '../types';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { useAuth } from '../context/AuthContext';

interface HeroBannerProps {
  video: Video;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ video }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartWatchParty = async () => {
    try {
      const room = await roomService.createRoom({
        videoId: video.id,
        title: `Watch: ${video.title}`,
      });
      navigate(`/room/${room.roomCode}`);
    } catch (err) {
      console.error('Failed to create watch room:', err);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '1h 35m';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs > 0 ? secs + 's' : ''}`;
  };

  const defaultHeroBg = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80';
  const heroImage = video.thumbnailUrl || defaultHeroBg;

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/10 group">
      {/* Background Image with parallax zoom effect */}
      <img
        src={heroImage}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Dark Cinema Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/80 to-transparent w-full md:w-3/4" />

      {/* Hero Content */}
      <div className="relative h-full max-w-4xl flex flex-col justify-end p-8 md:p-12 z-10">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center space-x-1 shadow-glow-brand">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Featured Premiere
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-slate-200 backdrop-blur-md flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formatDuration(video.durationSeconds)}</span>
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-slate-200 backdrop-blur-md flex items-center space-x-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>1080p HLS</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
          {video.title}
        </h1>

        {/* Description */}
        <p className="text-sm md:text-base text-slate-300 line-clamp-3 mb-6 max-w-2xl leading-relaxed">
          {video.description || 'Stream high-definition cinema in frame-by-frame synchronization with your partner, complete with face-to-face real-time video calls and live chat.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleStartWatchParty}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-sm flex items-center space-x-2.5 shadow-glow-brand hover:shadow-glow-accent hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Watch Party + Video Call</span>
          </button>

          <button
            onClick={() => navigate(`/video/${video.id}`)}
            className="px-5 py-3.5 rounded-2xl glass-panel hover:bg-white/15 text-slate-200 hover:text-white font-semibold text-sm flex items-center space-x-2 transition-all duration-200"
          >
            <Info className="w-4 h-4" />
            <span>More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
