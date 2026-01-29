'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatConversation } from '../types/chat.types';
import { chatApi } from '../api/chat-api';
import logger from '../../../lib/utils/logger';

/**
 * Simplified Chat Store
 *
 * This store is responsible for:
 * - Fetching initial conversations from API (historical data)
 * - Tracking unread count for persistence
 *
 * Real-time messaging is handled by useChatHub hook which:
 * - Manages SignalR connection and events
 * - Handles online users, typing indicators
 * - Manages real-time private/room messages
 *
 * The messaging page merges API conversations with SignalR real-time
 * data using useMemo for a unified view.
 */
interface ChatState {
  // State
  conversations: ChatConversation[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  updateConversation: (userId: string, updates: Partial<ChatConversation>) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: (count?: number) => void;
  clearError: () => void;
}

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      // Initial state
      conversations: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      // Actions
      fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
          const conversations = await chatApi.getConversations();
          set({ conversations, isLoading: false });
        } catch (error) {
          logger.error('Failed to fetch conversations:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch conversations',
            isLoading: false,
          });
        }
      },

      updateConversation: (userId: string, updates: Partial<ChatConversation>) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.userId === userId ? { ...conv, ...updates } : conv
          ),
        }));
      },

      setUnreadCount: (count: number) => {
        set({ unreadCount: count });
      },

      incrementUnreadCount: () => {
        set((state) => ({ unreadCount: state.unreadCount + 1 }));
      },

      decrementUnreadCount: (count = 1) => {
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - count) }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        // Only persist unread count
        unreadCount: state.unreadCount,
      }),
    }
  )
);
