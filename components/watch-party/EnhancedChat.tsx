"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Send, 
  Smile, 
  Users, 
  Clock, 
  ThumbsUp, 
  Heart, 
  Laugh, 
  AlertCircle,
  Paperclip,
  MoreVertical,
  User,
  Settings,
  Search,
  Download,
  Trash2
} from "lucide-react";
import { ChatMessage, TypingUser } from "@/lib/chatPersistence";

interface EnhancedChatProps {
  roomId: string;
  currentUserId: string;
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  onSendMessage: (message: string, replyTo?: string) => void;
  onSendReaction: (messageId: string, emoji: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onFileUpload: (file: File) => void;
  onDeleteMessage: (messageId: string) => void;
  onExportChat: () => void;
  className?: string;
}

export default function EnhancedChat({
  roomId,
  currentUserId,
  messages,
  typingUsers,
  onSendMessage,
  onSendReaction,
  onTypingStart,
  onTypingStop,
  onFileUpload,
  onDeleteMessage,
  onExportChat,
  className = ""
}: EnhancedChatProps) {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const emojis = [
    { emoji: "😀", name: "Grinning" },
    { emoji: "😂", name: "Laughing" },
    { emoji: "❤️", name: "Heart" },
    { emoji: "👍", name: "Thumbs Up" },
    { emoji: "👎", name: "Thumbs Down" },
    { emoji: "😮", name: "Wow" },
    { emoji: "😢", name: "Sad" },
    { emoji: "😡", name: "Angry" },
    { emoji: "🎉", name: "Party" },
    { emoji: "🔥", name: "Fire" },
    { emoji: "💯", name: "100" },
    { emoji: "🚀", name: "Rocket" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim()) {
      onTypingStart();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop();
      }, 1000);
    } else {
      onTypingStop();
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), replyTo || undefined);
      setMessage("");
      setReplyTo(null);
      onTypingStop();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    onSendReaction(messageId, emoji);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.userName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const getTypingUsersText = () => {
    if (typingUsers.length === 0) return "";
    if (typingUsers.length === 1) return `${typingUsers[0].userName} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    return `${typingUsers.length} people are typing...`;
  };

  const MessageReactions = ({ messageId, reactions }: { messageId: string; reactions: any[] }) => {
    const groupedReactions = reactions.reduce((acc, reaction) => {
      const existing = acc.find(r => r.emoji === reaction.emoji);
      if (existing) {
        existing.count++;
        existing.users.push(reaction.userName);
      } else {
        acc.push({
          emoji: reaction.emoji,
          count: 1,
          users: [reaction.userName]
        });
      }
      return acc;
    }, [] as Array<{ emoji: string; count: number; users: string[] }>);

    if (groupedReactions.length === 0) return null;

    return (
      <div className="flex gap-1 mt-2">
        {groupedReactions.map((reaction, index) => (
          <button
            key={index}
            onClick={() => handleReaction(messageId, reaction.emoji)}
            className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs transition-colors"
            title={reaction.users.join(", ")}
          >
            <span>{reaction.emoji}</span>
            <span className="text-gray-300">{reaction.count}</span>
          </button>
        ))}
      </div>
    );
  };

  const MessageItem = ({ message }: { message: ChatMessage }) => {
    const isOwn = message.userId === currentUserId;
    const isReply = message.replyTo && messages.find(m => m.id === message.replyTo);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 mb-4 ${isOwn ? "flex-row-reverse" : ""}`}
        onMouseEnter={() => setSelectedMessage(message.id)}
        onMouseLeave={() => setSelectedMessage(null)}
      >
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            {message.userAvatar ? (
              <img src={message.userAvatar} alt={message.userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-gray-300" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-md ${isOwn ? "text-right" : ""}`}>
          {/* User Name & Timestamp */}
          <div className={`flex items-center gap-2 mb-1 text-xs ${isOwn ? "justify-end" : ""}`}>
            <span className="font-medium text-gray-300">{message.userName}</span>
            <span className="text-gray-500">{formatTimestamp(message.timestamp)}</span>
          </div>

          {/* Reply To */}
          {isReply && (
            <div className="mb-2 p-2 bg-gray-800 rounded text-sm text-gray-400 border-l-2 border-blue-500">
              <div className="text-xs mb-1">Replying to {isReply.userName}</div>
              <div className="truncate">{isReply.content}</div>
            </div>
          )}

          {/* Message Bubble */}
          <div className={`inline-block p-3 rounded-lg ${
            message.isSystem 
              ? "bg-yellow-500/10 text-yellow-400 text-sm" 
              : isOwn 
                ? "bg-blue-600 text-white" 
                : "bg-gray-700 text-white"
          }`}>
            {message.content}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                  {attachment.type === 'image' ? (
                    <img src={attachment.url} alt={attachment.name} className="w-16 h-16 rounded object-cover" />
                  ) : (
                    <Paperclip className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{attachment.name}</div>
                    <div className="text-xs text-gray-400">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          <MessageReactions messageId={message.id} reactions={message.reactions} />

          {/* Message Actions */}
          <AnimatePresence>
            {selectedMessage === message.id && !message.isSystem && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`flex gap-1 mt-2 ${isOwn ? "justify-end" : ""}`}
              >
                {!isOwn && (
                  <button
                    onClick={() => setReplyTo(message.id)}
                    className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 text-xs"
                  >
                    Reply
                  </button>
                )}
                <button
                  onClick={() => setShowEmojis(true)}
                  className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 text-xs"
                >
                  <Smile className="w-3 h-3" />
                </button>
                {(isOwn || message.userId === currentUserId) && (
                  <button
                    onClick={() => onDeleteMessage(message.id)}
                    className="p-1 bg-red-600 hover:bg-red-500 rounded text-white text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`enhanced-chat bg-gray-900 rounded-lg flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-white font-medium">Chat</h3>
            <p className="text-xs text-gray-400">{messages.length} messages</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm w-48"
            />
          </div>
          
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicators */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 pb-2"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>{getTypingUsersText()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between p-2 bg-blue-500/10 border border-blue-500/30 rounded">
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400">Replying to:</span>
              <span className="text-sm text-white">
                {messages.find(m => m.id === replyTo)?.userName}
              </span>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-end gap-2">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 pr-12"
            />
            
            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-3 grid grid-cols-6 gap-2"
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji.emoji}
                      onClick={() => handleEmojiSelect(emoji.emoji)}
                      className="text-xl hover:bg-gray-700 rounded p-2 transition-colors"
                      title={emoji.name}
                    >
                      {emoji.emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Emoji Button */}
          <button
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-white transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-16 bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-64 z-10"
          >
            <div className="p-4">
              <h4 className="text-white font-medium mb-3">Chat Settings</h4>
              <div className="space-y-3">
                <button
                  onClick={onExportChat}
                  className="w-full flex items-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export Chat History
                </button>
                <div className="text-xs text-gray-400">
                  Chat history is automatically saved and synchronized across all participants.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
