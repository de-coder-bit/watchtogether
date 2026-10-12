import React from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  PhoneCall,
  Sparkles,
  Users,
  LayoutGrid,
} from 'lucide-react';
import { WebRtcCallState } from '../../hooks/useWebRtcCall';
import VideoCallTile from './VideoCallTile';
import { User, Partner } from '../../types';

interface VideoCallPanelProps {
  callState: WebRtcCallState;
  currentUser: User;
  partnerUser?: User | Partner | null;
  layoutMode: 'pip' | 'sidebar' | 'grid';
  onLayoutChange: (mode: 'pip' | 'sidebar' | 'grid') => void;
}

export const VideoCallPanel: React.FC<VideoCallPanelProps> = ({
  callState,
  currentUser,
  partnerUser,
  layoutMode,
  onLayoutChange,
}) => {
  const {
    isInCall,
    isMicOn,
    isCamOn,
    isRemoteMicOn,
    isRemoteCamOn,
    isLocalSpeaking,
    isRemoteSpeaking,
    connectionState,
    localStream,
    remoteStream,
    startCall,
    endCall,
    toggleMic,
    toggleCam,
  } = callState;

  const partnerName = partnerUser?.username || 'Partner';
  const partnerAvatar = partnerUser?.avatarUrl;

  return (
    <div className="flex flex-col h-full bg-cinema-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-cinema-surface/60">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white">
            <VideoIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight">Face-to-Face Video Call</span>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-2">
          {isInCall ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{connectionState === 'connected' ? 'Live HD' : 'Connecting...'}</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">Ready</span>
          )}
        </div>
      </div>

      {/* Video Streams Grid */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-center">
        {!isInCall ? (
          /* Pre-Call State */
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shadow-glow-brand">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Watch Face-to-Face</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Turn on your camera and mic to laugh, react and chat like you're on the couch together.
              </p>
            </div>
            <button
              onClick={startCall}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center space-x-2 active:scale-95 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Start Video Call</span>
            </button>
          </div>
        ) : (
          /* Active Call Streams */
          <div className="grid grid-cols-1 gap-3 w-full">
            {/* Remote Partner Feed */}
            <VideoCallTile
              stream={remoteStream}
              username={partnerName}
              avatarUrl={partnerAvatar}
              isLocal={false}
              isMicOn={isRemoteMicOn}
              isCamOn={isRemoteCamOn}
              isSpeaking={isRemoteSpeaking}
            />

            {/* Local Feed */}
            <VideoCallTile
              stream={localStream}
              username={currentUser.username}
              avatarUrl={currentUser.avatarUrl}
              isLocal={true}
              isMicOn={isMicOn}
              isCamOn={isCamOn}
              isSpeaking={isLocalSpeaking}
            />
          </div>
        )}
      </div>

      {/* Call Toolbar Controls (Google Meet Style) */}
      {isInCall && (
        <div className="p-3 border-t border-white/10 bg-cinema-surface/80 flex items-center justify-center space-x-3">
          {/* Mic Toggle */}
          <button
            onClick={toggleMic}
            className={`p-2.5 rounded-xl transition-all shadow-md ${
              isMicOn
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-red-500/80 hover:bg-red-500 text-white'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={toggleCam}
            className={`p-2.5 rounded-xl transition-all shadow-md ${
              isCamOn
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-red-500/80 hover:bg-red-500 text-white'
            }`}
            title={isCamOn ? 'Turn off Camera' : 'Turn on Camera'}
          >
            {isCamOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
            title="Leave Video Call"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCallPanel;
