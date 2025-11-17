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
    : undefined; // Only notifications hub is currently implemented

  const isConnected = hubName === 'notifications'
    ? context.isNotificationConnected
    : false;

  useEffect(() => {
    // If hub doesn't exist or is not implemented, show as disconnected
    if (!connection) {
      setConnectionState('disconnected');
      return;
    }

    const updateState = () => {
      const state = connection.state;

      // If state is null/undefined, check isConnected flag
      if (!state) {
        setConnectionState(isConnected ? 'connected' : 'disconnected');
        return;
      }

      if (state === 'Connected') {
        setConnectionState('connected');
      } else if (state === 'Disconnected') {
        setConnectionState('disconnected');
      } else if (state === 'Connecting') {
        setConnectionState('connecting');
      } else if (state === 'Reconnecting') {
        setConnectionState('reconnecting');
      } else {
        // Unknown state - use isConnected flag as fallback
        setConnectionState(isConnected ? 'connected' : 'disconnected');
      }
    };

    // Initial state
    updateState();

    // Poll for state changes - reduced frequency
    const interval = setInterval(updateState, 3000);

    return () => clearInterval(interval);
  }, [connection, isConnected]);

  return connectionState;
}
