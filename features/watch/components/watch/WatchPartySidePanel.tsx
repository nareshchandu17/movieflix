"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Activity, LoaderCircle, MessageSquare, Send, Smile, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  userName: string;
  userId: string;
  message: string;
  timestamp: number;
  avatarUrl?: string;
  type?: "text" | "system";
  delivery?: "sending" | "failed";
}

interface Participant {
  userName: string;
  userId: string;
  socketId: string;
  status: string;
  isHost: boolean;
  avatarUrl?: string;
}

interface WatchPartySidePanelProps {
  messages: ChatMessage[];
  participants: Participant[];
  currentUser: { id: string; name: string; avatarUrl?: string };
  onSendMessage: (msg: string) => Promise<void> | void;
  onRetryMessage: (messageId: string) => Promise<void> | void;
  onLoadOlderMessages: () => Promise<void> | void;
  onTypingChange: (isTyping: boolean) => Promise<void> | void;
  hasOlderMessages: boolean;
  isLoadingHistory: boolean;
  typingUsers: string[];
  connectionError?: string | null;
  isConnected: boolean;
}

const EMOJI_OPTIONS = ["😀", "😂", "😍", "🥳", "👏", "❤️", "🍿", "🎬", "🔥", "👍"];

function Avatar({ name, src, size = "md" }: { name: string; src?: string; size?: "sm" | "md" }) {
  const dimension = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <div className={`${dimension} shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center text-xs font-semibold text-white/80`}>
      {src ? (
        <Image src={src} alt="" width={36} height={36} unoptimized className="h-full w-full object-cover" />
      ) : (
        (name.trim()[0] || "?").toUpperCase()
      )}
    </div>
  );
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(timestamp);
}

