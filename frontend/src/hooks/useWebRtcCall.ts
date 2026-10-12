import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import { WebRtcSignalMessage } from '../types';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export interface WebRtcCallState {
  isInCall: boolean;
  isMicOn: boolean;
  isCamOn: boolean;
  isRemoteMicOn: boolean;
  isRemoteCamOn: boolean;
  isLocalSpeaking: boolean;
  isRemoteSpeaking: boolean;
  connectionState: 'idle' | 'connecting' | 'connected' | 'failed' | 'disconnected';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMic: () => void;
  toggleCam: () => void;
  audioDuckingMultiplier: number; // 0.35 when partner speaks, 1.0 normally
}

export function useWebRtcCall(roomCode: string): WebRtcCallState {
  const { user } = useAuth();
  const { connected, subscribeToWebRtc, sendWebRtc } = useWebSocket();

  const [isInCall, setIsInCall] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isCamOn, setIsCamOn] = useState<boolean>(true);
  const [isRemoteMicOn, setIsRemoteMicOn] = useState<boolean>(true);
  const [isRemoteCamOn, setIsRemoteCamOn] = useState<boolean>(true);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState<boolean>(false);
  const [isRemoteSpeaking, setIsRemoteSpeaking] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'failed' | 'disconnected'>('idle');

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const localAudioContextRef = useRef<AudioContext | null>(null);
  const remoteAudioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Setup Audio Analyser for Speaking Pulse Detection & Audio Ducking
  const setupAudioAnalyser = useCallback((stream: MediaStream, isLocal: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      if (isLocal) {
        localAudioContextRef.current = audioCtx;
      } else {
        remoteAudioContextRef.current = audioCtx;
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const isSpeaking = average > 18; // threshold

        if (isLocal) {
          setIsLocalSpeaking(isSpeaking);
        } else {
          setIsRemoteSpeaking(isSpeaking);
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Web Audio API analyser setup error:', e);
    }
  }, []);

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (localAudioContextRef.current) {
      localAudioContextRef.current.close().catch(() => {});
      localAudioContextRef.current = null;
    }
    if (remoteAudioContextRef.current) {
      remoteAudioContextRef.current.close().catch(() => {});
      remoteAudioContextRef.current = null;
    }
    setIsLocalSpeaking(false);
    setIsRemoteSpeaking(false);
  };

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && user) {
        sendWebRtc(roomCode, {
          roomCode,
          senderId: user.id,
          senderName: user.username,
          type: 'ICE_CANDIDATE',
          data: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setConnectionState('connected');
      } else if (pc.connectionState === 'failed') {
        setConnectionState('failed');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
        setConnectionState('disconnected');
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
        setupAudioAnalyser(stream, false);
      }
    };

    // Add local tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [roomCode, sendWebRtc, setupAudioAnalyser, user]);

  const startCall = async () => {
    try {
      setConnectionState('connecting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsInCall(true);
      setupAudioAnalyser(stream, true);

      const pc = createPeerConnection();

      // Create WebRTC Offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      if (user) {
        sendWebRtc(roomCode, {
          roomCode,
          senderId: user.id,
          senderName: user.username,
          type: 'OFFER',
          data: offer,
        });
      }
    } catch (err) {
      console.error('Error starting video call:', err);
      setConnectionState('failed');
    }
  };

  const endCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    remoteStreamRef.current = null;
    setRemoteStream(null);
    cleanupAudio();
    setIsInCall(false);
    setConnectionState('idle');

    if (user) {
      sendWebRtc(roomCode, {
        roomCode,
        senderId: user.id,
        senderName: user.username,
        type: 'LEAVE_CALL',
        data: null,
      });
    }
  }, [roomCode, sendWebRtc, user]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        if (user) {
          sendWebRtc(roomCode, {
            roomCode,
            senderId: user.id,
            senderName: user.username,
            type: 'CALL_STATE',
            data: { isMicOn: audioTrack.enabled, isCamOn },
          });
        }
      }
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOn(videoTrack.enabled);
        if (user) {
          sendWebRtc(roomCode, {
            roomCode,
            senderId: user.id,
            senderName: user.username,
            type: 'CALL_STATE',
            data: { isMicOn, isCamOn: videoTrack.enabled },
          });
        }
      }
    }
  };

  // Handle incoming WebRTC signaling packets
  useEffect(() => {
    if (!connected || !roomCode || !user) return;

    const unsubscribe = subscribeToWebRtc(roomCode, async (msg: WebRtcSignalMessage) => {
      if (msg.senderId === user.id) return; // ignore own signals

      try {
        if (msg.type === 'OFFER') {
          // If receiving offer, become answerer
          let pc = peerConnectionRef.current;
          if (!pc) {
            // Get local stream if not already active
            if (!localStreamRef.current) {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 } },
                audio: { echoCancellation: true, noiseSuppression: true },
              });
              localStreamRef.current = stream;
              setLocalStream(stream);
              setIsInCall(true);
              setupAudioAnalyser(stream, true);
            }
            pc = createPeerConnection();
          }

          await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          sendWebRtc(roomCode, {
            roomCode,
            senderId: user.id,
            senderName: user.username,
            type: 'ANSWER',
            data: answer,
          });
        } else if (msg.type === 'ANSWER') {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(msg.data));
          }
        } else if (msg.type === 'ICE_CANDIDATE') {
          if (peerConnectionRef.current && msg.data) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(msg.data));
          }
        } else if (msg.type === 'CALL_STATE') {
          if (msg.data?.isMicOn !== undefined) setIsRemoteMicOn(msg.data.isMicOn);
          if (msg.data?.isCamOn !== undefined) setIsRemoteCamOn(msg.data.isCamOn);
        } else if (msg.type === 'LEAVE_CALL') {
          remoteStreamRef.current = null;
          setRemoteStream(null);
          setConnectionState('disconnected');
        }
      } catch (err) {
        console.error('Error processing WebRTC signal:', err);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [connected, createPeerConnection, roomCode, sendWebRtc, setupAudioAnalyser, user]);

  // Clean up tracks on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  const audioDuckingMultiplier = isRemoteSpeaking ? 0.35 : 1.0;

  return {
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
    audioDuckingMultiplier,
  };
}
