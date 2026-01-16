'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { notificationHub, chatHub, SignalRClient } from './signalr-client';

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
}

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const [isNotificationConnected, setIsNotificationConnected] = useState(false);
  const [isChatConnected, setIsChatConnected] = useState(false);

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

  const value: SignalRContextValue = {
    notificationHub,
    isNotificationConnected,
    chatHub,
    isChatConnected,
    connectAll,
    disconnectAll,
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
