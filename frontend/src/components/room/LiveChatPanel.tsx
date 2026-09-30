import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Sparkles, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { roomService } from '../../services/roomService';

interface LiveChatPanelProps {
  roomCode: string;
  partnerName?: string;
}

export const LiveChatPanel: React.FC<LiveChatPanelProps> = ({ roomCode, partnerName }) => {
  const { user } = useAuth();
  const { subscribeToChat, subscribeToTyping, sendChat, sendTyping } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Load initial room messages
  useEffect(() => {
    roomService.getRoomMessages(roomCode)
      .then((data) => setMessages(data))
      .catch((err) => console.error('Failed to load chat history:', err));
  }, [roomCode]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsubscribeChat = subscribeToChat(roomCode, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    const unsubscribeTyping = subscribeToTyping(roomCode, (typingMsg) => {
      if (typingMsg.userId !== user?.id) {
        setIsPartnerTyping(typingMsg.isTyping);
      }
    });

    return () => {
      unsubscribeChat();
      unsubscribeTyping();
    };
  }, [roomCode, user?.id]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const content = inputContent.trim();
    sendChat(roomCode, { content });
    sendTyping(roomCode, { isTyping: false });
    setInputContent('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputContent(e.target.value);
    sendTyping(roomCode, { isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(roomCode, { isTyping: false });
    }, 2000);
  };

  const sendQuickReaction = (emoji: string) => {
    sendChat(roomCode, { content: emoji });
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      
      {/* Panel Header */}
      <div className="px-5 py-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Party Chat</h3>
            <p className="text-[11px] text-slate-400">Synced live conversation</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
            <Sparkles className="w-8 h-8 text-brand-500/40 mb-2" />
            <p className="font-semibold text-slate-400">Welcome to the Watch Party!</p>
            <p className="mt-1">Send a message or reaction to start chatting with your partner.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <img
                  src={msg.senderAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderName}`}
                  alt={msg.senderName}
                  className="w-7 h-7 rounded-full object-cover bg-slate-800 shrink-0 mt-0.5"
                />
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-slate-400">{isMe ? 'You' : msg.senderName}</span>
                    <span className="text-[9px] text-slate-600">{formatTimestamp(msg.timestamp)}</span>
                  </div>
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Partner Typing Indicator */}
        {isPartnerTyping && (
          <div className="flex items-center gap-2 text-xs text-brand-400 italic px-2 py-1 bg-brand-950/30 rounded-full w-fit animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
            <span>{partnerName || 'Partner'} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Bar */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/40 flex items-center gap-2 overflow-x-auto">
        {['🍿 Popcorn', '❤️ Love it', '😂 Haha', '⏸️ Pause', '🔥 Peak'].map((reaction) => (
          <button
            key={reaction}
            onClick={() => sendQuickReaction(reaction)}
            className="text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
          >
            {reaction}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputContent}
          onChange={handleInputChange}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={!inputContent.trim()}
          className="p-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-brand-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
