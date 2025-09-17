import * as signalR from "@microsoft/signalr";
import { message } from 'antd';

import { API_BASE_URL, TOKEN_KEY } from '@/config/constants';

class MasterDashboardService {
  private dashboardConnection: signalR.HubConnection | null = null;
  private baseUrl: string = API_BASE_URL;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Start Dashboard Connection
  async startDashboardConnection(): Promise<void> {
    // Check if already connected
    if (this.dashboardConnection?.state === signalR.HubConnectionState.Connected) {
            return;
    }

    // Get token for authentication
    const token = localStorage.getItem(TOKEN_KEY);
    
        this.dashboardConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/master-dashboard`, {
        transport: signalR.HttpTransportType.WebSockets | 
                  signalR.HttpTransportType.ServerSentEvents | 
                  signalR.HttpTransportType.LongPolling,
        accessTokenFactory: () => token || '',
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.elapsedMilliseconds < 60000) {
            // Reconnect every 5 seconds for the first minute
            return 5000;
          } else if (retryContext.elapsedMilliseconds < 300000) {
            // Then every 30 seconds for 5 minutes
            return 30000;
          } else {
            // Stop reconnecting after 5 minutes
            return null;
          }
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Setup event handlers
    this.setupEventHandlers();

    try {
      await this.dashboardConnection.start();
            this.reconnectAttempts = 0;
    } catch (err) {
      // Error handling removed for production
      throw err;
    }
  }

  private setupEventHandlers(): void {
    if (!this.dashboardConnection) return;

    // Connection lifecycle events
    this.dashboardConnection.onreconnecting((error) => {
      // Error handling removed for production
      message.warning('Bağlantı yeniden kuruluyor...', 2);
    });

    this.dashboardConnection.onreconnected((connectionId) => {
            message.success('Bağlantı yeniden kuruldu', 2);
      this.reconnectAttempts = 0;
    });

    this.dashboardConnection.onclose(async (error) => {
      // Error handling removed for production
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        message.info(`Bağlantı koptu, yeniden deneniyor... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, 3);
        
        setTimeout(async () => {
          try {
            await this.startDashboardConnection();
          } catch (err) {
            // Error handling removed for production
          }
        }, 5000);
      } else {
        message.error('Bağlantı kurulamadı, lütfen sayfayı yenileyin', 0);
      }
    });
  }

  // Real-time event handlers
  onStatsUpdated(callback: (stats: DashboardStats) => void): void {
    this.dashboardConnection?.on("StatsUpdated", callback);
  }

  onNewTenant(callback: (tenant: TenantInfo) => void): void {
    this.dashboardConnection?.on("NewTenantCreated", callback);
  }

  onTenantUpdated(callback: (tenant: TenantInfo) => void): void {
    this.dashboardConnection?.on("TenantUpdated", callback);
  }

  onTenantDeleted(callback: (tenantId: string) => void): void {
    this.dashboardConnection?.on("TenantDeleted", callback);
  }

  onNewActivity(callback: (activity: Activity) => void): void {
    this.dashboardConnection?.on("NewActivity", callback);
  }

  onRevenueUpdated(callback: (revenue: RevenueData) => void): void {
    this.dashboardConnection?.on("RevenueUpdated", callback);
  }

  onSystemHealthChanged(callback: (health: SystemHealth) => void): void {
    this.dashboardConnection?.on("SystemHealthChanged", callback);
  }

  onAlertReceived(callback: (alert: SystemAlert) => void): void {
    this.dashboardConnection?.on("AlertReceived", callback);
  }

  // Join dashboard room for real-time updates
  async joinDashboardRoom(): Promise<void> {
    if (!this.dashboardConnection || this.dashboardConnection.state !== signalR.HubConnectionState.Connected) {
      await this.startDashboardConnection();
    }
    return this.dashboardConnection!.invoke("JoinDashboardRoom");
  }

  // Leave dashboard room
  async leaveDashboardRoom(): Promise<void> {
    if (this.dashboardConnection?.state === signalR.HubConnectionState.Connected) {
      return this.dashboardConnection.invoke("LeaveDashboardRoom");
    }
  }

  // Request immediate refresh
  async requestRefresh(): Promise<void> {
    if (!this.dashboardConnection || this.dashboardConnection.state !== signalR.HubConnectionState.Connected) {
      await this.startDashboardConnection();
    }
    return this.dashboardConnection!.invoke("RequestRefresh");
  }

  // Cleanup
  async stopConnection(): Promise<void> {
    if (this.dashboardConnection) {
      await this.leaveDashboardRoom();
      await this.dashboardConnection.stop();
      this.dashboardConnection = null;
    }
  }

  // Connection state check
  isConnected(): boolean {
    return this.dashboardConnection?.state === signalR.HubConnectionState.Connected;
  }

  getConnectionState(): string {
    return this.dashboardConnection?.state || 'Disconnected';
  }
}

// Types
export interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  systemHealth: SystemHealth;
}

export interface TenantInfo {
  id: string;
  name: string;
  code: string;
  plan: string;
  status: string;
  userCount: number;
  revenue: number;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: 'success' | 'info' | 'warning' | 'error';
  userId?: string;
  tenantId?: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  tenants: number;
  growth: number;
}

export interface SystemHealth {
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
  activeConnections: number;
  status: 'healthy' | 'degraded' | 'critical';
}

export interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  actionRequired: boolean;
}

// Export singleton instance
const masterDashboardService = new MasterDashboardService();
export default masterDashboardService;