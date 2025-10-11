'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { notificationHub, inventoryHub, orderHub, SignalRClient } from './signalr-client';

interface SignalRContextValue {
  // Notification Hub
  notificationHub: SignalRClient;
  isNotificationConnected: boolean;

  // Inventory Hub
  inventoryHub: SignalRClient;
  isInventoryConnected: boolean;

  // Order Hub
  orderHub: SignalRClient;
  isOrderConnected: boolean;

  // Methods
  connectAll: () => Promise<void>;
  disconnectAll: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const [isNotificationConnected, setIsNotificationConnected] = useState(false);
  const [isInventoryConnected, setIsInventoryConnected] = useState(false);
  const [isOrderConnected, setIsOrderConnected] = useState(false);

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

    try {
      // Connect to notification hub
      if (!notificationHub.isConnected) {
        await notificationHub.start(token);
        setIsNotificationConnected(true);
      }

      // Connect to inventory hub
      if (!inventoryHub.isConnected) {
        await inventoryHub.start(token);
        setIsInventoryConnected(true);
      }

      // Connect to order hub
      if (!orderHub.isConnected) {
        await orderHub.start(token);
        setIsOrderConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect to SignalR hubs:', error);
    }
  }, [getAccessToken]);

  const disconnectAll = useCallback(async () => {
    try {
      await notificationHub.stop();
      setIsNotificationConnected(false);

      await inventoryHub.stop();
      setIsInventoryConnected(false);

      await orderHub.stop();
      setIsOrderConnected(false);
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

  // Monitor connection state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsNotificationConnected(notificationHub.state === HubConnectionState.Connected);
      setIsInventoryConnected(inventoryHub.state === HubConnectionState.Connected);
      setIsOrderConnected(orderHub.state === HubConnectionState.Connected);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const value: SignalRContextValue = {
    notificationHub,
    isNotificationConnected,
    inventoryHub,
    isInventoryConnected,
    orderHub,
    isOrderConnected,
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
