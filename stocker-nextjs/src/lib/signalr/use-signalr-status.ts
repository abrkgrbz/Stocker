'use client';

import { useState, useEffect } from 'react';
import { useSignalR } from './signalr-context';
import type { ConnectionState } from '@/components/status/ConnectionStatus';

export function useSignalRStatus(hubName: 'notifications' | 'inventory' | 'orders' = 'notifications') {
  const context = useSignalR();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  // Select the right hub based on hubName
  const connection = hubName === 'notifications'
    ? context.notificationHub
    : hubName === 'inventory'
    ? context.inventoryHub
    : context.orderHub;

  const isConnected = hubName === 'notifications'
    ? context.isNotificationConnected
    : hubName === 'inventory'
    ? context.isInventoryConnected
    : context.isOrderConnected;

  useEffect(() => {
    if (!connection) {
      setConnectionState('disconnected');
      return;
    }

    const updateState = () => {
      const state = connection.state;

      if (state === 'Connected') {
        setConnectionState('connected');
      } else if (state === 'Disconnected') {
        setConnectionState('disconnected');
      } else if (state === 'Connecting') {
        setConnectionState('connecting');
      } else if (state === 'Reconnecting') {
        setConnectionState('reconnecting');
      } else {
        setConnectionState('error');
      }
    };

    // Initial state
    updateState();

    // Poll for state changes
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, [connection]);

  return connectionState;
}
