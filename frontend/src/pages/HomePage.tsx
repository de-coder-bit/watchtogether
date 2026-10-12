import React, { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import { watchlistService } from '../services/watchlistService';
import { Video, WatchProgress } from '../types';
import HeroBanner from '../components/HeroBanner';
import VideoGrid from '../components/VideoGrid';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Heart, Film, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [allVideos, progressList] = await Promise.all([
          videoService.getAllVideos(),
          user ? watchlistService.getContinueWatching() : Promise.resolve([]),
        ]);
        setVideos(allVideos);
        setContinueWatching(progressList);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const featuredVideo = videos.length > 0 ? videos[0] : null;
  const trendingVideos = videos.slice(0, 8);
  const sciFiVideos = videos.filter((v) => v.genres?.toLowerCase().includes('sci-fi'));
  const animationVideos = videos.filter((v) => v.genres?.toLowerCase().includes('animation'));

  const progressMap: Record<number, number> = {};
  continueWatching.forEach((p) => {
    progressMap[p.videoId] = p.percentComplete;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Partner Banner if not paired */}
      {user && !user.partner && (
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-brand-950/60 via-purple-950/50 to-indigo-950/60 border border-brand-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-glow-brand">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <Heart className="w-6 h-6 fill-brand-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pair with your watching partner</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Invite your partner so you can launch synchronized watch rooms and video call with a single click.
              </p>
            </div>
          </div>
          <Link
            to="/pair"
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow-brand flex items-center space-x-1.5 shrink-0 transition-all"
          >
            <span>Pair Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Featured Hero Banner */}
      {featuredVideo && <HeroBanner video={featuredVideo} />}

      {/* Continue Watching Section (if user has progress) */}
      {continueWatching.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-400"></span>
              <span>Continue Watching</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {continueWatching.map((item) => {
              const video = videos.find((v) => v.id === item.videoId) || {
                id: item.videoId,
                title: item.videoTitle,
                thumbnailUrl: item.videoThumbnailUrl,
                durationSeconds: item.durationSeconds,
                status: 'READY' as const,
                createdAt: item.lastWatchedAt,
              };
              return (
                <VideoGrid
                  key={item.id}
                  videos={[video]}
                  progressMap={{ [video.id]: item.percentComplete }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Catalog */}
      <VideoGrid
        title="Trending on WatchTogether"
        videos={trendingVideos}
        progressMap={progressMap}
      />

      {/* Sci-Fi & Cyberpunk */}
      {sciFiVideos.length > 0 && (
        <VideoGrid
          title="Sci-Fi & Cyberpunk Hits"
          videos={sciFiVideos}
          progressMap={progressMap}
        />
      )}

      {/* Animation & Adventure */}
      {animationVideos.length > 0 && (
        <VideoGrid
          title="Animation & Adventure"
          videos={animationVideos}
          progressMap={progressMap}
        />
      )}
    </div>
  );
};

export default HomePage;
