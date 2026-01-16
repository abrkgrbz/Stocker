import { apiClient } from '@/lib/api';
import { ChatMessage, ChatConversation, SendMessageDto } from '../types/chat.types';

const CHAT_BASE_URL = '/api/tenant/chat';

export const chatApi = {
  /**
   * Get room messages
   */
  getRoomMessages: async (roomName: string, skip = 0, take = 50): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(
      `${CHAT_BASE_URL}/rooms/${encodeURIComponent(roomName)}/messages`,
      { skip, take }
    );
    return response.data || [];
  },

  /**
   * Get private messages with a user
   */
  getPrivateMessages: async (userId: string, skip = 0, take = 50): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(
      `${CHAT_BASE_URL}/private/${userId}/messages`,
      { skip, take }
    );
    return response.data || [];
  },

  /**
   * Get all conversations
   */
  getConversations: async (): Promise<ChatConversation[]> => {
    const response = await apiClient.get<ChatConversation[]>(`${CHAT_BASE_URL}/conversations`);
    return response.data || [];
  },

  /**
   * Send a message (room or private)
   */
  sendMessage: async (dto: SendMessageDto): Promise<ChatMessage | null> => {
    const response = await apiClient.post<ChatMessage>(`${CHAT_BASE_URL}/messages`, dto);
    return response.data || null;
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (messageIds: string[]): Promise<number> => {
    const response = await apiClient.put<number>(`${CHAT_BASE_URL}/messages/read`, { messageIds });
    return response.data || 0;
  },
};
