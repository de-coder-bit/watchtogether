import React, { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import { roomService } from '../services/roomService';
import { Video } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Trash2, Edit, Clock, Layers, AlertCircle, RefreshCw, Upload, Sparkles } from 'lucide-react';

export const MyUploadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyVideos = async () => {
    try {
      const data = await videoService.getMyVideos();
      setVideos(data);
    } catch (err) {
      console.error('Failed to load my videos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyVideos();
    // Auto refresh every 6 seconds to update transcoding progress
    const interval = setInterval(fetchMyVideos, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await videoService.deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error('Failed to delete video:', err);
    }
  };

  const handleStartRoom = async (video: Video) => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Media Library</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage your uploads and monitor background FFmpeg multi-bitrate transcoding status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchMyVideos();
            }}
            className="p-2.5 rounded-xl glass-panel text-slate-400 hover:text-white transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/upload"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-xs shadow-glow-brand flex items-center space-x-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Video</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="p-16 rounded-3xl glass-panel text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-400 flex items-center justify-center shadow-glow-brand">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No videos uploaded yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Upload your first video to transcode it automatically into adaptive HLS streams for synchronized watch parties.
            </p>
          </div>
          <Link
            to="/upload"
            className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-glow-brand"
          >
            Upload Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="p-5 rounded-2xl bg-cinema-card border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-brand-500/30 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80'}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {video.status === 'READY' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => handleStartRoom(video)}>
                      <Play className="w-6 h-6 fill-white text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">{video.title}</h3>
                    
                    {/* Status Pill */}
                    {video.status === 'READY' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Ready
                      </span>
                    ) : video.status === 'PROCESSING' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        <span>Transcoding {video.processingProgress ? `(${video.processingProgress}%)` : ''}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                        Failed
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">{video.description || 'No description'}</p>
                  
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    <span>{video.originalFilename}</span>
                    <span>•</span>
                    <span>{video.resolutions || 'Adaptive HLS'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 self-end md:self-center">
                {video.status === 'READY' && (
                  <button
                    onClick={() => handleStartRoom(video)}
                    className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow-brand flex items-center space-x-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Party</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(video.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Delete Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyUploadsPage;
