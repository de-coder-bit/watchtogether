import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles } from 'lucide-react';
import { Video } from '../types';
import { videoService } from '../services/videoService';
import { VideoGrid } from '../components/video/VideoGrid';

const GENRES = ['All', 'Animation', 'Sci-Fi', 'Action', 'Comedy', 'Drama', 'Documentary', 'Fantasy', 'Short'];

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchQuery(queryParam);
    fetchVideos(queryParam, selectedGenre);
  }, [queryParam, selectedGenre]);

  const fetchVideos = async (q: string, genre: string) => {
    try {
      setLoading(true);
      if (genre !== 'All') {
        const res = await videoService.getVideosByGenre(genre);
        setVideos(res);
      } else if (q.trim()) {
        const res = await videoService.searchVideos(q.trim());
        setVideos(res.content);
      } else {
        const res = await videoService.getAllVideos();
        setVideos(res);
      }
    } catch (err) {
      console.error('Failed to browse videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };

  return (
    <div className="min-h-screen px-4 lg:px-8 max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Browse Catalog</h1>
        <p className="text-slate-400 text-sm mt-1">Discover, search, and stream your personal video library.</p>
      </div>

      {/* Search & Genre Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/60 border border-slate-800 p-4 rounded-3xl backdrop-blur-md">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        {/* Genre Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => {
                setSelectedGenre(g);
                if (g !== 'All') {
                  setSearchParams({});
                }
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === g
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <VideoGrid
          title={selectedGenre !== 'All' ? `${selectedGenre} Titles` : searchQuery ? `Search results for "${searchQuery}"` : 'All Available Titles'}
          videos={videos}
          emptyMessage="No titles match your query. Try adjusting your search keywords."
        />
      )}
    </div>
  );
};
