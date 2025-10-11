'use client';

import { useState, useEffect } from 'react';
import { useSignalR } from './use-signalr';
import type { ConnectionState } from '@/components/status/ConnectionStatus';

export function useSignalRStatus(hubName: 'notifications' | 'inventory' | 'orders' = 'notifications') {
  const { connection } = useSignalR(hubName);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

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
