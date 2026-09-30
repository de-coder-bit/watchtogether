import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings,
  RotateCcw, RotateCw, Sparkles, Check, FastForward
} from 'lucide-react';

export interface QualityLevel {
  id: number;
  height: number;
  bitrate: number;
  name: string;
}

export interface AdaptivePlayerProps {
  src: string;
  poster?: string;
  title?: string;
  initialTime?: number;
  isPartyMode?: boolean;
  partnerName?: string;
  onPlay?: (currentTime: number) => void;
  onPause?: (currentTime: number) => void;
  onSeek?: (currentTime: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onBuffering?: (isBuffering: boolean) => void;
  onEnded?: () => void;
  syncCommand?: {
    action: 'PLAY' | 'PAUSE' | 'SEEK';
    position: number;
    senderName: string;
    timestamp: number;
  } | null;
}

export const AdaptivePlayer: React.FC<AdaptivePlayerProps> = ({
  src,
  poster,
  title,
  initialTime = 0,
  isPartyMode = false,
  partnerName,
  onPlay,
  onPause,
  onSeek,
  onTimeUpdate,
  onBuffering,
  onEnded,
  syncCommand,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [partnerNotice, setPartnerNotice] = useState<string | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(initialTime > 15);

  const controlsTimeoutRef = useRef<any>(null);
  const isInternalActionRef = useRef<boolean>(true);

  // Initialize HLS.js or native playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels: QualityLevel[] = data.levels.map((lvl, index) => ({
          id: index,
          height: lvl.height,
          bitrate: lvl.bitrate,
          name: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`,
        }));
        setQualities(levels);

        if (initialTime > 0 && !showResumePrompt) {
          video.currentTime = initialTime;
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        // level switched
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple HLS (Safari)
      video.src = src;
      if (initialTime > 0 && !showResumePrompt) {
        video.currentTime = initialTime;
      }
    }
  }, [src]);

  // Handle Partner Sync Commands
  useEffect(() => {
    if (!syncCommand || !videoRef.current) return;

    const video = videoRef.current;
    const { action, position, senderName } = syncCommand;

    // Notice toast
    setPartnerNotice(`${senderName} ${action === 'PLAY' ? 'played' : action === 'PAUSE' ? 'paused' : `sought to ${formatTime(position)}`}`);
    const timeout = setTimeout(() => setPartnerNotice(null), 3000);

    isInternalActionRef.current = false;

    if (action === 'PLAY') {
      const drift = Math.abs(video.currentTime - position);
      if (drift > 1.5) {
        video.currentTime = position;
      }
      video.play().catch(() => {});
      setIsPlaying(true);
    } else if (action === 'PAUSE') {
      video.pause();
      video.currentTime = position;
      setIsPlaying(false);
    } else if (action === 'SEEK') {
      video.currentTime = position;
    }

    setTimeout(() => {
      isInternalActionRef.current = true;
    }, 400);

    return () => clearTimeout(timeout);
  }, [syncCommand]);

  // Player Event Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      onTimeUpdate?.(video.currentTime, video.duration || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (isInternalActionRef.current) {
        onPlay?.(video.currentTime);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (isInternalActionRef.current) {
        onPause?.(video.currentTime);
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
      onBuffering?.(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
      onBuffering?.(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onPlay, onPause, onTimeUpdate, onBuffering, onEnded]);

  // Controls auto-hide
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setIsSettingsOpen(false);
      }, 3500);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const target = parseFloat(e.target.value);
    video.currentTime = target;
    setCurrentTime(target);
    if (isInternalActionRef.current) {
      onSeek?.(target);
    }
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    video.currentTime = target;
    setCurrentTime(target);
    if (isInternalActionRef.current) {
      onSeek?.(target);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    videoRef.current.muted = newMute;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleQualityChange = (levelIndex: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
    setCurrentQuality(levelIndex);
    setIsSettingsOpen(false);
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setIsSettingsOpen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl group select-none flex items-center justify-center"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none z-20">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin shadow-lg" />
        </div>
      )}

      {/* Partner Action Toast Notice */}
      {partnerNotice && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 bg-slate-900/90 border border-brand-500/50 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold text-white shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{partnerNotice}</span>
        </div>
      )}

      {/* Resume Playback Prompt */}
      {showResumePrompt && (
        <div className="absolute top-6 right-6 z-30 bg-slate-900/95 border border-slate-700/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl max-w-xs animate-in slide-in-from-top-4">
          <p className="text-xs font-semibold text-white mb-2">
            Resume watching from {formatTime(initialTime)}?
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = initialTime;
                  videoRef.current.play();
                }
                setShowResumePrompt(false);
              }}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Resume
            </button>
            <button
              onClick={() => setShowResumePrompt(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              From Start
            </button>
          </div>
        </div>
      )}

      {/* Big Center Play/Pause button on Hover if paused */}
      {!isPlaying && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-brand-600/90 hover:bg-brand-500 text-white flex items-center justify-center shadow-2xl shadow-brand-500/40 transform hover:scale-110 transition-all z-10"
        >
          <Play className="w-10 h-10 fill-white ml-1.5" />
        </button>
      )}

      {/* Control Bar Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 sm:p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Bar */}
        <div className="relative flex items-center mb-3 group/scrub">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700/60 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:h-2.5 transition-all"
          />
        </div>

        {/* HUD Controls */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Left Controls: Play/Pause, Skips, Volume, Timestamp */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-brand-400 transition-colors p-1.5 rounded-lg hover:bg-white/10"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
            </button>

            <button
              onClick={() => handleSkip(-10)}
              className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 hidden sm:block"
              title="Rewind 10s"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 hidden sm:block"
              title="Forward 10s"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-brand-500 hidden group-hover/vol:block transition-all"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-xs font-semibold text-slate-300 tracking-wide font-mono">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-slate-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Settings Popover (Quality / Speed), Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3 relative">
            
            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isSettingsOpen ? 'bg-white/20 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Playback Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Settings Popover */}
              {isSettingsOpen && (
                <div className="absolute right-0 bottom-12 w-48 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="mb-3">
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 px-2">Quality (HLS)</p>
                    <button
                      onClick={() => handleQualityChange(-1)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 ${
                        currentQuality === -1 ? 'text-brand-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span>Auto (Adaptive)</span>
                      {currentQuality === -1 && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {qualities.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleQualityChange(q.id)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 ${
                          currentQuality === q.id ? 'text-brand-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <span>{q.name}</span>
                        {currentQuality === q.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 px-2">Speed</p>
                    <div className="grid grid-cols-4 gap-1 px-1">
                      {[0.75, 1, 1.25, 1.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`py-1 rounded text-center font-medium ${
                            playbackSpeed === speed ? 'bg-brand-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-slate-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
