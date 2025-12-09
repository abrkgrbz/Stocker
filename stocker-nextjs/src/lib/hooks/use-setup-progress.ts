'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export interface SetupProgressMessage {
  tenantId: string;
  step: number;
  stepName: string;
  message: string;
  progressPercentage: number;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type SetupStep =
  | 'initializing'
  | 'creating-database'
  | 'running-migrations'
  | 'seeding-data'
  | 'configuring-modules'
  | 'creating-storage'
  | 'activating-tenant'
  | 'completed'
  | 'failed';

export interface UseSetupProgressOptions {
  tenantId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
  autoRedirectDelay?: number; // ms to wait before redirect after completion
}

export interface UseSetupProgressReturn {
  progress: SetupProgressMessage | null;
  currentStep: SetupStep;
  isConnected: boolean;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const stepMap: Record<number, SetupStep> = {
  0: 'initializing',
  1: 'creating-database',
  2: 'running-migrations',
  3: 'seeding-data',
  4: 'configuring-modules',
  5: 'creating-storage',
  6: 'activating-tenant',
  7: 'completed',
  [-1]: 'failed',
};

export function useSetupProgress({
  tenantId,
  onComplete,
  onError,
  autoRedirectDelay = 2000,
}: UseSetupProgressOptions): UseSetupProgressReturn {
  const [progress, setProgress] = useState<SetupProgressMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState<SetupStep>('initializing');
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      console.log('[SetupProgress] Already connected');
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5249';
      const hubUrl = `${baseUrl}/hubs/setup-progress`;

      console.log(`[SetupProgress] Connecting to: ${hubUrl}`);

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: false,
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.ServerSentEvents |
            signalR.HttpTransportType.LongPolling,
          withCredentials: true,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 5000;
            return 10000;
          },
        })
        .withServerTimeout(120000)
        .withKeepAliveInterval(30000)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Connection event handlers
      connection.onreconnecting((error) => {
        console.warn('[SetupProgress] Reconnecting...', error?.message);
        setIsConnected(false);
      });

      connection.onreconnected((connectionId) => {
        console.log('[SetupProgress] Reconnected:', connectionId);
        setIsConnected(true);
        // Rejoin the group after reconnection
        connection.invoke('JoinSetupGroup', tenantId).catch(console.error);
      });

      connection.onclose((error) => {
        console.log('[SetupProgress] Connection closed', error?.message);
        setIsConnected(false);
      });

      // Listen for progress updates
      connection.on('SetupProgress', (message: SetupProgressMessage) => {
        console.log('[SetupProgress] Received:', message);
        setProgress(message);
        setCurrentStep(stepMap[message.step] || 'initializing');

        if (message.isCompleted) {
          setIsCompleted(true);
          // Trigger completion callback after delay
          if (onComplete) {
            completionTimeoutRef.current = setTimeout(() => {
              onComplete();
            }, autoRedirectDelay);
          }
        }

        if (message.hasError) {
          setHasError(true);
          setErrorMessage(message.errorMessage || 'Kurulum sırasında bir hata oluştu');
          if (onError) {
            onError(message.errorMessage || 'Kurulum hatası');
          }
        }
      });

      // Start connection
      await connection.start();
      connectionRef.current = connection;
      setIsConnected(true);

      console.log('[SetupProgress] Connected, joining group for tenant:', tenantId);

      // Join the setup progress group
      await connection.invoke('JoinSetupGroup', tenantId);

      console.log('[SetupProgress] Joined setup group successfully');
    } catch (error) {
      console.error('[SetupProgress] Connection failed:', error);
      setIsConnected(false);
      throw error;
    }
  }, [tenantId, onComplete, onError, autoRedirectDelay]);

  const disconnect = useCallback(async () => {
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    if (connectionRef.current) {
      try {
        // Leave the group before disconnecting
        if (connectionRef.current.state === signalR.HubConnectionState.Connected) {
          await connectionRef.current.invoke('LeaveSetupGroup', tenantId);
        }
        await connectionRef.current.stop();
        console.log('[SetupProgress] Disconnected');
      } catch (error) {
        console.error('[SetupProgress] Error disconnecting:', error);
      } finally {
        connectionRef.current = null;
        setIsConnected(false);
      }
    }
  }, [tenantId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
      if (connectionRef.current) {
        connectionRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return {
    progress,
    currentStep,
    isConnected,
    isCompleted,
    hasError,
    errorMessage,
    connect,
    disconnect,
  };
}
