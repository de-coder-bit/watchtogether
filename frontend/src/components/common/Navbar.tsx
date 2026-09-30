import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Play, Film, Upload, Heart, User as UserIcon, LogOut, Search, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PartnerModal } from '../partner/PartnerModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isPaired = !!user?.partner;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-cinema-bg/90 backdrop-blur-md border-b border-cinema-border/50 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-cinema-bg rounded-[10px] flex items-center justify-center">
                  <Play className="w-5 h-5 text-brand-400 fill-brand-400 ml-0.5" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-brand-300">
                  WatchTogether
                </span>
                <span className="text-[10px] font-medium tracking-widest text-brand-400 uppercase -mt-1">
                  Sync & Stream
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link 
                to="/" 
                className={`transition-colors hover:text-brand-400 ${location.pathname === '/' ? 'text-brand-400 font-semibold' : 'text-slate-300'}`}
              >
                Home
              </Link>
              <Link 
                to="/browse" 
                className={`transition-colors hover:text-brand-400 ${location.pathname.startsWith('/browse') ? 'text-brand-400 font-semibold' : 'text-slate-300'}`}
              >
                Browse Catalog
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/my-uploads" 
                  className={`transition-colors hover:text-brand-400 ${location.pathname === '/my-uploads' ? 'text-brand-400 font-semibold' : 'text-slate-300'}`}
                >
                  My Media
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-xs lg:max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search movies, genres, clips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            </form>
          </div>

          {/* Right Actions: Partner Status, Upload, Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Partner Status Pill */}
                <button
                  onClick={() => setIsPartnerModalOpen(true)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isPaired
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-brand-500/50'
                  }`}
                  title="Partner Pairing Status"
                >
                  <span className={`w-2 h-2 rounded-full ${isPaired ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  {isPaired ? (
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                      <span>{user?.partner?.username}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-brand-400" />
                      <span>Pair Partner</span>
                    </div>
                  )}
                </button>

                {/* Upload Button */}
                <Link
                  to="/upload"
                  className="hidden sm:flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md shadow-brand-600/30 transition-all hover:scale-105"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                </Link>

                {/* User Profile Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full border border-slate-700 hover:border-brand-500 transition-colors focus:outline-none"
                  >
                    <img
                      src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                      alt={user?.username}
                      className="w-8 h-8 rounded-full object-cover bg-slate-800"
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="font-semibold text-white">{user?.username}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => { setIsPartnerModalOpen(true); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2.5"
                      >
                        <Users className="w-4 h-4 text-brand-400" />
                        Partner Settings
                      </button>
                      <Link
                        to="/upload"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2.5 sm:hidden"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        Upload Video
                      </Link>
                      <button
                        onClick={() => { logout(); setIsUserMenuOpen(false); navigate('/login'); }}
                        className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-950/30 flex items-center gap-2.5 mt-1 border-t border-slate-800/80"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-md shadow-brand-600/30 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Partner Pairing Modal */}
      {isPartnerModalOpen && (
        <PartnerModal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} />
      )}
    </>
  );
};
