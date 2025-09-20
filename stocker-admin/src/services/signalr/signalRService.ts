import * as signalR from '@microsoft/signalr';
import { tokenStorage } from '../../utils/tokenStorage';
import { errorService } from '../errorService';

export interface SignalRConnectionState {
  isConnected: boolean;
  connectionId: string | null;
  reconnectAttempts: number;
  lastError: string | null;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export interface TenantStatusUpdate {
  tenantId: string;
  tenantName: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  timestamp: Date;
}

export interface DashboardUpdate {
  type: 'stats' | 'revenue' | 'tenants' | 'users';
  data: any;
  timestamp: Date;
}

export interface UserActivity {
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: Date;
}

class SignalRService {
  private notificationHub: signalR.HubConnection | null = null;
  private validationHub: signalR.HubConnection | null = null;
  private chatHub: signalR.HubConnection | null = null;
  
  private connectionState: SignalRConnectionState = {
    isConnected: false,
    connectionId: null,
    reconnectAttempts: 0,
    lastError: null,
  };

  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds

  constructor() {
    this.initializeHubs();
  }

  private getBaseUrl(): string {
    return import.meta.env.VITE_API_URL || 'http://localhost:5104';
  }

  private initializeHubs() {
    const baseUrl = this.getBaseUrl();
    const token = tokenStorage.getToken();

    // Initialize Notification Hub
    this.notificationHub = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/notification`, {
        accessTokenFactory: () => token || '',
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Initialize Validation Hub (for real-time validation)
    this.validationHub = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/validation`, {
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Initialize Chat Hub (for support chat)
    this.chatHub = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/chat`, {
        accessTokenFactory: () => token || '',
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Notification Hub Events
    if (this.notificationHub) {
      // Connection events
      this.notificationHub.onreconnecting(() => {
        console.log('🔄 SignalR: Reconnecting to notification hub...');
        this.updateConnectionState({ isConnected: false });
        this.emit('reconnecting');
      });

      this.notificationHub.onreconnected((connectionId) => {
        console.log('✅ SignalR: Reconnected to notification hub', connectionId);
        this.updateConnectionState({ 
          isConnected: true, 
          connectionId,
          reconnectAttempts: 0 
        });
        this.emit('reconnected');
      });

      this.notificationHub.onclose((error) => {
        console.error('❌ SignalR: Connection closed', error);
        this.updateConnectionState({ 
          isConnected: false,
          lastError: error?.toString() 
        });
        this.emit('disconnected');
        this.attemptReconnect();
      });

      // Message handlers
      this.notificationHub.on('ReceiveNotification', (notification: NotificationMessage) => {
        console.log('📬 Notification received:', notification);
        this.emit('notification', notification);
      });

      this.notificationHub.on('TenantStatusChanged', (update: TenantStatusUpdate) => {
        console.log('🏢 Tenant status changed:', update);
        this.emit('tenantStatusChanged', update);
      });

      this.notificationHub.on('DashboardUpdate', (update: DashboardUpdate) => {
        console.log('📊 Dashboard update:', update);
        this.emit('dashboardUpdate', update);
      });

      this.notificationHub.on('UserActivity', (activity: UserActivity) => {
        console.log('👤 User activity:', activity);
        this.emit('userActivity', activity);
      });

      this.notificationHub.on('SystemAlert', (alert: any) => {
        console.log('🚨 System alert:', alert);
        this.emit('systemAlert', alert);
      });
    }

    // Validation Hub Events
    if (this.validationHub) {
      this.validationHub.on('ValidationResult', (result: any) => {
        console.log('✓ Validation result:', result);
        this.emit('validationResult', result);
      });
    }

    // Chat Hub Events
    if (this.chatHub) {
      this.chatHub.on('ReceiveMessage', (user: string, message: string) => {
        console.log('💬 Chat message:', { user, message });
        this.emit('chatMessage', { user, message });
      });

      this.chatHub.on('UserJoined', (user: string) => {
        console.log('👋 User joined chat:', user);
        this.emit('userJoined', user);
      });

      this.chatHub.on('UserLeft', (user: string) => {
        console.log('👋 User left chat:', user);
        this.emit('userLeft', user);
      });
    }
  }

  private updateConnectionState(updates: Partial<SignalRConnectionState>) {
    this.connectionState = { ...this.connectionState, ...updates };
    this.emit('connectionStateChanged', this.connectionState);
  }

  private attemptReconnect() {
    if (this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ SignalR: Max reconnection attempts reached');
      this.emit('reconnectFailed');
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.connectionState.reconnectAttempts++;
      console.log(`🔄 SignalR: Reconnection attempt ${this.connectionState.reconnectAttempts}`);
      this.connect();
    }, this.reconnectDelay * Math.pow(2, this.connectionState.reconnectAttempts));
  }

  // Public methods
  async connect(): Promise<void> {
    try {
      // Start Notification Hub
      if (this.notificationHub && this.notificationHub.state === signalR.HubConnectionState.Disconnected) {
        await this.notificationHub.start();
        this.connectionState.connectionId = this.notificationHub.connectionId || null;
        console.log('✅ SignalR: Notification Hub connected', this.connectionState.connectionId);
      }

      // Start Validation Hub (optional, only if needed)
      if (this.validationHub && this.validationHub.state === signalR.HubConnectionState.Disconnected) {
        await this.validationHub.start();
        console.log('✅ SignalR: Validation Hub connected');
      }

      // Start Chat Hub (optional, only if needed)
      // await this.chatHub?.start();

      this.updateConnectionState({ 
        isConnected: true,
        reconnectAttempts: 0,
        lastError: null 
      });
      
      this.emit('connected');
    } catch (error) {
      console.error('❌ SignalR: Connection failed', error);
      errorService.handleError(error);
      this.updateConnectionState({ 
        isConnected: false,
        lastError: error?.toString() 
      });
      this.attemptReconnect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      await Promise.all([
        this.notificationHub?.stop(),
        this.validationHub?.stop(),
        this.chatHub?.stop(),
      ]);
      
      this.updateConnectionState({ 
        isConnected: false,
        connectionId: null 
      });
      
      console.log('🔌 SignalR: Disconnected');
      this.emit('disconnected');
    } catch (error) {
      console.error('❌ SignalR: Disconnect error', error);
    }
  }

  // Event emitter methods
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in SignalR event handler for ${event}:`, error);
      }
    });
  }

  // Hub method invocations
  async sendNotification(userId: string, notification: Partial<NotificationMessage>): Promise<void> {
    if (!this.notificationHub || this.notificationHub.state !== signalR.HubConnectionState.Connected) {
      throw new Error('NotificationHub is not connected');
    }
    
    await this.notificationHub.invoke('SendNotificationToUser', userId, notification);
  }

  async broadcastNotification(notification: Partial<NotificationMessage>): Promise<void> {
    if (!this.notificationHub || this.notificationHub.state !== signalR.HubConnectionState.Connected) {
      throw new Error('NotificationHub is not connected');
    }
    
    await this.notificationHub.invoke('BroadcastNotification', notification);
  }

  async joinTenantGroup(tenantId: string): Promise<void> {
    if (!this.notificationHub || this.notificationHub.state !== signalR.HubConnectionState.Connected) {
      throw new Error('NotificationHub is not connected');
    }
    
    await this.notificationHub.invoke('JoinTenantGroup', tenantId);
  }

  async leaveTenantGroup(tenantId: string): Promise<void> {
    if (!this.notificationHub || this.notificationHub.state !== signalR.HubConnectionState.Connected) {
      throw new Error('NotificationHub is not connected');
    }
    
    await this.notificationHub.invoke('LeaveTenantGroup', tenantId);
  }

  async validateField(field: string, value: any): Promise<void> {
    if (!this.validationHub || this.validationHub.state !== signalR.HubConnectionState.Connected) {
      // Fallback to API validation
      return;
    }
    
    await this.validationHub.invoke('ValidateField', field, value);
  }

  async sendChatMessage(message: string): Promise<void> {
    if (!this.chatHub || this.chatHub.state !== signalR.HubConnectionState.Connected) {
      throw new Error('ChatHub is not connected');
    }
    
    await this.chatHub.invoke('SendMessage', message);
  }

  // Getters
  getConnectionState(): SignalRConnectionState {
    return { ...this.connectionState };
  }

  isConnected(): boolean {
    return this.connectionState.isConnected;
  }

  getConnectionId(): string | null {
    return this.connectionState.connectionId;
  }
}

// Create singleton instance
export const signalRService = new SignalRService();

// Auto-connect when module is imported
if (typeof window !== 'undefined') {
  // Only auto-connect in browser environment
  signalRService.connect().catch(error => {
    console.error('Initial SignalR connection failed:', error);
  });
}