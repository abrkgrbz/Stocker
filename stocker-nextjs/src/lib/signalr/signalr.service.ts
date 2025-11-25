import * as signalR from '@microsoft/signalr';

export interface TenantCreationProgress {
  registrationId: string;
  step: string;
  message: string;
  progressPercentage: number;
  timestamp: string;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnected = false;

  /**
   * Connect to SignalR hub
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.connection) {
      console.log('[SignalR] Already connected');
      return;
    }

    try {
      // Use NEXT_PUBLIC_API_URL (from .env.local) or fallback to localhost
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5249';
      // Note: Backend endpoint is /hubs/notification (singular, not plural)
      const hubUrl = `${baseUrl}/hubs/notification`;

      console.log(`Connecting to SignalR hub: ${hubUrl}`);

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 0s, 2s, 10s, 30s, then 60s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            if (retryContext.previousRetryCount === 3) return 30000;
            return 60000;
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Connection event handlers
      this.connection.onreconnecting((error) => {
        console.warn('SignalR reconnecting...', { error: error?.message });
      });

      this.connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected', { connectionId });
      });

      this.connection.onclose((error) => {
        this.isConnected = false;
        console.error('SignalR connection closed', { error: error?.message });
      });

      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR connected successfully', {
        connectionId: this.connection.connectionId
      });
    } catch (error) {
      console.error('Failed to connect to SignalR', { error });
      throw error;
    }
  }

  /**
   * Join a registration group to receive tenant creation updates
   */
  async joinRegistrationGroup(registrationId: string): Promise<void> {
    if (!this.connection || !this.isConnected) {
      throw new Error('SignalR not connected. Call connect() first.');
    }

    try {
      console.log('Joining registration group', { registrationId });
      await this.connection.invoke('JoinRegistrationGroup', registrationId);
      console.log('Successfully joined registration group', { registrationId });
    } catch (error) {
      console.error('Failed to join registration group', {
        registrationId,
        error
      });
      throw error;
    }
  }

  /**
   * Leave a registration group
   */
  async leaveRegistrationGroup(registrationId: string): Promise<void> {
    if (!this.connection || !this.isConnected) {
      return;
    }

    try {
      console.log('Leaving registration group', { registrationId });
      await this.connection.invoke('LeaveRegistrationGroup', registrationId);
      console.log('Successfully left registration group', { registrationId });
    } catch (error) {
      console.error('Failed to leave registration group', {
        registrationId,
        error
      });
    }
  }

  /**
   * Subscribe to tenant creation progress updates
   */
  onTenantCreationProgress(
    callback: (progress: TenantCreationProgress) => void
  ): void {
    if (!this.connection) {
      throw new Error('SignalR not connected. Call connect() first.');
    }

    this.connection.on('TenantCreationProgress', (progress: TenantCreationProgress) => {
      console.log('Received tenant creation progress', {
        step: progress.step,
        percentage: progress.progressPercentage,
        isCompleted: progress.isCompleted,
        hasError: progress.hasError
      });
      callback(progress);
    });
  }

  /**
   * Unsubscribe from tenant creation progress updates
   */
  offTenantCreationProgress(): void {
    if (this.connection) {
      this.connection.off('TenantCreationProgress');
    }
  }

  /**
   * Disconnect from SignalR hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        console.log('SignalR disconnected');
      } catch (error) {
        console.error('Error disconnecting from SignalR', { error });
      }
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const signalRService = new SignalRService();
