import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoService } from '../services/videoService';
import { roomService } from '../services/roomService';
import { Video } from '../types';
import { Play, Video as VideoIcon, Clock, Layers, User, Calendar, ArrowLeft, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const data = await videoService.getVideoById(parseInt(id));
        setVideo(data);
      } catch (err) {
        console.error('Failed to load video:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  const handleStartWatchParty = async () => {
    if (!video) return;
    setCreatingRoom(true);
    try {
      const room = await roomService.createRoom({
        videoId: video.id,
        title: `Watch: ${video.title}`,
      });
      navigate(`/room/${room.roomCode}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setCreatingRoom(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'HD';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs > 0 ? secs + 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white">Video not found</h2>
        <button
          onClick={() => navigate('/browse')}
          className="mt-4 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-xs"
        >
          Back to Browse
        </button>
      </div>
    );
  }

  const defaultThumbnail = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80';
  const poster = video.thumbnailUrl || defaultThumbnail;

  return (
    <div className="relative min-h-[85vh] animate-in fade-in duration-300">
      {/* Blurred Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25 filter blur-3xl -z-10">
        <img src={poster} alt="" className="w-full h-full object-cover scale-125" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Poster Image */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group aspect-[16/10] lg:aspect-[4/3] bg-cinema-card">
            <img src={poster} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            
            {/* Quick Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handleStartWatchParty}
                disabled={creatingRoom}
                className="w-16 h-16 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white shadow-glow-brand hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <Play className="w-7 h-7 fill-white ml-1" />
              </button>
            </div>
          </div>

          {/* Details & Action */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Ready to Stream
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-slate-200 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatDuration(video.durationSeconds)}</span>
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-slate-200 flex items-center space-x-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>{video.resolutions || 'Adaptive HLS (360p-1080p)'}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {video.title}
            </h1>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5">
              {video.genres?.split(',').map((g, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cinema-card border border-white/5 text-slate-300"
                >
                  {g.trim()}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {video.description || 'Enjoy this video with your paired partner with synchronized playback controls, audio ducking, and face-to-face video calling.'}
            </p>

            {/* Metadata Card */}
            <div className="p-4 rounded-2xl bg-cinema-card/70 border border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Uploaded by</span>
                <span className="font-semibold text-slate-200">{video.uploader?.username || 'System'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Status</span>
                <span className="font-semibold text-emerald-400">Ready (HLS Multi-Bitrate)</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Original File</span>
                <span className="font-semibold text-slate-200 truncate block">{video.originalFilename || 'video.mp4'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={handleStartWatchParty}
                disabled={creatingRoom}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-sm flex items-center space-x-2.5 shadow-glow-brand hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <VideoIcon className="w-5 h-5" />
                <span>{creatingRoom ? 'Creating Room...' : 'Start Watch Party (With Video Call)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage;
