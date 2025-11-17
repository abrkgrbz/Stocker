'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { notificationHub, SignalRClient } from './signalr-client';

interface SignalRContextValue {
  // Notification Hub
  notificationHub: SignalRClient;
  isNotificationConnected: boolean;

  // Methods
  connectAll: () => Promise<void>;
  disconnectAll: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const [isNotificationConnected, setIsNotificationConnected] = useState(false);

  const connectAll = useCallback(async () => {
    // Note: No token needed - authentication via HttpOnly cookies
    try {
      // Connect to notification hub
      if (!notificationHub.isConnected) {
        await notificationHub.start(); // No token parameter needed
        setIsNotificationConnected(notificationHub.isConnected);
      }
    } catch (error) {
      // Error already logged in signalr-client.ts
      setIsNotificationConnected(false);
    }
  }, []); // Removed getAccessToken dependency

  const disconnectAll = useCallback(async () => {
    try {
      await notificationHub.stop();
      setIsNotificationConnected(false);
    } catch (error) {
      console.error('Failed to disconnect from SignalR hub:', error);
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
      const isConnected = notificationHub.state === HubConnectionState.Connected;
      setIsNotificationConnected(isConnected);
    }, 5000); // Check every 5 seconds instead of every second

    return () => clearInterval(interval);
  }, []);

  const value: SignalRContextValue = {
    notificationHub,
    isNotificationConnected,
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
