import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import {
  ChatMessage,
  PlaybackSyncMessage,
  PresenceMessage,
  TypingMessage,
  WebRtcSignalMessage,
} from '../types';

interface WebSocketContextType {
  connected: boolean;
  subscribeToSync: (roomCode: string, callback: (msg: PlaybackSyncMessage) => void) => () => void;
  sendSync: (roomCode: string, msg: PlaybackSyncMessage) => void;
  subscribeToWebRtc: (roomCode: string, callback: (msg: WebRtcSignalMessage) => void) => () => void;
  sendWebRtc: (roomCode: string, msg: WebRtcSignalMessage) => void;
  subscribeToChat: (roomCode: string, callback: (msg: ChatMessage) => void) => () => void;
  sendChat: (roomCode: string, msg: ChatMessage) => void;
  subscribeToPresence: (roomCode: string, callback: (msg: PresenceMessage) => void) => () => void;
  sendPresence: (roomCode: string, msg: PresenceMessage) => void;
  subscribeToTyping: (roomCode: string, callback: (msg: TypingMessage) => void) => () => void;
  sendTyping: (roomCode: string, msg: TypingMessage) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState<boolean>(false);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setConnected(false);
      }
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP Error:', frame.headers['message'], frame.body);
      },
      onWebSocketError: (event) => {
        console.warn('WebSocket connection error:', event);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [isAuthenticated, token]);

  const subscribeToSync = (roomCode: string, callback: (msg: PlaybackSyncMessage) => void) => {
    if (!stompClientRef.current || !connected) return () => {};
    const sub: StompSubscription = stompClientRef.current.subscribe(
      `/topic/room/${roomCode}/sync`,
      (message: IMessage) => {
        try {
          const payload: PlaybackSyncMessage = JSON.parse(message.body);
          callback(payload);
        } catch (e) {
          console.error('Error parsing sync payload', e);
        }
      }
    );
    return () => sub.unsubscribe();
  };

  const sendSync = (roomCode: string, msg: PlaybackSyncMessage) => {
    if (stompClientRef.current && connected) {
      stompClientRef.current.publish({
        destination: `/app/room/${roomCode}/sync`,
        body: JSON.stringify(msg),
      });
    }
  };

  const subscribeToWebRtc = (roomCode: string, callback: (msg: WebRtcSignalMessage) => void) => {
    if (!stompClientRef.current || !connected) return () => {};
    const sub: StompSubscription = stompClientRef.current.subscribe(
      `/topic/room/${roomCode}/webrtc`,
      (message: IMessage) => {
        try {
          const payload: WebRtcSignalMessage = JSON.parse(message.body);
          callback(payload);
        } catch (e) {
          console.error('Error parsing WebRTC signal payload', e);
        }
      }
    );
    return () => sub.unsubscribe();
  };

  const sendWebRtc = (roomCode: string, msg: WebRtcSignalMessage) => {
    if (stompClientRef.current && connected) {
      stompClientRef.current.publish({
        destination: `/app/room/${roomCode}/webrtc`,
        body: JSON.stringify(msg),
      });
    }
  };

  const subscribeToChat = (roomCode: string, callback: (msg: ChatMessage) => void) => {
    if (!stompClientRef.current || !connected) return () => {};
    const sub: StompSubscription = stompClientRef.current.subscribe(
      `/topic/room/${roomCode}/chat`,
      (message: IMessage) => {
        try {
          const payload: ChatMessage = JSON.parse(message.body);
          callback(payload);
        } catch (e) {
          console.error('Error parsing chat payload', e);
        }
      }
    );
    return () => sub.unsubscribe();
  };

  const sendChat = (roomCode: string, msg: ChatMessage) => {
    if (stompClientRef.current && connected) {
      stompClientRef.current.publish({
        destination: `/app/room/${roomCode}/chat`,
        body: JSON.stringify(msg),
      });
    }
  };

  const subscribeToPresence = (roomCode: string, callback: (msg: PresenceMessage) => void) => {
    if (!stompClientRef.current || !connected) return () => {};
    const sub: StompSubscription = stompClientRef.current.subscribe(
      `/topic/room/${roomCode}/presence`,
      (message: IMessage) => {
        try {
          const payload: PresenceMessage = JSON.parse(message.body);
          callback(payload);
        } catch (e) {
          console.error('Error parsing presence payload', e);
        }
      }
    );
    return () => sub.unsubscribe();
  };

  const sendPresence = (roomCode: string, msg: PresenceMessage) => {
    if (stompClientRef.current && connected) {
      stompClientRef.current.publish({
        destination: `/app/room/${roomCode}/presence`,
        body: JSON.stringify(msg),
      });
    }
  };

  const subscribeToTyping = (roomCode: string, callback: (msg: TypingMessage) => void) => {
    if (!stompClientRef.current || !connected) return () => {};
    const sub: StompSubscription = stompClientRef.current.subscribe(
      `/topic/room/${roomCode}/typing`,
      (message: IMessage) => {
        try {
          const payload: TypingMessage = JSON.parse(message.body);
          callback(payload);
        } catch (e) {
          console.error('Error parsing typing payload', e);
        }
      }
    );
    return () => sub.unsubscribe();
  };

  const sendTyping = (roomCode: string, msg: TypingMessage) => {
    if (stompClientRef.current && connected) {
      stompClientRef.current.publish({
        destination: `/app/room/${roomCode}/typing`,
        body: JSON.stringify(msg),
      });
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        subscribeToSync,
        sendSync,
        subscribeToWebRtc,
        sendWebRtc,
        subscribeToChat,
        sendChat,
        subscribeToPresence,
        sendPresence,
        subscribeToTyping,
        sendTyping,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
