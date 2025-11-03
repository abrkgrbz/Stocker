import * as signalR from '@microsoft/signalr';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5249';

export class SignalRClient {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds

  constructor(private hubUrl: string) {}

  async start(accessToken?: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR already connected');
      return;
    }

    const connectionBuilder = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}${this.hubUrl}`, {
        accessTokenFactory: () => accessToken || '', // ✅ Send JWT token for authentication
        withCredentials: true, // Also send cookies
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 30s...
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(
        process.env.NODE_ENV === 'development'
          ? signalR.LogLevel.Information
          : signalR.LogLevel.Warning
      );

    this.connection = connectionBuilder.build();

    // Connection event handlers
    this.connection.onreconnecting((error) => {
      console.warn('SignalR reconnecting...', error);
      this.reconnectAttempts++;
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
      this.reconnectAttempts = 0;
    });

    this.connection.onclose(async (error) => {
      console.error('SignalR connection closed:', error);

      // Attempt manual reconnection if automatic reconnect fails
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.start(accessToken);
        }, this.reconnectDelay);
      }
    });

    try {
      await this.connection.start();
      console.log('SignalR connected successfully');
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      console.log('SignalR disconnected');
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

// Singleton instances for different hubs
export const notificationHub = new SignalRClient('/hubs/notification');
export const inventoryHub = new SignalRClient('/hubs/inventory');
export const orderHub = new SignalRClient('/hubs/orders');
