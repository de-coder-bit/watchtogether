import React from 'react';
import { Video } from '../types';
import VideoCard from './VideoCard';
import { Film } from 'lucide-react';

interface VideoGridProps {
  title?: string;
  videos: Video[];
  emptyMessage?: string;
  progressMap?: Record<number, number>; // videoId -> progressPercent
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  title,
  videos,
  emptyMessage = 'No videos found in library.',
  progressMap = {},
}) => {
  return (
    <div className="w-full mb-12">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>{title}</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {videos.length} {videos.length === 1 ? 'title' : 'titles'}
          </span>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center flex flex-col items-center justify-center">
          <Film className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              resumeProgress={progressMap[video.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
