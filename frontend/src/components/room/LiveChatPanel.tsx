import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Smile, Sparkles } from 'lucide-react';
import { ChatMessage, TypingMessage, User } from '../../types';
import { useWebSocket } from '../../context/WebSocketContext';
import { roomService } from '../../services/roomService';

interface LiveChatPanelProps {
  roomCode: string;
  currentUser: User;
}

const QUICK_REACTIONS = ['🍿', '❤️', '😂', '😱', '🔥', '👏', '🎬'];

export const LiveChatPanel: React.FC<LiveChatPanelProps> = ({ roomCode, currentUser }) => {
  const { connected, subscribeToChat, sendChat, subscribeToTyping, sendTyping } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Load chat history from REST API
  useEffect(() => {
    if (!roomCode) return;
    roomService.getChatHistory(roomCode, 50).then((history) => {
      setMessages(history);
      scrollToBottom();
    }).catch((err) => {
      console.warn('Failed to load chat history:', err);
    });
  }, [roomCode]);

  // Subscribe to real-time chat via WebSocket
  useEffect(() => {
    if (!connected || !roomCode) return;

    const unsubscribeChat = subscribeToChat(roomCode, (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    const unsubscribeTyping = subscribeToTyping(roomCode, (msg: TypingMessage) => {
      if (msg.userId === currentUser.id) return;

      if (msg.isTyping) {
        setTypingUsers((prev) => ({ ...prev, [msg.userId]: msg.username }));
      } else {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[msg.userId];
          return updated;
        });
      }
    });

    return () => {
      unsubscribeChat();
      unsubscribeTyping();
    };
  }, [connected, currentUser.id, roomCode, subscribeToChat, subscribeToTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (contentToSend?: string) => {
    const text = contentToSend || inputMessage;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      roomCode,
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderAvatar: currentUser.avatarUrl,
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Send via REST / WebSocket
    roomService.sendChatMessage(roomCode, text.trim()).catch(() => {
      sendChat(roomCode, newMsg);
    });

    if (!contentToSend) {
      setInputMessage('');
    }

    // Stop typing indicator
    sendTyping(roomCode, {
      roomCode,
      userId: currentUser.id,
      username: currentUser.username,
      isTyping: false,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // Send typing ping
    sendTyping(roomCode, {
      roomCode,
      userId: currentUser.id,
      username: currentUser.username,
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(roomCode, {
        roomCode,
        userId: currentUser.id,
        username: currentUser.username,
        isTyping: false,
      });
    }, 2000);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const typingNames = Object.values(typingUsers);

  return (
    <div className="flex flex-col h-full bg-cinema-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-cinema-surface/60">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pink-500 to-brand-500 flex items-center justify-center text-white">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight">Live Cinema Chat</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Room: {roomCode}</span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 py-8">
            <Sparkles className="w-8 h-8 text-slate-600" />
            <p className="text-xs">No messages yet. Say hi to start the party!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <img
                  src={msg.senderAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderName}`}
                  alt={msg.senderName}
                  className="w-7 h-7 rounded-full border border-white/10 bg-slate-800 object-cover shrink-0"
                />
                <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">{isMe ? 'You' : msg.senderName}</span>
                    <span>•</span>
                    <span>{formatTime(msg.timestamp)}</span>
                  </div>
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words ${
                      isMe
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingNames.length > 0 && (
        <div className="px-4 py-1.5 text-[11px] text-brand-300 italic flex items-center space-x-1.5 bg-brand-950/30 border-t border-brand-500/10 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
          <span>{typingNames.join(', ')} is typing...</span>
        </div>
      )}

      {/* Quick Reaction Bar */}
      <div className="px-3 py-1.5 bg-black/30 border-t border-white/5 flex items-center space-x-1 overflow-x-auto">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSendMessage(emoji)}
            className="px-2 py-1 text-sm rounded-lg hover:bg-white/10 transition-colors transform hover:scale-125 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-white/10 bg-cinema-surface/80 flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Send a live comment..."
          value={inputMessage}
          onChange={handleInputChange}
          className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="p-2 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white shadow-glow-brand disabled:opacity-40 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default LiveChatPanel;
