import * as signalR from '@microsoft/signalr';
import { notification } from 'antd';
import { tokenStorage } from '../../utils/tokenStorage';

export interface MonitoringMetricsUpdate {
  metrics: {
    cpu: any;
    memory: any;
    disk: any;
    network: any;
    timestamp: string;
  };
  health: {
    overallStatus: string;
    services: any[];
    uptime: number;
    timestamp: string;
  };
  services: any[];
  collectedAt: string;
}

export interface MonitoringAlert {
  alerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    metric: string;
    value: number;
    threshold: number;
    message: string;
    timestamp: string;
  }>;
  timestamp: string;
}

export interface DockerStatsUpdate {
  containers: any;
  images: any;
  volumes: any;
  networks: number;
  cacheInfo: any[];
  timestamp: string;
}

class MonitoringSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 5000; // Start with 5 seconds
  private metricsUpdateHandler: ((data: MonitoringMetricsUpdate) => void) | null = null;
  private alertHandler: ((data: MonitoringAlert) => void) | null = null;
  private dockerStatsHandler: ((data: DockerStatsUpdate) => void) | null = null;
  private connectionStateHandler: ((state: string) => void) | null = null;

  /**
   * Initialize the SignalR connection
   */
  public async initialize(): Promise<void> {
    if (this.connection) {
      console.log('SignalR monitoring connection already initialized');
      return;
    }

    const token = tokenStorage.getToken();
    if (!token) {
      console.error('No auth token available for SignalR connection');
      return;
    }

    // Get the API base URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.stoocker.app';
    const hubUrl = `${baseUrl}/hubs/monitoring`;

    console.log('Initializing SignalR monitoring connection to:', hubUrl);

    // Create the connection with fallback transports
    // NOTE: Using LongPolling as primary transport due to browser extension blocking issues
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        // Force LongPolling to bypass ad blocker/extension issues
        // Comment out the line below to re-enable WebSockets when extensions are disabled
        transport: signalR.HttpTransportType.LongPolling,
        // Uncomment below for all transports (when ad blockers are disabled):
        // transport: signalR.HttpTransportType.WebSockets |
        //            signalR.HttpTransportType.ServerSentEvents |
        //            signalR.HttpTransportType.LongPolling,
        // Skip negotiation for direct WebSocket connection (optional, can help with blocked negotiate)
        skipNegotiation: false,
        // Add custom headers if needed
        headers: {
          'X-SignalR-User-Agent': 'Stocker-Monitoring/1.0'
        }
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount === 0) {
            return 2000; // First retry after 2 seconds
          } else if (retryContext.previousRetryCount < 5) {
            return 5000; // Next retries after 5 seconds
          } else if (retryContext.previousRetryCount < 10) {
            return 10000; // Then 10 seconds
          } else {
            return 30000; // Finally 30 seconds
          }
        }
      })
      .configureLogging(signalR.LogLevel.Debug) // More verbose logging for debugging
      .build();

    // Configure event handlers
    this.setupEventHandlers();

    // Start the connection
    await this.start();
  }

  /**
   * Setup SignalR event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Connection state handlers
    this.connection.onreconnecting((error) => {
      console.warn('SignalR monitoring connection lost, attempting to reconnect...', error);
      this.notifyConnectionState('reconnecting');
      notification.warning({
        message: 'Bağlantı Koptu',
        description: 'Monitoring sunucusuna yeniden bağlanılıyor...',
        placement: 'bottomRight',
        duration: 3
      });
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR monitoring reconnected with connectionId:', connectionId);
      this.reconnectAttempts = 0;
      this.reconnectInterval = 5000;
      this.notifyConnectionState('connected');

      // Re-subscribe to updates
      this.subscribeToUpdates();

      notification.success({
        message: 'Bağlantı Yenilendi',
        description: 'Monitoring sunucusuna yeniden bağlanıldı',
        placement: 'bottomRight',
        duration: 2
      });
    });

    this.connection.onclose((error) => {
      console.error('SignalR monitoring connection closed', error);
      this.notifyConnectionState('disconnected');

      // Attempt manual reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnect();
        }, this.reconnectInterval);

        // Exponential backoff
        this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000);
      } else {
        notification.error({
          message: 'Bağlantı Hatası',
          description: 'Monitoring sunucusuna bağlanılamıyor. Lütfen sayfayı yenileyin.',
          placement: 'bottomRight',
          duration: 0
        });
      }
    });

    // Message handlers
    this.connection.on('MonitoringConnected', (data) => {
      console.log('Monitoring connection confirmed:', data);
      this.notifyConnectionState('connected');

      // Auto-subscribe to metrics
      this.subscribeToUpdates();
    });

    this.connection.on('SubscriptionConfirmed', (data) => {
      console.log('Subscription confirmed:', data);
    });

    this.connection.on('SubscriptionError', (data) => {
      console.error('Subscription error:', data);
      notification.error({
        message: 'Abonelik Hatası',
        description: data.error || 'Güncellemelere abone olunurken hata oluştu',
        placement: 'topRight'
      });
    });

    // Metrics updates
    this.connection.on('ReceiveMetricsUpdate', (data: MonitoringMetricsUpdate) => {
      console.debug('Received metrics update:', data);
      if (this.metricsUpdateHandler) {
        this.metricsUpdateHandler(data);
      }
    });

    this.connection.on('SystemMetricsUpdate', (metrics) => {
      console.debug('Received system metrics:', metrics);
      // Can be handled separately if needed
    });

    this.connection.on('ServiceHealthUpdate', (health) => {
      console.debug('Received service health:', health);
      // Can be handled separately if needed
    });

    // Alert notifications
    this.connection.on('MonitoringAlert', (data: MonitoringAlert) => {
      console.warn('Received monitoring alert:', data);
      if (this.alertHandler) {
        this.alertHandler(data);
      }

      // Show notifications for alerts
      data.alerts.forEach(alert => {
        const notifyMethod = alert.severity === 'critical' ? notification.error :
                           alert.severity === 'warning' ? notification.warning :
                           notification.info;

        notifyMethod({
          message: `${alert.severity.toUpperCase()}: ${alert.metric.toUpperCase()}`,
          description: alert.message,
          placement: 'topRight',
          duration: alert.severity === 'critical' ? 0 : 10
        });
      });
    });

    // Docker stats updates
    this.connection.on('DockerStatsUpdate', (data: DockerStatsUpdate) => {
      console.debug('Received Docker stats:', data);
      if (this.dockerStatsHandler) {
        this.dockerStatsHandler(data);
      }
    });

    // Connection count updates
    this.connection.on('ConnectionsCount', (data) => {
      console.log('Active monitoring connections:', data.count);
    });
  }

  /**
   * Start the SignalR connection
   */
  private async start(): Promise<void> {
    if (!this.connection || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      await this.connection.start();
      console.log('SignalR monitoring connection started successfully');
      this.reconnectAttempts = 0;
      this.reconnectInterval = 5000;
      this.notifyConnectionState('connected');
    } catch (error: any) {
      console.error('Failed to start SignalR monitoring connection:', error);
      this.notifyConnectionState('disconnected');

      // Check for specific error types
      const errorMessage = error?.message || error?.toString() || '';

      // Check for CORS/Blocked errors
      if (errorMessage.includes('ERR_BLOCKED_BY_CLIENT') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('negotiate')) {
        console.error('⚠️ SignalR Connection Blocked - Possible causes:');
        console.error('1. Ad blocker or browser extension blocking the connection');
        console.error('2. CORS policy blocking the request');
        console.error('3. SSL certificate issues in development');
        console.error('4. API server not running or unreachable');

        notification.warning({
          message: 'Bağlantı Engellendi',
          description: 'Ad blocker veya güvenlik uzantıları bağlantıyı engelliyor olabilir. Lütfen uzantıları devre dışı bırakıp tekrar deneyin.',
          placement: 'topRight',
          duration: 10
        });
      }

      // Schedule reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnect();
        }, this.reconnectInterval);
      }
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Reconnect to SignalR hub
   */
  private async reconnect(): Promise<void> {
    this.reconnectAttempts++;
    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    await this.start();
  }

  /**
   * Subscribe to monitoring updates
   */
  private async subscribeToUpdates(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('Cannot subscribe - connection not ready');
      return;
    }

    try {
      // Subscribe to all monitoring updates
      await this.connection.invoke('SubscribeToSystemMetrics');
      await this.connection.invoke('SubscribeToServiceHealth');
      await this.connection.invoke('SubscribeToAlerts');
      console.log('Subscribed to all monitoring updates');
    } catch (error) {
      console.error('Failed to subscribe to monitoring updates:', error);
    }
  }

  /**
   * Request immediate metrics update
   */
  public async requestMetricsUpdate(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('Cannot request update - connection not ready');
      return;
    }

    try {
      await this.connection.invoke('RequestMetricsUpdate');
      console.log('Requested immediate metrics update');
    } catch (error) {
      console.error('Failed to request metrics update:', error);
    }
  }

  /**
   * Get connection count
   */
  public async getConnectionsCount(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('GetConnectionsCount');
    } catch (error) {
      console.error('Failed to get connections count:', error);
    }
  }

  /**
   * Register metrics update handler
   */
  public onMetricsUpdate(handler: (data: MonitoringMetricsUpdate) => void): void {
    this.metricsUpdateHandler = handler;
  }

  /**
   * Register alert handler
   */
  public onAlert(handler: (data: MonitoringAlert) => void): void {
    this.alertHandler = handler;
  }

  /**
   * Register Docker stats handler
   */
  public onDockerStatsUpdate(handler: (data: DockerStatsUpdate) => void): void {
    this.dockerStatsHandler = handler;
  }

  /**
   * Register connection state handler
   */
  public onConnectionStateChange(handler: (state: string) => void): void {
    this.connectionStateHandler = handler;
  }

  /**
   * Notify connection state change
   */
  private notifyConnectionState(state: string): void {
    if (this.connectionStateHandler) {
      this.connectionStateHandler(state);
    }
  }

  /**
   * Get current connection state
   */
  public getConnectionState(): string {
    if (!this.connection) {
      return 'disconnected';
    }

    switch (this.connection.state) {
      case signalR.HubConnectionState.Connected:
        return 'connected';
      case signalR.HubConnectionState.Connecting:
        return 'connecting';
      case signalR.HubConnectionState.Reconnecting:
        return 'reconnecting';
      case signalR.HubConnectionState.Disconnected:
      case signalR.HubConnectionState.Disconnecting:
      default:
        return 'disconnected';
    }
  }

  /**
   * Stop the SignalR connection
   */
  public async stop(): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      // Unsubscribe first
      if (this.connection.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke('UnsubscribeFromSystemMetrics');
      }

      // Stop connection
      await this.connection.stop();
      console.log('SignalR monitoring connection stopped');
      this.notifyConnectionState('disconnected');
    } catch (error) {
      console.error('Error stopping SignalR monitoring connection:', error);
    }
  }

  /**
   * Dispose the service
   */
  public async dispose(): Promise<void> {
    await this.stop();
    this.connection = null;
    this.metricsUpdateHandler = null;
    this.alertHandler = null;
    this.dockerStatsHandler = null;
    this.connectionStateHandler = null;
  }
}

// Export singleton instance
export const monitoringSignalRService = new MonitoringSignalRService();

export default monitoringSignalRService;