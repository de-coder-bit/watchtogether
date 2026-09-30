import React from 'react';
import { Heart, Play, Shield, Cloud, Radio } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-20 py-12 px-4 lg:px-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <Play className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
          </div>
          <span className="font-bold text-slate-200 text-sm">WatchTogether</span>
          <span className="text-slate-600">|</span>
          <span>Zero-Cost Full-Stack Video Streaming & Watch Party Platform</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>Cloudflare R2 / S3</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>HLS Multi-Bitrate</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>JWT + STOMP Sync</span>
          </div>
        </div>

        <p className="text-slate-500">
          Personal licensed media library streaming.
        </p>
      </div>
    </footer>
  );
};
