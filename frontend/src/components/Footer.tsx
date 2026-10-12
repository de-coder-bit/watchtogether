import React from 'react';
import { Film, Heart, ShieldCheck, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-cinema-bg/95 py-10 mt-auto text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">WatchTogether</span>
            <span className="text-xs text-slate-500">| Synchronized Video Streaming & Live Video Call</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>HLS Multi-Bitrate</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>WebRTC Peer-to-Peer</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span>Built for Two</span>
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} WatchTogether. Designed for streaming your personal and licensed media library together.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
