import React, { useEffect, useState } from 'react';
import { HeroBanner } from '../components/video/HeroBanner';
import { VideoGrid } from '../components/video/VideoGrid';
import { Video, WatchProgress } from '../types';
import { videoService } from '../services/videoService';
import { watchlistService } from '../services/watchlistService';
import { useAuth } from '../context/AuthContext';
import { Film, Sparkles, TrendingUp } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const videoList = await videoService.getAllVideos();
      setVideos(videoList);

      if (isAuthenticated) {
        try {
          const progressList = await watchlistService.getContinueWatching();
          setContinueWatching(progressList);
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('Failed to load home page media:', err);
    } finally {
      setLoading(false);
    }
  };

  const featuredVideo = videos.length > 0 ? videos[0] : null;

  // Map continue watching progress back to video objects
  const continueWatchingVideos: Video[] = continueWatching
    .map((cw) => {
      const match = videos.find((v) => v.id === cw.videoId);
      if (match) {
        return {
          ...match,
          userResumePosition: cw.progressSeconds,
        };
      }
      return null;
    })
    .filter(Boolean) as Video[];

  const recentUploads = videos.slice(1);

  return (
    <div className="min-h-screen px-4 lg:px-8 max-w-7xl mx-auto py-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading streaming library...</p>
        </div>
      ) : (
        <>
          {/* Featured Hero Premiere */}
          {featuredVideo && <HeroBanner video={featuredVideo} />}

          {/* Continue Watching Section */}
          {continueWatchingVideos.length > 0 && (
            <VideoGrid
              title="Continue Watching"
              subtitle="Pick up right where you left off"
              videos={continueWatchingVideos}
              showProgress={true}
            />
          )}

          {/* All Media Catalog */}
          <VideoGrid
            title="Trending &amp; Popular"
            subtitle="Explore high-definition adaptive HLS content"
            videos={videos}
          />
        </>
      )}
    </div>
  );
};
