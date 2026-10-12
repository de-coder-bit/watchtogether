import React, { useEffect, useRef } from 'react';
import { MicOff, VideoOff, Volume2 } from 'lucide-react';

interface VideoCallTileProps {
  stream: MediaStream | null;
  username: string;
  avatarUrl?: string;
  isLocal?: boolean;
  isMicOn: boolean;
  isCamOn: boolean;
  isSpeaking: boolean;
}

export const VideoCallTile: React.FC<VideoCallTileProps> = ({
  stream,
  username,
  avatarUrl,
  isLocal = false,
  isMicOn,
  isCamOn,
  isSpeaking,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const fallbackAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

  return (
    <div
      className={`relative w-full aspect-video sm:aspect-square md:aspect-video rounded-2xl overflow-hidden bg-cinema-card border transition-all duration-300 ${
        isSpeaking
          ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-[1.01]'
          : 'border-white/10'
      }`}
    >
      {/* Video Stream */}
      {isCamOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local to prevent echo
          className={`w-full h-full object-cover ${isLocal ? '-scale-x-100' : ''}`}
        />
      ) : (
        /* Camera Off Fallback Avatar */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-cinema-card p-4">
          <div className="relative">
            <img
              src={avatarUrl || fallbackAvatar}
              alt={username}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 object-cover ${
                isSpeaking ? 'border-emerald-400 shadow-lg shadow-emerald-500/30 animate-pulse' : 'border-white/20'
              }`}
            />
            {!isCamOn && (
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-800 border border-white/20 text-slate-400">
                <VideoOff className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <span className="mt-2 text-xs font-semibold text-slate-300 truncate max-w-[120px]">
            {username}
          </span>
        </div>
      )}

      {/* Name and Audio Indicator Badge */}
      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center space-x-1.5 text-[11px] font-medium text-white">
        <span className="truncate max-w-[100px]">{isLocal ? 'You' : username}</span>
        {!isMicOn ? (
          <MicOff className="w-3 h-3 text-red-400 shrink-0" />
        ) : isSpeaking ? (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        ) : null}
      </div>

      {/* Mic Muted Overlay Tag */}
      {!isMicOn && (
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white shadow-md">
          <MicOff className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};

export default VideoCallTile;
