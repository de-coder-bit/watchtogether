import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Film, Trash2 } from 'lucide-react';
import { Video } from '../types';
import { videoService } from '../services/videoService';
import { VideoGrid } from '../components/video/VideoGrid';
import { useAuth } from '../context/AuthContext';

export const MyUploadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadUploads();
  }, [isAuthenticated]);

  const loadUploads = async () => {
    try {
      setLoading(true);
      const res = await videoService.getMyUploads();
      setVideos(res);
    } catch (err) {
      console.error('Failed to load my uploads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this video and all associated HLS files?')) return;

    try {
      await videoService.deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert('Failed to delete video');
    }
  };

  return (
    <div className="min-h-screen px-4 lg:px-8 max-w-7xl mx-auto py-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Uploaded Media</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and stream your personal video library.</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-brand-600/20"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Video</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <VideoGrid
          videos={videos}
          emptyMessage="You haven't uploaded any media yet. Click 'Upload New Video' to get started!"
          canDelete={true}
          onDelete={handleDelete}
        />
      )}

    </div>
  );
};
