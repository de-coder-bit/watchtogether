import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Users, Upload, LogOut, User as UserIcon, Heart, Sparkles, Video as VideoIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PartnerModal from './PartnerModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl bg-cinema-bg/85 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-pink-500 to-indigo-500 flex items-center justify-center shadow-glow-brand group-hover:scale-105 transition-transform duration-300">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
                    Watch<span className="text-brand-400">Together</span>
                  </span>
                  <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium">Cinema & Call Sync</span>
                </div>
              </Link>

              {/* Nav Links */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center space-x-1">
                  <Link
                    to="/"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/')
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/browse"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/browse')
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Browse Library
                  </Link>
                  <Link
                    to="/upload"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/upload')
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Upload Video
                  </Link>
                  <Link
                    to="/my-uploads"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/my-uploads')
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    My Media
                  </Link>
                </div>
              )}
            </div>

            {/* Right Action Bar */}
            <div className="flex items-center space-x-3">
              {isAuthenticated && user ? (
                <>
                  {/* Partner Status Button */}
                  <button
                    onClick={() => setIsPartnerModalOpen(true)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      user.partner
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-brand-950/40 border-brand-500/40 text-brand-300 hover:bg-brand-900/50 shadow-[0_0_15px_rgba(217,70,239,0.15)]'
                    }`}
                  >
                    {user.partner ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                        <span className="hidden sm:inline">Paired with</span>
                        <span className="font-bold text-white truncate max-w-[100px]">{user.partner.username}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        <span>Pair with Partner</span>
                      </>
                    )}
                  </button>

                  {/* User Profile & Logout */}
                  <div className="flex items-center space-x-2.5 pl-2 border-l border-white/10">
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full border border-white/20 bg-slate-800 object-cover"
                    />
                    <span className="hidden md:inline text-sm font-medium text-slate-200">
                      {user.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      title="Log Out"
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white shadow-glow-brand transition-all duration-200 font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Partner Modal */}
      {isPartnerModalOpen && (
        <PartnerModal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
