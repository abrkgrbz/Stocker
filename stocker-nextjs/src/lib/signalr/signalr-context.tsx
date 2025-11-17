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

  // Get access token from cookie or localStorage
  const getAccessToken = useCallback(() => {
    if (typeof window === 'undefined') return undefined;

    // Try to get from cookie
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }

    // Try to get from localStorage
    return localStorage.getItem('access_token') || undefined;
  }, []);

  const connectAll = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      console.warn('SignalR: No access token available, skipping connection');
      return;
    }

    try {
      // Connect to notification hub
      if (!notificationHub.isConnected) {
        await notificationHub.start(token);
        setIsNotificationConnected(notificationHub.isConnected);
      }
    } catch (error) {
      // Error already logged in signalr-client.ts
      setIsNotificationConnected(false);
    }
  }, [getAccessToken]);

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
