'use client';

import { useEffect } from 'react';
import { useSignalR as useSignalRContext } from './signalr-context';
import { SignalRClient } from './signalr-client';

// Re-export useSignalR from context
export { useSignalR } from './signalr-context';

interface UseSignalRHubOptions {
  hub: 'notification' | 'inventory' | 'order';
  events: {
    [eventName: string]: (...args: any[]) => void;
  };
  enabled?: boolean;
}

export function useSignalRHub({ hub, events, enabled = true }: UseSignalRHubOptions) {
  const context = useSignalRContext();

  const hubInstance: SignalRClient =
    hub === 'notification'
      ? context.notificationHub
      : hub === 'inventory'
      ? context.inventoryHub
      : context.orderHub;

  const isConnected =
    hub === 'notification'
      ? context.isNotificationConnected
      : hub === 'inventory'
      ? context.isInventoryConnected
      : context.isOrderConnected;

  useEffect(() => {
    if (!enabled || !isConnected) return;

    // Register event handlers
    Object.entries(events).forEach(([eventName, handler]) => {
      hubInstance.on(eventName, handler);
    });

    // Cleanup
    return () => {
      Object.entries(events).forEach(([eventName, handler]) => {
        hubInstance.off(eventName, handler);
      });
    };
  }, [enabled, isConnected, hubInstance, events]);

  return {
    isConnected,
    invoke: hubInstance.invoke.bind(hubInstance),
  };
}
