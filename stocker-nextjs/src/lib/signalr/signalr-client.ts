import * as signalR from '@microsoft/signalr';

import logger from '../utils/logger';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5249';

export class SignalRClient {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds

  constructor(private hubUrl: string) {}

  async start(accessToken?: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      logger.info('SignalR already connected');
      return;
    }

    // Note: Authentication uses HttpOnly cookies, not access tokens
    // Backend validates authentication via Context.User from cookies
    const connectionBuilder = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}${this.hubUrl}`, {
        // No accessTokenFactory needed - authentication via HttpOnly cookies
        withCredentials: true, // Send cookies for authentication
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff with max attempts: 0s, 2s, 10s, 30s, 60s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          if (retryContext.previousRetryCount === 3) return 30000;
          if (retryContext.previousRetryCount === 4) return 60000;
          // Stop reconnecting after 5 attempts
          return null;
        },
      })
      .configureLogging(
        process.env.NODE_ENV === 'development'
          ? signalR.LogLevel.Warning // Reduced from Information to Warning
          : signalR.LogLevel.Error
      );

    this.connection = connectionBuilder.build();

    // Connection event handlers
    this.connection.onreconnecting((error) => {
      logger.warn('SignalR reconnecting...', error?.message || 'Unknown error');
      this.reconnectAttempts++;
    });

    this.connection.onreconnected((connectionId) => {
      logger.info('SignalR reconnected:', connectionId);
      this.reconnectAttempts = 0;
    });

    this.connection.onclose(async (error) => {
      // Only log as warning if it's not a deliberate disconnect
      if (error) {
        logger.warn('SignalR connection closed:', error?.message || 'Unknown error');
      } else {
        logger.info('SignalR disconnected gracefully');
      }

      // Attempt manual reconnection with backoff
      if (error && this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 60000);
        logger.info(`Attempting manual reconnect in ${delay}ms...`);

        setTimeout(() => {
          this.start(); // No token needed - uses cookies
        }, delay);
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logger.error('SignalR max reconnection attempts reached. Giving up.');
      }
    });

    try {
      await this.connection.start();
      logger.info('SignalR connected successfully');
      this.reconnectAttempts = 0;
    } catch (error: any) {
      this.reconnectAttempts++;

      // More graceful error handling based on error type
      if (error?.message?.includes('429')) {
        logger.error('SignalR rate limited (429). Please wait before reconnecting.');
      } else if (error?.message?.includes('401') || error?.message?.includes('403')) {
        logger.error('SignalR authentication failed. Token may be invalid or expired.');
      } else if (error?.message?.includes('connect')) {
        logger.warn('SignalR connection failed. Will retry automatically.');
      } else {
        logger.error('SignalR connection failed:', error?.message || 'Unknown error');
      }

      // Don't throw - let it reconnect automatically
      // throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      logger.info('SignalR disconnected');
    }
  }

  on(eventName: string, handler: (...args: any[]) => void): void {
    if (!this.connection) {
      throw new Error('SignalR connection not initialized');
    }
    this.connection.on(eventName, handler);
  }

  off(eventName: string, handler?: (...args: any[]) => void): void {
    if (!this.connection) {
      throw new Error('SignalR connection not initialized');
    }
    if (handler) {
      this.connection.off(eventName, handler);
    } else {
      this.connection.off(eventName);
    }
  }

  async invoke(methodName: string, ...args: any[]): Promise<any> {
    if (!this.connection) {
      throw new Error('SignalR connection not initialized');
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected');
    }

    return await this.connection.invoke(methodName, ...args);
  }

  get state(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Singleton instance for notification hub
// Note: Only notification hub is currently available on backend
// Future hubs (inventory, orders) can be added when backend endpoints are implemented
export const notificationHub = new SignalRClient('/hubs/notification');
