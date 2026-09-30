import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Copy, Check, Radio, Sparkles, Heart, AlertCircle, Volume2 } from 'lucide-react';
import { WatchRoom, PlaybackSyncMessage, PresenceMessage } from '../types';
import { roomService } from '../services/roomService';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { AdaptivePlayer } from '../components/video/AdaptivePlayer';
import { LiveChatPanel } from '../components/room/LiveChatPanel';

export const WatchRoomPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    isConnected,
    subscribeToSync,
    subscribeToPresence,
    sendSync,
    sendPresence
  } = useWebSocket();

  const [room, setRoom] = useState<WatchRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partnerPresence, setPartnerPresence] = useState<'JOINED' | 'LEFT' | 'BUFFERING' | 'READY'>('JOINED');
  const [syncCommand, setSyncCommand] = useState<{
    action: 'PLAY' | 'PAUSE' | 'SEEK';
    position: number;
    senderName: string;
    timestamp: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Load Room Details
  useEffect(() => {
    if (!code) return;

    roomService.getRoom(code)
      .then((roomData) => {
        setRoom(roomData);
        setLoading(false);
      })
      .catch((err) => {
        setError('Watch room not found or expired.');
        setLoading(false);
      });
  }, [code]);

  // Subscribe to Sync & Presence Events
  useEffect(() => {
    if (!code || !isConnected) return;

    // Send joined presence
    sendPresence(code, { status: 'JOINED' });

    const unsubscribeSync = subscribeToSync(code, (syncMsg: PlaybackSyncMessage) => {
      // Ignore my own messages
      if (syncMsg.senderId === user?.id) return;

      if (syncMsg.action === 'PLAY' || syncMsg.action === 'PAUSE' || syncMsg.action === 'SEEK') {
        setSyncCommand({
          action: syncMsg.action,
          position: syncMsg.currentPosition,
          senderName: syncMsg.senderName,
          timestamp: syncMsg.serverTimestamp || Date.now()
        });
      }
    });

    const unsubscribePresence = subscribeToPresence(code, (presenceMsg: PresenceMessage) => {
      if (presenceMsg.userId !== user?.id) {
        setPartnerPresence(presenceMsg.status);
      }
    });

    return () => {
      sendPresence(code, { status: 'LEFT' });
      unsubscribeSync();
      unsubscribePresence();
    };
  }, [code, isConnected, user?.id]);

  // Handlers for local player actions -> broadcast to partner over STOMP
  const handleLocalPlay = useCallback((currentTime: number) => {
    if (!code) return;
    sendSync(code, {
      roomCode: code,
      senderId: user?.id || 0,
      senderName: user?.username || 'Partner',
      action: 'PLAY',
      currentPosition: currentTime,
      clientTimestamp: Date.now()
    });
  }, [code, user, sendSync]);

  const handleLocalPause = useCallback((currentTime: number) => {
    if (!code) return;
    sendSync(code, {
      roomCode: code,
      senderId: user?.id || 0,
      senderName: user?.username || 'Partner',
      action: 'PAUSE',
      currentPosition: currentTime,
      clientTimestamp: Date.now()
    });
  }, [code, user, sendSync]);

  const handleLocalSeek = useCallback((currentTime: number) => {
    if (!code) return;
    sendSync(code, {
      roomCode: code,
      senderId: user?.id || 0,
      senderName: user?.username || 'Partner',
      action: 'SEEK',
      currentPosition: currentTime,
      clientTimestamp: Date.now()
    });
  }, [code, user, sendSync]);

  const handleLocalBuffering = useCallback((isBuffering: boolean) => {
    if (!code) return;
    sendPresence(code, { status: isBuffering ? 'BUFFERING' : 'READY' });
  }, [code, sendPresence]);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Entering Watch Party Room...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Room Error</h2>
        <p className="text-slate-400 text-sm mb-6">{error || 'Watch Party room not found.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-500 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  const partnerName = room.partner?.username || user?.partner?.username || 'Partner';

  return (
    <div className="min-h-screen px-4 lg:px-8 max-w-7xl mx-auto py-6">
      
      {/* Watch Party Room Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-slate-900/70 border border-slate-800 p-4 sm:p-5 rounded-3xl backdrop-blur-md">
        
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Users className="w-6 h-6 text-pink-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white">{room.title}</h1>
              <span className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">Streaming: <span className="text-brand-300 font-semibold">{room.video.title}</span></p>
          </div>
        </div>

        {/* Room Link & Presence Status */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Partner Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-full text-xs font-semibold text-slate-300">
            <span className={`w-2 h-2 rounded-full ${
              partnerPresence === 'JOINED' || partnerPresence === 'READY'
                ? 'bg-emerald-400 animate-pulse'
                : partnerPresence === 'BUFFERING'
                ? 'bg-amber-400 animate-spin'
                : 'bg-slate-500'
            }`} />
            <span>
              {partnerPresence === 'BUFFERING'
                ? `${partnerName} buffering...`
                : `${partnerName} in room`}
            </span>
          </div>

          {/* Copy Room Link */}
          <button
            onClick={copyRoomLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white rounded-full transition-all"
            title="Copy Watch Party URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-brand-400" />}
            <span>{copied ? 'Copied!' : room.roomCode}</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Cinema Player (2/3) + Chat Panel (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[640px]">
        
        {/* Synchronized Player Viewport */}
        <div className="lg:col-span-2 h-full flex flex-col justify-between">
          <AdaptivePlayer
            src={room.video.hlsMasterUrl || ''}
            poster={room.video.thumbnailUrl}
            title={room.video.title}
            initialTime={room.currentPositionSeconds || 0}
            isPartyMode={true}
            partnerName={partnerName}
            onPlay={handleLocalPlay}
            onPause={handleLocalPause}
            onSeek={handleLocalSeek}
            onBuffering={handleLocalBuffering}
            syncCommand={syncCommand}
          />
          
          <div className="mt-3 p-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Real-time frame sync enabled. Any action taken here instantly reflects on your partner's player.</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">Drift &lt; 0.5s</div>
          </div>
        </div>

        {/* Live Chat Panel */}
        <div className="lg:col-span-1 h-[520px] lg:h-full">
          <LiveChatPanel roomCode={room.roomCode} partnerName={partnerName} />
        </div>

      </div>

    </div>
  );
};
