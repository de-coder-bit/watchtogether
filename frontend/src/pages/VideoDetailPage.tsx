import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock, ArrowLeft, Film, Shield, Sparkles } from 'lucide-react';
import { Video } from '../types';
import { videoService } from '../services/videoService';
import { roomService } from '../services/roomService';
import { watchlistService } from '../services/watchlistService';
import { useAuth } from '../context/AuthContext';
import { AdaptivePlayer } from '../components/video/AdaptivePlayer';

export const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastSavedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (id) {
      loadVideo(parseInt(id, 10));
    }
  }, [id]);

  const loadVideo = async (videoId: number) => {
    try {
      setLoading(true);
      const res = await videoService.getVideoById(videoId);
      setVideo(res);
    } catch (err: any) {
      setError('Video not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWatchParty = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!video) return;

    try {
      const room = await roomService.createRoom(video.id, `Watch Party: ${video.title}`);
      navigate(`/room/${room.roomCode}`);
    } catch (err) {
      console.error('Failed to create watch room:', err);
    }
  };

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    // Save watch progress to database every 10 seconds
    if (isAuthenticated && video && Math.abs(currentTime - lastSavedTimeRef.current) > 10) {
      lastSavedTimeRef.current = currentTime;
      watchlistService.updateProgress(video.id, currentTime, currentTime / duration > 0.95)
        .catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-white mb-2">Video Unavailable</h2>
        <p className="text-slate-400 text-sm mb-6">{error || 'This video could not be loaded.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const streamSrc = video.hlsMasterUrl || '';

  return (
    <div className="min-h-screen px-4 lg:px-8 max-w-6xl mx-auto py-6">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Main Adaptive Video Player */}
      <div className="mb-8">
        <AdaptivePlayer
          src={streamSrc}
          poster={video.thumbnailUrl}
          title={video.title}
          initialTime={video.userResumePosition || 0}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      {/* Video Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Details & Synopsis */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="bg-brand-950/80 border border-brand-500/40 text-brand-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {video.genres || 'Feature'}
              </span>
              {video.resolutions && (
                <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  Adaptive HLS (360p / 480p / 720p)
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{video.title}</h1>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            {video.description || 'Enjoy synchronized high-definition streaming with instant playback controls and real-time live chat.'}
          </p>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <img
                src={video.uploader?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${video.uploader?.username}`}
                alt="Uploader"
                className="w-8 h-8 rounded-full bg-slate-800"
              />
              <div>
                <p className="font-semibold text-white">{video.uploader?.username || 'WatchTogether Media'}</p>
                <p className="text-[10px] text-slate-500">Uploaded {new Date(video.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Watch Party CTA Card */}
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-brand-600 p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-400" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Watch With Partner</h3>
                <p className="text-xs text-slate-400">Synchronized frame-by-frame</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Create an instant synchronized room. When either of you plays, pauses, or seeks, both screens stay in exact sync!
            </p>

            <button
              onClick={handleStartWatchParty}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-brand-500/20 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Launch Watch Party</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
