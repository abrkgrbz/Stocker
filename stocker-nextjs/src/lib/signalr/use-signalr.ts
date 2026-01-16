'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSignalR as useSignalRContext } from './signalr-context';
import { SignalRClient } from './signalr-client';

// Re-export useSignalR from context
export { useSignalR } from './signalr-context';

interface UseSignalRHubOptions {
  hub: 'notification' | 'chat' | 'inventory' | 'order';
  events: {
    [eventName: string]: (...args: any[]) => void;
  };
  enabled?: boolean;
}

// Stable empty function for when hub is not available
const noopInvoke = async () => {};

export function useSignalRHub({ hub, events, enabled = true }: UseSignalRHubOptions) {
  const context = useSignalRContext();

  const hubInstance: SignalRClient | undefined =
    hub === 'notification'
      ? context.notificationHub
      : hub === 'chat'
      ? context.chatHub
      : hub === 'inventory'
      ? context.inventoryHub
      : context.orderHub;

  const isConnected =
    hub === 'notification'
      ? context.isNotificationConnected
      : hub === 'chat'
      ? context.isChatConnected
      : hub === 'inventory'
      ? context.isInventoryConnected ?? false
      : context.isOrderConnected ?? false;

  // Store hubInstance in a ref to avoid recreating invoke callback
  const hubInstanceRef = useRef(hubInstance);
  hubInstanceRef.current = hubInstance;

  // Stable invoke function that uses ref internally
  const invoke = useCallback(async (methodName: string, ...args: any[]) => {
    if (!hubInstanceRef.current) {
      return;
    }
    return hubInstanceRef.current.invoke(methodName, ...args);
  }, []);

  useEffect(() => {
    if (!enabled || !isConnected || !hubInstance) return;

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
    invoke: hubInstance ? invoke : noopInvoke,
  };
}
