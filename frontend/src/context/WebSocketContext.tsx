import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { PlaybackSyncMessage, ChatMessage, PresenceMessage, TypingMessage } from '../types';

interface WebSocketContextType {
  isConnected: boolean;
  subscribeToSync: (roomCode: string, onMessage: (msg: PlaybackSyncMessage) => void) => () => void;
  subscribeToChat: (roomCode: string, onMessage: (msg: ChatMessage) => void) => () => void;
  subscribeToPresence: (roomCode: string, onMessage: (msg: PresenceMessage) => void) => () => void;
  subscribeToTyping: (roomCode: string, onMessage: (msg: TypingMessage) => void) => () => void;
  sendSync: (roomCode: string, msg: PlaybackSyncMessage) => void;
  sendChat: (roomCode: string, msg: Partial<ChatMessage>) => void;
  sendPresence: (roomCode: string, msg: Partial<PresenceMessage>) => void;
  sendTyping: (roomCode: string, msg: Partial<TypingMessage>) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_BASE_URL || (window.location.origin.replace('http', 'ws') + '/ws');
    const httpFallbackUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/ws` : '/ws';

    const client = new Client({
      webSocketFactory: () => new SockJS(httpFallbackUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: () => {}, // silence debug logs in production
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP Error:', frame.headers['message']);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [token]);

  const subscribeToSync = (roomCode: string, onMessage: (msg: PlaybackSyncMessage) => void) => {
    if (!clientRef.current) return () => {};
    const sub = clientRef.current.subscribe(`/topic/room/${roomCode}/sync`, (message: IMessage) => {
      try {
        const payload: PlaybackSyncMessage = JSON.parse(message.body);
        onMessage(payload);
      } catch (e) {
        console.error('Error parsing sync message:', e);
      }
    });
    return () => sub.unsubscribe();
  };

  const subscribeToChat = (roomCode: string, onMessage: (msg: ChatMessage) => void) => {
    if (!clientRef.current) return () => {};
    const sub = clientRef.current.subscribe(`/topic/room/${roomCode}/chat`, (message: IMessage) => {
      try {
        const payload: ChatMessage = JSON.parse(message.body);
        onMessage(payload);
      } catch (e) {
        console.error('Error parsing chat message:', e);
      }
    });
    return () => sub.unsubscribe();
  };

  const subscribeToPresence = (roomCode: string, onMessage: (msg: PresenceMessage) => void) => {
    if (!clientRef.current) return () => {};
    const sub = clientRef.current.subscribe(`/topic/room/${roomCode}/presence`, (message: IMessage) => {
      try {
        const payload: PresenceMessage = JSON.parse(message.body);
        onMessage(payload);
      } catch (e) {
        console.error('Error parsing presence message:', e);
      }
    });
    return () => sub.unsubscribe();
  };

  const subscribeToTyping = (roomCode: string, onMessage: (msg: TypingMessage) => void) => {
    if (!clientRef.current) return () => {};
    const sub = clientRef.current.subscribe(`/topic/room/${roomCode}/typing`, (message: IMessage) => {
      try {
        const payload: TypingMessage = JSON.parse(message.body);
        onMessage(payload);
      } catch (e) {
        console.error('Error parsing typing message:', e);
      }
    });
    return () => sub.unsubscribe();
  };

  const sendSync = (roomCode: string, msg: PlaybackSyncMessage) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomCode}/sync`,
        body: JSON.stringify({
          ...msg,
          senderId: user?.id,
          senderName: user?.username,
          clientTimestamp: Date.now()
        })
      });
    }
  };

  const sendChat = (roomCode: string, msg: Partial<ChatMessage>) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomCode}/chat`,
        body: JSON.stringify({
          roomCode,
          senderId: user?.id,
          senderName: user?.username,
          senderAvatar: user?.avatarUrl,
          content: msg.content,
          timestamp: new Date().toISOString()
        })
      });
    }
  };

  const sendPresence = (roomCode: string, msg: Partial<PresenceMessage>) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomCode}/presence`,
        body: JSON.stringify({
          roomCode,
          userId: user?.id,
          username: user?.username,
          avatarUrl: user?.avatarUrl,
          status: msg.status || 'JOINED',
          timestamp: Date.now()
        })
      });
    }
  };

  const sendTyping = (roomCode: string, msg: Partial<TypingMessage>) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomCode}/typing`,
        body: JSON.stringify({
          roomCode,
          userId: user?.id,
          username: user?.username,
          isTyping: msg.isTyping
        })
      });
    }
  };

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      subscribeToSync,
      subscribeToChat,
      subscribeToPresence,
      subscribeToTyping,
      sendSync,
      sendChat,
      sendPresence,
      sendTyping
    }}>
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