export const WatchPartySidePanel = ({
  messages,
  participants,
  currentUser,
  onSendMessage,
  onRetryMessage,
  onLoadOlderMessages,
  onTypingChange,
  hasOlderMessages,
  isLoadingHistory,
  typingUsers,
  connectionError,
  isConnected,
}: WatchPartySidePanelProps) => {
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | "activity">("chat");
  const [chatInput, setChatInput] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [newMessagesBelow, setNewMessagesBelow] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrolledToBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    chatEndRef.current?.scrollIntoView({ behavior });
    isScrolledToBottomRef.current = true;
    setNewMessagesBelow(false);
  }, []);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 50;
    isScrolledToBottomRef.current = isBottom;
    if (isBottom) setNewMessagesBelow(false);
    if (container.scrollTop < 40 && hasOlderMessages && !isLoadingHistory) {
      void onLoadOlderMessages();
    }
  };

  useEffect(() => {
    if (activeTab === "chat" && isScrolledToBottomRef.current) scrollToBottom();
    else if (activeTab === "chat") setNewMessagesBelow(true);
  }, [messages, activeTab, scrollToBottom]);

  useEffect(() => () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    void onTypingChange(false);
  }, [onTypingChange]);

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const message = chatInput.trim();
    if (!message || !isConnected) return;
    setChatInput("");
    setEmojiPickerOpen(false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    void onTypingChange(false);
    isScrolledToBottomRef.current = true;
    try {
      await onSendMessage(message);
      scrollToBottom();
    } catch {
      // The failed optimistic message remains visible with its retry action.
    }
  };

  const handleInputChange = (value: string) => {
    setChatInput(value);
    void onTypingChange(Boolean(value.trim()));
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (value.trim()) {
      typingTimer.current = setTimeout(() => void onTypingChange(false), 1200);
    }
  };

  const tabs = [
    { id: "chat", label: "Chat", icon: <MessageSquare size={15} /> },
    { id: "participants", label: "Participants", icon: <Users size={15} /> },
    { id: "activity", label: "Activity", icon: <Activity size={15} /> },
  ] as const;
  const activityMessages = messages.filter((message) => message.type === "system");

  return (
    <div className="flex h-full w-full flex-col bg-[#0A0A0A]">
      <div className="flex shrink-0 items-center gap-5 overflow-x-auto border-b border-white/5 px-5 pt-5 sm:px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`relative flex items-center gap-2 whitespace-nowrap pb-4 text-xs font-bold transition-colors ${
              activeTab === tab.id ? "text-red-400" : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "participants" && (
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">{participants.length}</span>
            )}
            {activeTab === tab.id && (
              <motion.span layoutId="side-tab-underline" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-red-500" />
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pb-4 text-[11px] text-zinc-500">
          <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-zinc-600"}`} />
          {isConnected ? "Live" : "Offline"}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {connectionError && (
              <div role="alert" className="border-b border-amber-500/20 bg-amber-500/5 px-5 py-2 text-xs text-amber-200">
                {connectionError}
              </div>
            )}
            <div ref={chatContainerRef} onScroll={handleScroll} className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <div className="mb-3 text-center">
                {isLoadingHistory ? (
                  <LoaderCircle className="mx-auto h-4 w-4 animate-spin text-zinc-500" />
                ) : hasOlderMessages ? (
                  <button
                    type="button"
                    onClick={() => void onLoadOlderMessages()}
                    className="text-[11px] text-zinc-500 hover:text-white"
                  >
                    Load older messages
                  </button>
                ) : messages.length > 0 ? (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">Start of conversation</span>
                ) : null}
              </div>
              <div className="space-y-3">
                {messages.map((message, index) => {
                  if (message.type === "system") {
                    return (
                      <div key={message.id} className="py-1 text-center">
                        <span className="inline-flex max-w-[90%] items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-[11px] text-zinc-400">
                          <Activity size={12} className="text-red-400" />
                          {message.message}
                          <time>{formatTime(message.timestamp)}</time>
                        </span>
                      </div>
                    );
                  }
                  const ownMessage = message.userId === currentUser.id;
                  const previous = messages[index - 1];
                  const grouped = previous?.type !== "system" && previous?.userId === message.userId;
                  return (
                    <div key={message.id} className={`flex items-end gap-2 ${ownMessage ? "justify-end" : "justify-start"} ${grouped ? "mt-1" : "mt-3"}`}>
                      {!ownMessage && (
                        <div className="w-8 shrink-0">{!grouped && <Avatar name={message.userName} src={message.avatarUrl} size="sm" />}</div>
                      )}
                      <div className={`flex max-w-[82%] flex-col ${ownMessage ? "items-end" : "items-start"}`}>
                        {!ownMessage && !grouped && <span className="mb-1 px-1 text-[11px] font-medium text-zinc-400">{message.userName}</span>}
                        <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                          ownMessage
                            ? "rounded-br-md bg-red-700 text-white"
                            : "rounded-bl-md border border-white/5 bg-zinc-900 text-zinc-100"
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{message.message}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-2 px-1 text-[10px] text-zinc-500">
                          <time>{formatTime(message.timestamp)}</time>
                          {message.delivery === "sending" && <span>Sending…</span>}
                          {message.delivery === "failed" && (
                            <>
                              <span className="text-red-300">Not delivered</span>
                              <button type="button" onClick={() => void onRetryMessage(message.id)} className="font-semibold text-red-300 hover:text-red-200">
                                Retry
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {ownMessage && (
                        <div className="w-8 shrink-0">
                          {!grouped && <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="sm" />}
                        </div>
                      )}
                    </div>
                  );
                })}
                {!messages.length && !isLoadingHistory && (
                  <div className="flex h-40 flex-col items-center justify-center text-center">
                    <MessageSquare className="mb-3 h-7 w-7 text-zinc-700" />
                    <p className="text-sm font-medium text-zinc-300">No messages yet</p>
                    <p className="mt-1 text-xs text-zinc-500">Say hello to everyone in the room.</p>
                  </div>
                )}
                {typingUsers.length > 0 && (
                  <p className="px-2 pt-1 text-xs text-zinc-500">
                    {typingUsers.slice(0, 2).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing…
                  </p>
                )}
                <div ref={chatEndRef} />
              </div>
              {newMessagesBelow && (
                <button
                  type="button"
                  onClick={() => scrollToBottom()}
                  className="sticky bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-red-500/30 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-red-200 shadow-lg"
                >
                  New messages ↓
                </button>
              )}
            </div>

            <form onSubmit={handleSend} className="relative shrink-0 border-t border-white/5 p-3 sm:p-4">
              {emojiPickerOpen && (
                <div className="absolute bottom-full left-4 z-10 mb-2 grid grid-cols-5 gap-1 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-xl">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Insert ${emoji}`}
                      onClick={() => handleInputChange(`${chatInput}${emoji}`)}
                      className="rounded-lg p-2 text-lg hover:bg-white/10"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-zinc-900 px-3 py-2 focus-within:border-red-500/50">
                <button
                  type="button"
                  onClick={() => setEmojiPickerOpen((open) => !open)}
                  aria-label="Open emoji picker"
                  className="mb-1 rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  <Smile size={19} />
                </button>
                <textarea
                  value={chatInput}
                  maxLength={2000}
                  onChange={(event) => handleInputChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder={isConnected ? "Message the room…" : "Reconnecting to the room…"}
                  disabled={!isConnected}
                  rows={1}
                  className="max-h-28 min-h-10 flex-1 resize-y bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || !isConnected}
                  aria-label="Send message"
                  className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="mt-1.5 px-2 text-[10px] text-zinc-600">Enter to send · Shift+Enter for a new line</p>
            </form>
          </motion.div>
        )}

        {activeTab === "participants" && (
          <motion.div key="participants" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-4">
            {!participants.length ? (
              <p className="py-10 text-center text-sm text-zinc-500">No participants are in this room.</p>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.userId} className="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-900/50 p-3">
                    <Avatar name={participant.userName} src={participant.avatarUrl} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {participant.userName}{participant.userId === currentUser.id ? " (you)" : ""}
                      </p>
                      <p className={`mt-0.5 text-[10px] uppercase tracking-wider ${
                        participant.status === "online" ? "text-emerald-400" : "text-zinc-500"
                      }`}>{participant.status}</p>
                    </div>
                    {participant.isHost && <span className="rounded bg-red-600 px-2 py-1 text-[9px] font-bold text-white">HOST</span>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-4">
            {!activityMessages.length ? (
              <p className="py-10 text-center text-sm text-zinc-500">Room activity will appear here.</p>
            ) : (
              <div className="space-y-3">
                {activityMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                    <Activity size={15} className="mt-0.5 shrink-0 text-red-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200">{message.message}</p>
                      <time className="mt-1 block text-[10px] text-zinc-500">{formatTime(message.timestamp)}</time>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
