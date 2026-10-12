import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { watchlistService } from '../services/watchlistService';
import { WatchRoom, PlaybackAction, PlaybackSyncMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useWebRtcCall } from '../hooks/useWebRtcCall';
import AdaptivePlayer from '../components/AdaptivePlayer';
import VideoCallPanel from '../components/room/VideoCallPanel';
import LiveChatPanel from '../components/room/LiveChatPanel';
import {
  Share2,
  Check,
  Film,
  Users,
  MessageSquare,
  Video as VideoIcon,
  Sparkles,
  ArrowLeft,
  LayoutGrid,
} from 'lucide-react';

export const WatchRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connected, subscribeToSync, sendSync, subscribeToPresence, sendPresence } = useWebSocket();

  const [room, setRoom] = useState<WatchRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<'sidebar' | 'pip' | 'grid'>('sidebar');
  const [activeTab, setActiveTab] = useState<'both' | 'call' | 'chat'>('both');

  const progressIntervalRef = useRef<any>(null);
  const lastSyncTimestampRef = useRef<number>(0);

  // Initialize WebRTC Call Hook
  const callState = useWebRtcCall(roomCode || '');

  // Load Watch Room State
  useEffect(() => {
    if (!roomCode) return;
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const data = await roomService.getRoom(roomCode);
        setRoom(data);
        setIsPlaying(data.isPlaying);
      } catch (err) {
        console.error('Failed to load room:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomCode]);

  // Subscribe to Playback Sync Actions from Partner
  useEffect(() => {
    if (!connected || !roomCode || !user) return;

    const unsubscribe = subscribeToSync(roomCode, (msg: PlaybackSyncMessage) => {
      if (msg.senderId === user.id) return; // ignore own broadcast

      lastSyncTimestampRef.current = Date.now();

      if (msg.action === 'PLAY') {
        setIsPlaying(true);
        showSyncToast(`${msg.senderName} resumed playback`);
      } else if (msg.action === 'PAUSE') {
        setIsPlaying(false);
        showSyncToast(`${msg.senderName} paused playback`);
      } else if (msg.action === 'SEEK') {
        const mins = Math.floor(msg.currentPosition / 60);
        const secs = Math.floor(msg.currentPosition % 60);
        showSyncToast(`${msg.senderName} jumped to ${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [connected, roomCode, subscribeToSync, user]);

  const showSyncToast = (text: string) => {
    setSyncToast(text);
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handlePlaybackAction = useCallback(
    (action: PlaybackAction, position: number, rate = 1.0) => {
      if (!roomCode || !user) return;

      if (action === 'PLAY') setIsPlaying(true);
      if (action === 'PAUSE') setIsPlaying(false);

      sendSync(roomCode, {
        roomCode,
        senderId: user.id,
        senderName: user.username,
        action,
        currentPosition: position,
        playbackRate: rate,
        clientTimestamp: Date.now(),
      });
    },
    [roomCode, sendSync, user]
  );

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      // Periodically save watch progress
      if (!room?.video?.id || !user) return;

      if (!progressIntervalRef.current) {
        progressIntervalRef.current = setTimeout(() => {
          watchlistService.saveProgress({
            videoId: room.video.id,
            progressSeconds: currentTime,
            completed: duration > 0 && currentTime / duration > 0.92,
          }).catch(() => {});
          progressIntervalRef.current = null;
        }, 8000);
      }
    },
    [room?.video?.id, user]
  );

  const handleCopyInvite = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Joining Watch Party & Initializing Call...</p>
      </div>
    );
  }

  if (!room || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white">Room not found</h2>
        <button
          onClick={() => navigate('/browse')}
          className="mt-4 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-xs"
        >
          Back to Browse
        </button>
      </div>
    );
  }

  const partnerUser = room.host.id === user.id ? room.partner || user.partner : room.host;
  const videoStreamUrl = room.video.hlsMasterUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-300">
      
      {/* Top Room Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl glass-panel text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                LIVE PARTY
              </span>
              <h1 className="text-lg md:text-xl font-black text-white tracking-tight truncate max-w-[350px] md:max-w-xl">
                {room.video.title}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Room Code: <span className="font-mono font-bold text-slate-200">{room.roomCode}</span> • Synchronized with {partnerUser?.username || 'Partner'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Copy Invite Link */}
          <button
            onClick={handleCopyInvite}
            className="px-4 py-2 rounded-xl glass-panel hover:bg-white/15 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all shadow-sm"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-brand-400" />}
            <span>{copiedLink ? 'Link Copied!' : 'Invite Partner'}</span>
          </button>

          {/* Quick Tab Switcher on mobile */}
          <div className="flex xl:hidden bg-cinema-card rounded-xl p-1 border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1 rounded-lg font-medium ${activeTab === 'both' ? 'bg-brand-500 text-white' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('call')}
              className={`px-3 py-1 rounded-lg font-medium ${activeTab === 'call' ? 'bg-brand-500 text-white' : 'text-slate-400'}`}
            >
              Call
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-lg font-medium ${activeTab === 'chat' ? 'bg-brand-500 text-white' : 'text-slate-400'}`}
            >
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main Room Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Cinema Video Player (Left Col) */}
        <div className="xl:col-span-8 space-y-4">
          <AdaptivePlayer
            src={videoStreamUrl}
            poster={room.video.thumbnailUrl}
            initialTime={room.currentPositionSeconds}
            isPlaying={isPlaying}
            syncNotification={syncToast}
            audioDuckingMultiplier={callState.audioDuckingMultiplier}
            onPlaybackAction={handlePlaybackAction}
            onTimeUpdate={handleTimeUpdate}
            isHostOrPartner={true}
          />

          {/* Video Quick Details Under Player */}
          <div className="p-5 rounded-2xl glass-panel space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">{room.video.title}</h2>
              <span className="text-xs text-brand-400 font-semibold">{room.video.genres || 'Cinema'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {room.video.description || 'Enjoy streaming in sync with your partner while on real-time face-to-face video call.'}
            </p>
          </div>
        </div>

        {/* Interactive Side Panel: Google Meet Video Call + Live Chat (Right Col) */}
        <div className="xl:col-span-4 space-y-4 h-[720px] flex flex-col">
          {/* Top Half: Video Call (Google Meet Style) */}
          {(activeTab === 'both' || activeTab === 'call') && (
            <div className="h-[340px] flex-shrink-0">
              <VideoCallPanel
                callState={callState}
                currentUser={user}
                partnerUser={partnerUser}
                layoutMode={layoutMode}
                onLayoutChange={setLayoutMode}
              />
            </div>
          )}

          {/* Bottom Half: Live Synced Chat */}
          {(activeTab === 'both' || activeTab === 'chat') && (
            <div className="flex-1 min-h-[340px]">
              <LiveChatPanel
                roomCode={room.roomCode}
                currentUser={user}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchRoomPage;
