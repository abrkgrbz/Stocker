'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ChatConversation, ChatUser, ChatRoom, TypingInfo, signalRToChatMessage } from '../types/chat.types';
import { chatApi } from '../api/chat-api';
import logger from '../../../lib/utils/logger';

interface ChatState {
  // State
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  messages: ChatMessage[];
  onlineUsers: ChatUser[];
  rooms: ChatRoom[];
  typingUsers: TypingInfo[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchRoomMessages: (roomName: string, skip?: number, take?: number) => Promise<void>;
  fetchPrivateMessages: (userId: string, skip?: number, take?: number) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  addSignalRMessage: (message: any) => void;
  setCurrentConversation: (conversation: ChatConversation | null) => void;
  setOnlineUsers: (users: ChatUser[]) => void;
  addOnlineUser: (user: ChatUser) => void;
  removeOnlineUser: (userId: string) => void;
  setRooms: (rooms: ChatRoom[]) => void;
  setTypingUsers: (users: TypingInfo[]) => void;
  addTypingUser: (user: TypingInfo) => void;
  removeTypingUser: (userId: string) => void;
  setUnreadCount: (count: number) => void;
  markMessagesAsRead: (messageIds: string[]) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      currentConversation: null,
      messages: [],
      onlineUsers: [],
      rooms: [],
      typingUsers: [],
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

      fetchRoomMessages: async (roomName: string, skip = 0, take = 50) => {
        set({ isLoading: true, error: null });
        try {
          const messages = await chatApi.getRoomMessages(roomName, skip, take);
          set({ messages, isLoading: false });
        } catch (error) {
          logger.error('Failed to fetch room messages:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch messages',
            isLoading: false,
          });
        }
      },

      fetchPrivateMessages: async (userId: string, skip = 0, take = 50) => {
        set({ isLoading: true, error: null });
        try {
          const messages = await chatApi.getPrivateMessages(userId, skip, take);
          set({ messages, isLoading: false });
        } catch (error) {
          logger.error('Failed to fetch private messages:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch messages',
            isLoading: false,
          });
        }
      },

      addMessage: (message: ChatMessage) => {
        set((state) => ({
          messages: [...state.messages, message],
          conversations: state.conversations.map((conv) => {
            // Update last message for matching conversation
            if (
              (message.isPrivate && (conv.userId === message.senderId || conv.userId === message.recipientId)) ||
              (!message.isPrivate && conv.roomName === message.roomName)
            ) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: message.isRead ? conv.unreadCount : conv.unreadCount + 1,
              };
            }
            return conv;
          }),
        }));
      },

      addSignalRMessage: (signalRMessage: any) => {
        const message = signalRToChatMessage(signalRMessage);
        get().addMessage(message);
      },

      setCurrentConversation: (conversation: ChatConversation | null) => {
        set({ currentConversation: conversation, messages: [] });
      },

      setOnlineUsers: (users: ChatUser[]) => {
        set({ onlineUsers: users });
      },

      addOnlineUser: (user: ChatUser) => {
        set((state) => {
          if (state.onlineUsers.some((u) => u.userId === user.userId)) {
            return state;
          }
          return { onlineUsers: [...state.onlineUsers, user] };
        });
      },

      removeOnlineUser: (userId: string) => {
        set((state) => ({
          onlineUsers: state.onlineUsers.filter((u) => u.userId !== userId),
        }));
      },

      setRooms: (rooms: ChatRoom[]) => {
        set({ rooms });
      },

      setTypingUsers: (users: TypingInfo[]) => {
        set({ typingUsers: users });
      },

      addTypingUser: (user: TypingInfo) => {
        set((state) => {
          if (state.typingUsers.some((u) => u.userId === user.userId)) {
            return state;
          }
          return { typingUsers: [...state.typingUsers, user] };
        });
      },

      removeTypingUser: (userId: string) => {
        set((state) => ({
          typingUsers: state.typingUsers.filter((u) => u.userId !== userId),
        }));
      },

      setUnreadCount: (count: number) => {
        set({ unreadCount: count });
      },

      markMessagesAsRead: async (messageIds: string[]) => {
        try {
          await chatApi.markAsRead(messageIds);
          set((state) => ({
            messages: state.messages.map((m) =>
              messageIds.includes(m.id) ? { ...m, isRead: true, readAt: new Date().toISOString() } : m
            ),
            unreadCount: Math.max(0, state.unreadCount - messageIds.length),
          }));
        } catch (error) {
          logger.error('Failed to mark messages as read:', error);
        }
      },

      clearMessages: () => {
        set({ messages: [] });
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

// Hook for chat with SignalR integration
export function useChatWithSignalR() {
  const store = useChat();
  // This hook can be extended to integrate with useChatHub from signalr
  return store;
}
