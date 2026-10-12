import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { PlaybackAction } from '../types';

interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
  label: string;
}

interface AdaptivePlayerProps {
  src: string;
  poster?: string;
  initialTime?: number;
  isPlaying?: boolean;
  syncNotification?: string | null;
  audioDuckingMultiplier?: number; // 0.35 when partner speaks, 1.0 otherwise
  onPlaybackAction?: (action: PlaybackAction, position: number, rate?: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  isHostOrPartner?: boolean;
}

export const AdaptivePlayer: React.FC<AdaptivePlayerProps> = ({
  src,
  poster,
  initialTime = 0,
  isPlaying: externalIsPlaying,
  syncNotification,
  audioDuckingMultiplier = 1.0,
  onPlaybackAction,
  onTimeUpdate,
  isHostOrPartner = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [playing, setPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [muted, setMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1); // -1 = Auto
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Initialize HLS.js or native HLS (Safari)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels: QualityLevel[] = data.levels.map((lvl, index) => ({
          index,
          height: lvl.height,
          bitrate: lvl.bitrate,
          label: lvl.height ? `${lvl.height}p` : `Level ${index + 1}`,
        }));
        setQualities(levels);

        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
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
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
    }
  }, [src]);

  // Adjust volume with Audio Ducking (partner voice detection)
  useEffect(() => {
    if (videoRef.current) {
      const effectiveVolume = muted ? 0 : volume * audioDuckingMultiplier;
      videoRef.current.volume = Math.max(0, Math.min(1, effectiveVolume));
    }
  }, [volume, muted, audioDuckingMultiplier]);

  // Handle external play/pause sync from WebSocket
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (externalIsPlaying !== undefined) {
      if (externalIsPlaying && video.paused) {
        video.play().catch(() => {});
        setPlaying(true);
      } else if (!externalIsPlaying && !video.paused) {
        video.pause();
        setPlaying(false);
      }
    }
  }, [externalIsPlaying]);

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
      if (onPlaybackAction) onPlaybackAction('PLAY', video.currentTime, playbackRate);
    } else {
      video.pause();
      setPlaying(false);
      if (onPlaybackAction) onPlaybackAction('PAUSE', video.currentTime, playbackRate);
    }
  }, [onPlaybackAction, playbackRate]);

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
    if (onPlaybackAction) onPlaybackAction('SEEK', time, playbackRate);
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.max(0, Math.min(duration, video.currentTime + seconds));
    handleSeek(target);
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setSelectedQuality(levelIndex);
      setShowSettings(false);
    }
  };

  const handleSpeedChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
      if (onPlaybackAction) onPlaybackAction('RATE_CHANGE', videoRef.current.currentTime, rate);
    }
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

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip(10);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setMuted((prev) => !prev);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, duration]);

  // Controls hide timeout
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 3500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const h = Math.floor(m / 60);
    const displayM = m % 60;
    if (h > 0) {
      return `${h}:${displayM < 10 ? '0' : ''}${displayM}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${displayM}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group select-none"
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        onClick={handlePlayPause}
        onTimeUpdate={() => {
          if (videoRef.current) {
            const cur = videoRef.current.currentTime;
            const dur = videoRef.current.duration || 0;
            setCurrentTime(cur);
            setDuration(dur);
            if (onTimeUpdate) onTimeUpdate(cur, dur);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration || 0);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Sync Action Flash Toast */}
      {syncNotification && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-modal border border-brand-500/40 text-xs font-semibold text-white shadow-glow-brand flex items-center space-x-2 animate-in fade-in zoom-in duration-300 z-30">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>{syncNotification}</span>
        </div>
      )}

      {/* Audio Ducking Indicator */}
      {audioDuckingMultiplier < 1.0 && (
        <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 backdrop-blur-md flex items-center space-x-1.5 z-30 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Partner Speaking • Audio Ducked</span>
        </div>
      )}

      {/* Overlay Controls */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 flex flex-col justify-between p-4 md:p-6 transition-opacity duration-300 z-20 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Synchronized Stream</span>
          </div>
        </div>

        {/* Center Big Play Button (when paused) */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-brand-500/90 flex items-center justify-center text-white shadow-glow-brand pointer-events-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform" onClick={handlePlayPause}>
              <Play className="w-7 h-7 fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="space-y-3">
          
          {/* Progress Timeline Scrubber */}
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-lg appearance-none cursor-pointer transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-brand-400 transition-colors p-1"
              >
                {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              <button
                onClick={() => handleSkip(-10)}
                className="text-slate-300 hover:text-white transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="text-slate-300 hover:text-white transition-colors"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMuted((prev) => !prev)}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setMuted(false);
                  }}
                  className="w-16 md:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Time Display */}
              <div className="text-xs font-mono text-slate-300">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3 relative">
              {/* Settings / Quality Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings((prev) => !prev)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  title="Quality & Speed Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-10 right-0 w-52 rounded-2xl glass-modal p-3 text-xs shadow-2xl border border-white/10 z-40 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Stream Quality
                      </span>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleQualityChange(-1)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                            selectedQuality === -1 ? 'bg-brand-500 text-white' : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          Auto (Adaptive)
                        </button>
                        {qualities.map((q) => (
                          <button
                            key={q.index}
                            onClick={() => handleQualityChange(q.index)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                              selectedQuality === q.index ? 'bg-brand-500 text-white' : 'text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Playback Speed
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handleSpeedChange(rate)}
                            className={`py-1 rounded-lg text-center font-medium ${
                              playbackRate === rate ? 'bg-brand-500 text-white' : 'text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            {rate}x
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
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdaptivePlayer;
