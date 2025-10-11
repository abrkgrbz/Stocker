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

      switch (state) {
        case 'Connected':
          setConnectionState('connected');
          break;
        case 'Disconnected':
          setConnectionState('disconnected');
          break;
        case 'Connecting':
          setConnectionState('connecting');
          break;
        case 'Reconnecting':
          setConnectionState('reconnecting');
          break;
        default:
          setConnectionState('error');
      }
    };

    // Initial state
    updateState();

    // Listen to state changes
    connection.onreconnecting(() => setConnectionState('reconnecting'));
    connection.onreconnected(() => setConnectionState('connected'));
    connection.onclose(() => setConnectionState('disconnected'));

    // Poll for state changes as backup
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, [connection]);

  return connectionState;
}
