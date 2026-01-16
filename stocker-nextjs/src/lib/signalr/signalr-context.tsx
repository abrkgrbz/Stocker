'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { notificationHub, chatHub, SignalRClient } from './signalr-client';
import { toast } from 'sonner';
import logger from '../utils/logger';

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

  // Auto-connect on mount
  useEffect(() => {
    connectAll();

    // Cleanup on unmount
    return () => {
      disconnectAll();
    };
  }, [connectAll, disconnectAll]);

  // Monitor connection state - reduced frequency to avoid performance impact
  useEffect(() => {
    const interval = setInterval(() => {
      setIsNotificationConnected(notificationHub.state === HubConnectionState.Connected);
      setIsChatConnected(chatHub.state === HubConnectionState.Connected);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Register global message handlers for toast notifications
  useEffect(() => {
    if (!isChatConnected || globalHandlersRegisteredRef.current) return;

    // Handler for private messages - show toast globally
    const handleReceivePrivateMessage = (message: IncomingChatMessage) => {
      logger.info('Global: Private message received', { metadata: { from: message.userName } });

      // Show toast notification if enabled
      if (isMessageNotificationsEnabled) {
        const truncatedMessage = message.message.length > 60
          ? message.message.substring(0, 60) + '...'
          : message.message;

        toast.info(`💬 ${message.userName}`, {
          description: truncatedMessage,
          action: {
            label: 'Görüntüle',
            onClick: () => {
              // Navigate to messaging page with user context
              const params = new URLSearchParams({
                userId: message.userId,
                userName: message.userName,
              });
              window.location.href = `/app/messaging?${params.toString()}`;
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
  }, [isChatConnected, isMessageNotificationsEnabled]);

  const value: SignalRContextValue = {
    notificationHub,
    isNotificationConnected,
    chatHub,
    isChatConnected,
    connectAll,
    disconnectAll,
    setMessageNotificationsEnabled,
    isMessageNotificationsEnabled,
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
