/**
 * Chat persistence manager for Watch Party
 * Handles persistent chat history, message storage, and synchronization
 */

// Define interfaces here to avoid circular imports
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  reactions: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
  replyTo?: string;
  attachments?: Array<{
    type: 'image' | 'file';
    name: string;
    url: string;
    size: number;
  }>;
  isSystem?: boolean;
}

export interface TypingUser {
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface ChatHistory {
  roomId: string;
  messages: ChatMessage[];
  lastSyncTime: Date;
  totalMessages: number;
  participants: string[];
}

export interface ChatExport {
  roomId: string;
  roomName?: string;
  exportDate: Date;
  messages: Array<{
    id: string;
    userName: string;
    content: string;
    timestamp: string;
    reactions: Array<{ emoji: string; userName: string }>;
    attachments?: Array<{ name: string; type: string; size: number }>;
  }>;
}

class ChatPersistenceManager {
  private storageKey = 'watchparty-chat-history';
  private maxMessagesPerRoom = 1000;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    this.setupEventListeners();
    this.startSyncMonitoring();
  }

  /**
   * Setup event listeners for online/offline status
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncWithServer();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Start periodic sync monitoring
   */
  private startSyncMonitoring(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncWithServer();
      }
    }, 30000); // Sync every 30 seconds
  }

  /**
   * Save messages to local storage
   */
  async saveMessages(roomId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const history = this.getChatHistory(roomId);
      const updatedHistory: ChatHistory = {
        roomId,
        messages: messages.slice(-this.maxMessagesPerRoom), // Keep only last N messages
        lastSyncTime: new Date(),
        totalMessages: messages.length,
        participants: this.extractParticipants(messages)
      };

      // Update local storage
      const allHistory = this.getAllChatHistory();
      allHistory[roomId] = updatedHistory;
      localStorage.setItem(this.storageKey, JSON.stringify(allHistory));

      // Sync with server if online
      if (this.isOnline) {
        await this.syncWithServer();
      }

      console.log(`Saved ${messages.length} messages for room ${roomId}`);
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  /**
   * Get chat history for a room
   */
  getChatHistory(roomId: string): ChatHistory {
    try {
      const allHistory = this.getAllChatHistory();
      return allHistory[roomId] || {
        roomId,
        messages: [],
        lastSyncTime: new Date(),
        totalMessages: 0,
        participants: []
      };
    } catch (error) {
      console.error('Error getting chat history:', error);
      return {
        roomId,
        messages: [],
        lastSyncTime: new Date(),
        totalMessages: 0,
        participants: []
      };
    }
  }

  /**
   * Get all chat history
   */
  getAllChatHistory(): Record<string, ChatHistory> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting all chat history:', error);
      return {};
    }
  }

  /**
   * Add a new message
   */
  async addMessage(roomId: string, message: ChatMessage): Promise<void> {
    try {
      const history = this.getChatHistory(roomId);
      history.messages.push(message);
      history.totalMessages++;
      history.lastSyncTime = new Date();
      history.participants = this.extractParticipants(history.messages);

      await this.saveMessages(roomId, history.messages);
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }

  /**
   * Update a message (for reactions, edits, etc.)
   */
  async updateMessage(roomId: string, messageId: string, updates: Partial<ChatMessage>): Promise<void> {
    try {
      const history = this.getChatHistory(roomId);
      const messageIndex = history.messages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex !== -1) {
        history.messages[messageIndex] = { ...history.messages[messageIndex], ...updates };
        await this.saveMessages(roomId, history.messages);
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    try {
      const history = this.getChatHistory(roomId);
      history.messages = history.messages.filter(msg => msg.id !== messageId);
      history.totalMessages = history.messages.length;
      await this.saveMessages(roomId, history.messages);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  /**
   * Add reaction to a message
   */
  async addReaction(roomId: string, messageId: string, reaction: { emoji: string; userId: string; userName: string }): Promise<void> {
    try {
      const history = this.getChatHistory(roomId);
      const message = history.messages.find(msg => msg.id === messageId);
      
      if (message) {
        // Remove existing reaction from the same user
        message.reactions = message.reactions.filter(r => r.userId !== reaction.userId);
        // Add new reaction
        message.reactions.push(reaction);
        
        await this.saveMessages(roomId, history.messages);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }

  /**
   * Search messages
   */
  searchMessages(roomId: string, query: string): ChatMessage[] {
    try {
      const history = this.getChatHistory(roomId);
      const lowercaseQuery = query.toLowerCase();
      
      return history.messages.filter(msg => 
        msg.content.toLowerCase().includes(lowercaseQuery) ||
        msg.userName.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Get messages by date range
   */
  getMessagesByDateRange(roomId: string, startDate: Date, endDate: Date): ChatMessage[] {
    try {
      const history = this.getChatHistory(roomId);
      
      return history.messages.filter(msg => 
        msg.timestamp >= startDate && msg.timestamp <= endDate
      );
    } catch (error) {
      console.error('Error getting messages by date range:', error);
      return [];
    }
  }

  /**
   * Export chat history
   */
  exportChatHistory(roomId: string, roomName?: string): ChatExport {
    try {
      const history = this.getChatHistory(roomId);
      
      return {
        roomId,
        roomName,
        exportDate: new Date(),
        messages: history.messages.map(msg => ({
          id: msg.id,
          userName: msg.userName,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          reactions: msg.reactions.map(r => ({
            emoji: r.emoji,
            userName: r.userName
          })),
          attachments: msg.attachments?.map(att => ({
            name: att.name,
            type: att.type,
            size: att.size
          }))
        }))
      };
    } catch (error) {
      console.error('Error exporting chat history:', error);
      return {
        roomId,
        roomName,
        exportDate: new Date(),
        messages: []
      };
    }
  }

  /**
   * Download chat history as JSON file
   */
  downloadChatHistory(roomId: string, roomName?: string): void {
    try {
      const exportData = this.exportChatHistory(roomId, roomName);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-history-${roomId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading chat history:', error);
    }
  }

  /**
   * Get chat statistics
   */
  getChatStatistics(roomId: string): {
    totalMessages: number;
    totalReactions: number;
    mostActiveUser: string;
    averageMessagesPerUser: number;
    dateRange: { start: Date | null; end: Date | null };
  } {
    try {
      const history = this.getChatHistory(roomId);
      const messages = history.messages;
      
      if (messages.length === 0) {
        return {
          totalMessages: 0,
          totalReactions: 0,
          mostActiveUser: '',
          averageMessagesPerUser: 0,
          dateRange: { start: null, end: null }
        };
      }

      const userMessageCounts = messages.reduce((acc, msg) => {
        acc[msg.userId] = (acc[msg.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostActiveUserId = Object.entries(userMessageCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

      const mostActiveUser = messages.find(msg => msg.userId === mostActiveUserId)?.userName || '';

      const totalReactions = messages.reduce((total, msg) => total + msg.reactions.length, 0);

      const timestamps = messages.map(msg => msg.timestamp.getTime());
      const dateRange = {
        start: new Date(Math.min(...timestamps)),
        end: new Date(Math.max(...timestamps))
      };

      return {
        totalMessages: messages.length,
        totalReactions,
        mostActiveUser,
        averageMessagesPerUser: messages.length / history.participants.length,
        dateRange
      };
    } catch (error) {
      console.error('Error getting chat statistics:', error);
      return {
        totalMessages: 0,
        totalReactions: 0,
        mostActiveUser: '',
        averageMessagesPerUser: 0,
        dateRange: { start: null, end: null }
      };
    }
  }

  /**
   * Clear chat history for a room
   */
  async clearChatHistory(roomId: string): Promise<void> {
    try {
      const allHistory = this.getAllChatHistory();
      delete allHistory[roomId];
      localStorage.setItem(this.storageKey, JSON.stringify(allHistory));
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  /**
   * Clear all chat history
   */
  async clearAllChatHistory(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing all chat history:', error);
    }
  }

  /**
   * Extract unique participants from messages
   */
  private extractParticipants(messages: ChatMessage[]): string[] {
    return [...new Set(messages.map(msg => msg.userId))];
  }

  /**
   * Sync with server (placeholder for actual implementation)
   */
  private async syncWithServer(): Promise<void> {
    // This would sync with the backend server
    // For now, just log the action
    console.log('Syncing chat history with server...');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export default ChatPersistenceManager;
