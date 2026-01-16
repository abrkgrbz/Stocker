// Chat Message Types
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  roomName?: string;
  recipientId?: string;
  recipientName?: string;
  isPrivate: boolean;
  sentAt: string;
  isRead: boolean;
  readAt?: string;
  messageType: ChatMessageType;
  attachmentUrl?: string;
  attachmentName?: string;
}

export enum ChatMessageType {
  Text = 0,
  Image = 1,
  File = 2,
  System = 3,
}

// SignalR Chat Message (different format from API)
export interface SignalRChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  room?: string;
  isPrivate?: boolean;
  targetUserId?: string;
  timestamp: string;
}

// Chat User
export interface ChatUser {
  userId: string;
  userName: string;
  connectedAt?: string;
  isOnline?: boolean;
}

// Chat Room
export interface ChatRoom {
  name: string;
  userCount: number;
  createdAt?: string;
}

// Chat Conversation (for conversation list)
export interface ChatConversation {
  userId?: string;
  userName?: string;
  roomName?: string;
  isPrivate: boolean;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

// API DTOs
export interface SendMessageDto {
  content: string;
  roomName?: string;
  recipientId?: string;
  recipientName?: string;
  isPrivate: boolean;
  messageType?: ChatMessageType;
  attachmentUrl?: string;
  attachmentName?: string;
}

// Typing Indicator
export interface TypingInfo {
  userId: string;
  userName: string;
  roomName?: string;
}

// API Response Types
export interface ChatMessagesResponse {
  success: boolean;
  data: ChatMessage[];
  message?: string;
}

export interface ConversationsResponse {
  success: boolean;
  data: ChatConversation[];
  message?: string;
}

// Transforms SignalR message to standard format
export function signalRToChatMessage(msg: SignalRChatMessage): ChatMessage {
  return {
    id: msg.id,
    senderId: msg.userId,
    senderName: msg.userName,
    content: msg.message,
    roomName: msg.room,
    recipientId: msg.targetUserId,
    isPrivate: msg.isPrivate || false,
    sentAt: msg.timestamp,
    isRead: false,
    messageType: ChatMessageType.Text,
  };
}
