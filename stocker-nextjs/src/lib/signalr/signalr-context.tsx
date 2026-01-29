'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { notificationHub, chatHub, SignalRClient } from './signalr-client';
import { toast } from 'sonner';
import logger from '../utils/logger';
import { useChat } from '@/features/chat/hooks/useChat';

interface SignalRContextValue {
  // Notification Hub
  notificationHub: SignalRClient;
  isNotificationConnected: boolean;

  // Chat Hub
  chatHub: SignalRClient;
  isChatConnected: boolean;

  // Inventory Hub (placeholder - not implemented yet)
  inventoryHub?: SignalRClient;
  isInventoryConnected?: boolean;

  // Order Hub (placeholder - not implemented yet)
  orderHub?: SignalRClient;
  isOrderConnected?: boolean;

  // Methods
  connectAll: () => Promise<void>;
  disconnectAll: () => Promise<void>;

  // Global message notification control
  setMessageNotificationsEnabled: (enabled: boolean) => void;
  isMessageNotificationsEnabled: boolean;

  // Chat popup control
  openChatPopup: (userId: string, userName: string) => void;
  closeChatPopup: () => void;
  chatPopupState: { isOpen: boolean; userId: string; userName: string } | null;
}

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

// Interface for incoming chat messages
interface IncomingChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  room?: string;
  isPrivate?: boolean;
  targetUserId?: string;
  timestamp: string;
}

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const [isNotificationConnected, setIsNotificationConnected] = useState(false);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [isMessageNotificationsEnabled, setMessageNotificationsEnabled] = useState(true);
  const globalHandlersRegisteredRef = useRef(false);
  const stateSubscriptionsRef = useRef<(() => void)[]>([]);

  // Get store actions for syncing unread count
  const incrementUnreadCount = useChat((state) => state.incrementUnreadCount);

  // Chat popup state
  const [chatPopupState, setChatPopupState] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  } | null>(null);

  const openChatPopup = useCallback((userId: string, userName: string) => {
    setChatPopupState({ isOpen: true, userId, userName });
  }, []);

  const closeChatPopup = useCallback(() => {
    setChatPopupState(null);
  }, []);

  const connectAll = useCallback(async () => {
    // Note: No token needed - authentication via HttpOnly cookies
    try {
      // Connect to notification hub
      if (!notificationHub.isConnected) {
        await notificationHub.start();
        setIsNotificationConnected(notificationHub.isConnected);
      }

      // Connect to chat hub
      if (!chatHub.isConnected) {
        await chatHub.start();
        setIsChatConnected(chatHub.isConnected);
      }
    } catch (error) {
      // Error already logged in signalr-client.ts
      setIsNotificationConnected(false);
      setIsChatConnected(false);
    }
  }, []);

  const disconnectAll = useCallback(async () => {
    try {
      await notificationHub.stop();
      setIsNotificationConnected(false);

      await chatHub.stop();
      setIsChatConnected(false);
    } catch (error) {
      console.error('Failed to disconnect from SignalR hubs:', error);
    }
  }, []);

  // Subscribe to connection state changes (event-based instead of polling)
  useEffect(() => {
    // Subscribe to notification hub state changes
    const unsubNotification = notificationHub.onStateChange((state) => {
      const isConnected = state === HubConnectionState.Connected;
      setIsNotificationConnected(isConnected);
      logger.info('Notification hub state changed', { metadata: { state: HubConnectionState[state], isConnected } });
    });

    // Subscribe to chat hub state changes
    const unsubChat = chatHub.onStateChange((state) => {
      const isConnected = state === HubConnectionState.Connected;
      setIsChatConnected(isConnected);
      logger.info('Chat hub state changed', { metadata: { state: HubConnectionState[state], isConnected } });
    });

    // Store unsubscribe functions
    stateSubscriptionsRef.current = [unsubNotification, unsubChat];

    return () => {
      // Unsubscribe from all state changes
      stateSubscriptionsRef.current.forEach((unsub) => unsub());
      stateSubscriptionsRef.current = [];
    };
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connectAll();

    // Cleanup on unmount
    return () => {
      disconnectAll();
    };
  }, [connectAll, disconnectAll]);

  // Register global message handlers for toast notifications
  useEffect(() => {
    if (!isChatConnected || globalHandlersRegisteredRef.current) return;

    // Handler for private messages - show toast globally and sync unread count
    const handleReceivePrivateMessage = (message: IncomingChatMessage) => {
      logger.info('Global: Private message received', { metadata: { from: message.userName } });

      // Increment unread count in store (for global badge display)
      incrementUnreadCount();

      // Show toast notification if enabled
      if (isMessageNotificationsEnabled) {
        const truncatedMessage = message.message.length > 60
          ? message.message.substring(0, 60) + '...'
          : message.message;

        toast.info(`💬 ${message.userName}`, {
          description: truncatedMessage,
          action: {
            label: 'Yanıtla',
            onClick: () => {
              // Open chat popup instead of navigating
              openChatPopup(message.userId, message.userName);
            },
          },
          duration: 5000,
        });
      }
    };

    // Handler for room messages - show toast globally
    const handleReceiveMessage = (message: IncomingChatMessage) => {
      logger.info('Global: Room message received', { metadata: { from: message.userName, room: message.room } });

      // Show toast notification if enabled (only for room messages when not on chat page)
      if (isMessageNotificationsEnabled && message.room) {
        const truncatedMessage = message.message.length > 60
          ? message.message.substring(0, 60) + '...'
          : message.message;

        toast.info(`💬 ${message.userName} (${message.room})`, {
          description: truncatedMessage,
          duration: 4000,
        });
      }
    };

    // Register handlers
    chatHub.on('ReceivePrivateMessage', handleReceivePrivateMessage);
    chatHub.on('ReceiveMessage', handleReceiveMessage);
    globalHandlersRegisteredRef.current = true;

    logger.info('Global chat message handlers registered');

    return () => {
      // Cleanup handlers on unmount
      chatHub.off('ReceivePrivateMessage', handleReceivePrivateMessage);
      chatHub.off('ReceiveMessage', handleReceiveMessage);
      globalHandlersRegisteredRef.current = false;
      logger.info('Global chat message handlers unregistered');
    };
  }, [isChatConnected, isMessageNotificationsEnabled, openChatPopup, incrementUnreadCount]);

  const value: SignalRContextValue = {
    notificationHub,
    isNotificationConnected,
    chatHub,
    isChatConnected,
    connectAll,
    disconnectAll,
    setMessageNotificationsEnabled,
    isMessageNotificationsEnabled,
    openChatPopup,
    closeChatPopup,
    chatPopupState,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within SignalRProvider');
  }
  return context;
}
