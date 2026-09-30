import React from 'react';
import { Video } from '../../types';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  title?: string;
  subtitle?: string;
  videos: Video[];
  emptyMessage?: string;
  showProgress?: boolean;
  onDelete?: (id: number) => void;
  canDelete?: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  title,
  subtitle,
  videos,
  emptyMessage = 'No videos found.',
  showProgress = false,
  onDelete,
  canDelete = false,
}) => {
  return (
    <div className="mb-12">
      {title && (
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs font-semibold text-slate-400">{videos.length} videos</span>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-500 text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              showProgress={showProgress}
              progressPercent={
                video.durationSeconds && video.userResumePosition
                  ? (video.userResumePosition / video.durationSeconds) * 100
                  : 0
              }
              resumeSeconds={video.userResumePosition}
              onDelete={onDelete}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
