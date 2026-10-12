import React, { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import { Video } from '../types';
import VideoGrid from '../components/VideoGrid';
import { Search, Filter, Sparkles } from 'lucide-react';

const GENRES = ['All', 'Sci-Fi', 'Animation', 'Action', 'Comedy', 'Drama', 'Fantasy', 'Documentary'];

export const BrowsePage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const query = searchQuery.trim();
        const genre = selectedGenre === 'All' ? undefined : selectedGenre;
        const result = await videoService.searchVideos(query, genre, 0, 50);
        setVideos(result.content || []);
      } catch (err) {
        console.error('Failed to search videos:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchVideos, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedGenre]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Header & Search Bar */}
      <div className="mb-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Browse Video Library</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Discover uploaded titles with multi-bitrate HLS streaming and synced watch party capabilities.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, synopsis, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-cinema-card border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm shadow-xl"
          />
        </div>

        {/* Genre Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === genre
                  ? 'bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow-glow-brand'
                  : 'bg-cinema-card text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <VideoGrid
        videos={videos}
        emptyMessage={loading ? 'Searching media titles...' : 'No titles found matching your query.'}
      />
    </div>
  );
};

export default BrowsePage;
