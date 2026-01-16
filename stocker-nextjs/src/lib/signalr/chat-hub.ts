'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSignalRHub } from './use-signalr';
import { toast } from 'sonner';
import logger from '../utils/logger';

// Types
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  room?: string;
  isPrivate?: boolean;
  targetUserId?: string;
  timestamp: string;
}

export interface ChatUser {
  userId: string;
  userName: string;
  connectedAt: string;
}

export interface ChatRoom {
  key: string;
  userCount: number;
  createdAt: string;
}

export interface TypingInfo {
  userId: string;
  userName: string;
  roomName?: string;
}

export interface UseChatHubOptions {
  onMessage?: (message: ChatMessage) => void;
  onPrivateMessage?: (message: ChatMessage) => void;
  onUserJoined?: (data: { userId: string; userName: string; roomName: string }) => void;
  onUserLeft?: (data: { userId: string; userName: string; roomName: string }) => void;
  onUserOnline?: (data: { userId: string; userName: string }) => void;
  onUserOffline?: (data: { userId: string; userName: string }) => void;
  onTyping?: (info: TypingInfo) => void;
  onStopTyping?: (info: TypingInfo) => void;
  showToasts?: boolean;
}

export function useChatHub(options: UseChatHubOptions = {}) {
  const {
    onMessage,
    onPrivateMessage,
    onUserJoined,
    onUserLeft,
    onUserOnline,
    onUserOffline,
    onTyping,
    onStopTyping,
    showToasts = false,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Record<string, ChatMessage[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingInfo[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  // Ref to track which user's private messages we're loading
  const pendingPrivateMessageUserIdRef = useRef<string | null>(null);

  const events = useMemo(() => ({
    // Receive room message
    ReceiveMessage: (message: ChatMessage) => {
      logger.info('Chat message received', { metadata: { messageId: message.id } });
      setMessages((prev) => [...prev, message]);
      onMessage?.(message);

      if (showToasts && message.room !== currentRoom) {
        toast.info(`${message.userName}`, {
          description: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : ''),
        });
      }
    },

    // Receive private message
    ReceivePrivateMessage: (message: ChatMessage) => {
      logger.info('Private message received', { metadata: { messageId: message.id } });
      const otherUserId = message.userId;
      setPrivateMessages((prev) => ({
        ...prev,
        [otherUserId]: [...(prev[otherUserId] || []), message],
      }));
      onPrivateMessage?.(message);

      if (showToasts) {
        toast.info(`${message.userName} (Özel)`, {
          description: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : ''),
        });
      }
    },

    // Private message sent confirmation
    PrivateMessageSent: (message: ChatMessage) => {
      logger.info('Private message sent', { metadata: { targetUserId: message.targetUserId } });
      const targetUserId = message.targetUserId;
      if (targetUserId) {
        setPrivateMessages((prev) => ({
          ...prev,
          [targetUserId]: [...(prev[targetUserId] || []), message],
        }));
      }
    },

    // Message history for a room
    MessageHistory: (history: ChatMessage[]) => {
      logger.info(`Message history received: ${history.length} messages`);
      setMessages(history);
    },

    // Private message history
    PrivateMessageHistory: (history: ChatMessage[]) => {
      // Use the pending userId ref which was set when loadPrivateMessages was called
      const otherUserId = pendingPrivateMessageUserIdRef.current;
      logger.info(`Private message history received: ${history.length} messages for user ${otherUserId}`);

      if (otherUserId) {
        setPrivateMessages((prev) => ({
          ...prev,
          [otherUserId]: history,
        }));
        // Clear the pending ref after use
        pendingPrivateMessageUserIdRef.current = null;
      } else if (history.length > 0) {
        // Fallback: try to determine from message content
        // For private messages, one of userId or targetUserId is the other person
        logger.warn('No pending userId ref, attempting to determine from message content');
      }
    },

    // User joined room
    UserJoinedRoom: (data: { userId: string; userName: string; roomName: string }) => {
      logger.info(`User joined room: ${data.userName} -> ${data.roomName}`);
      onUserJoined?.(data);
    },

    // User left room
    UserLeftRoom: (data: { userId: string; userName: string; roomName: string }) => {
      logger.info(`User left room: ${data.userName} <- ${data.roomName}`);
      onUserLeft?.(data);
    },

    // User came online
    UserOnline: (data: { userId: string; userName: string; connectedAt: string }) => {
      logger.info(`User online: ${data.userName}`);
      setOnlineUsers((prev) => {
        if (prev.some((u) => u.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, userName: data.userName, connectedAt: data.connectedAt }];
      });
      onUserOnline?.(data);
    },

    // User went offline
    UserOffline: (data: { userId: string; userName: string }) => {
      logger.info(`User offline: ${data.userName}`);
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      onUserOffline?.(data);
    },

    // Online users list
    OnlineUsersList: (users: ChatUser[]) => {
      logger.info(`Online users: ${users.length}`);
      setOnlineUsers(users);
    },

    // Rooms list
    RoomsList: (roomList: ChatRoom[]) => {
      logger.info(`Rooms: ${roomList.length}`);
      setRooms(roomList);
    },

    // User typing
    UserTyping: (info: TypingInfo) => {
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === info.userId)) return prev;
        return [...prev, info];
      });
      onTyping?.(info);
    },

    // User stopped typing
    UserStoppedTyping: (info: TypingInfo) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== info.userId));
      onStopTyping?.(info);
    },

    // Unread count
    UnreadCount: (count: number) => {
      setUnreadCount(count);
    },

    // Messages marked as read
    MessagesMarkedAsRead: (messageIds: string[]) => {
      logger.info(`Messages marked as read: ${messageIds.length} messages`);
    },

    // Error handling
    Error: (errorMessage: string) => {
      logger.error(`Chat error: ${errorMessage}`);
      toast.error('Chat Hatası', { description: errorMessage });
    },
  }), [onMessage, onPrivateMessage, onUserJoined, onUserLeft, onUserOnline, onUserOffline, onTyping, onStopTyping, showToasts, currentRoom]);

  const { isConnected, invoke } = useSignalRHub({
    hub: 'chat',
    events,
  });

  // Actions
  const sendMessage = useCallback(
    async (message: string, roomName?: string) => {
      if (!isConnected) {
        toast.error('Bağlantı yok', { description: 'Chat sunucusuna bağlı değilsiniz.' });
        return;
      }
      try {
        await invoke('SendMessage', message, roomName);
      } catch (error) {
        logger.error('Failed to send message', error instanceof Error ? error : new Error(String(error)));
        toast.error('Mesaj gönderilemedi');
      }
    },
    [isConnected, invoke]
  );

  const sendPrivateMessage = useCallback(
    async (targetUserId: string, message: string) => {
      if (!isConnected) {
        toast.error('Bağlantı yok', { description: 'Chat sunucusuna bağlı değilsiniz.' });
        return;
      }
      try {
        await invoke('SendPrivateMessage', targetUserId, message);
      } catch (error) {
        logger.error('Failed to send private message', error instanceof Error ? error : new Error(String(error)));
        toast.error('Özel mesaj gönderilemedi');
      }
    },
    [isConnected, invoke]
  );

  const joinRoom = useCallback(
    async (roomName: string) => {
      if (!isConnected) return;
      try {
        await invoke('JoinRoom', roomName);
        setCurrentRoom(roomName);
        setMessages([]); // Clear messages when joining new room
      } catch (error) {
        logger.error('Failed to join room', error instanceof Error ? error : new Error(String(error)));
        toast.error('Odaya katılınamadı');
      }
    },
    [isConnected, invoke]
  );

  const leaveRoom = useCallback(
    async (roomName: string) => {
      if (!isConnected) return;
      try {
        await invoke('LeaveRoom', roomName);
        if (currentRoom === roomName) {
          setCurrentRoom(null);
          setMessages([]);
        }
      } catch (error) {
        logger.error('Failed to leave room', error instanceof Error ? error : new Error(String(error)));
      }
    },
    [isConnected, invoke, currentRoom]
  );

  const loadPrivateMessages = useCallback(
    async (otherUserId: string, take = 20, skip = 0) => {
      if (!isConnected) return;
      try {
        // Store the userId so PrivateMessageHistory handler knows which user's messages these are
        pendingPrivateMessageUserIdRef.current = otherUserId;
        logger.info(`Loading private messages for user: ${otherUserId}`);
        await invoke('LoadPrivateMessages', otherUserId, take, skip);
      } catch (error) {
        pendingPrivateMessageUserIdRef.current = null;
        logger.error('Failed to load private messages', error instanceof Error ? error : new Error(String(error)));
      }
    },
    [isConnected, invoke]
  );

  const markAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!isConnected) return;
      try {
        await invoke('MarkMessagesAsRead', messageIds);
      } catch (error) {
        logger.error('Failed to mark messages as read', error instanceof Error ? error : new Error(String(error)));
      }
    },
    [isConnected, invoke]
  );

  const getOnlineUsers = useCallback(async () => {
    if (!isConnected) return;
    try {
      await invoke('GetOnlineUsers');
    } catch (error) {
      logger.error('Failed to get online users', error instanceof Error ? error : new Error(String(error)));
    }
  }, [isConnected, invoke]);

  const getRooms = useCallback(async () => {
    if (!isConnected) return;
    try {
      await invoke('GetRooms');
    } catch (error) {
      logger.error('Failed to get rooms', error instanceof Error ? error : new Error(String(error)));
    }
  }, [isConnected, invoke]);

  const getUnreadCount = useCallback(async () => {
    if (!isConnected) return;
    try {
      await invoke('GetUnreadCount');
    } catch (error) {
      logger.error('Failed to get unread count', error instanceof Error ? error : new Error(String(error)));
    }
  }, [isConnected, invoke]);

  const startTyping = useCallback(
    async (roomName?: string) => {
      if (!isConnected) return;
      try {
        await invoke('StartTyping', roomName);
      } catch (error: any) {
        // Silently fail - not critical
      }
    },
    [isConnected, invoke]
  );

  const stopTyping = useCallback(
    async (roomName?: string) => {
      if (!isConnected) return;
      try {
        await invoke('StopTyping', roomName);
      } catch (error: any) {
        // Silently fail - not critical
      }
    },
    [isConnected, invoke]
  );

  // Fetch online users and unread count when connected
  // Note: We intentionally exclude function dependencies to prevent infinite loops
  // These functions are stable enough that calling them once on connection is sufficient
  useEffect(() => {
    if (isConnected) {
      // Call directly via invoke to avoid dependency issues
      invoke('GetOnlineUsers').catch(() => {});
      invoke('GetUnreadCount').catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return {
    // Connection state
    isConnected,

    // State
    messages,
    privateMessages,
    onlineUsers,
    rooms,
    typingUsers,
    unreadCount,
    currentRoom,

    // Actions
    sendMessage,
    sendPrivateMessage,
    joinRoom,
    leaveRoom,
    loadPrivateMessages,
    markAsRead,
    getOnlineUsers,
    getRooms,
    getUnreadCount,
    startTyping,
    stopTyping,
  };
}
