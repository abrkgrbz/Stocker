/**
 * LAN Client - Socket.io client for connecting to Host
 *
 * Clients detect the Host via mDNS, connect via Socket.io,
 * and send Actions via the socket. Clients DO NOT touch the SQLite DB directly.
 *
 * Ported from specification: Client Mode
 */

import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';
import {
  NetworkConstants,
  SocketEvents,
  AuthRequest,
  AuthResponse,
  HeartbeatRequest,
  HeartbeatResponse,
  ActionRequest,
  ActionResponse,
  ServerEvent,
  NetworkStatus,
  DiscoveredHost,
} from './types';
import { generateSecureId } from '../security/crypto';

// ============================================
// Pending Action Type
// ============================================

interface PendingAction {
  resolve: (response: ActionResponse) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

// ============================================
// LAN Client Class
// ============================================

export class LANClient extends EventEmitter {
  private socket: Socket | null = null;
  private sessionId: string | null = null;
  private userId: string | null = null;
  private userName: string | null = null;
  private permissions: string[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pendingActions: Map<string, PendingAction> = new Map();
  private hostInfo: DiscoveredHost | null = null;
  private isConnected = false;
  private isAuthenticated = false;

  constructor() {
    super();
  }

  // ============================================
  // Connection Lifecycle
  // ============================================

  /**
   * Connect to a host server
   */
  async connect(host: DiscoveredHost): Promise<boolean> {
    if (this.socket?.connected) {
      console.log('[LANClient] Already connected');
      return true;
    }

    return new Promise((resolve) => {
      try {
        this.hostInfo = host;
        const url = `http://${host.address}:${host.port}`;

        console.log(`[LANClient] Connecting to ${url}...`);

        this.socket = io(url, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        this.setupSocketHandlers();

        // Wait for connection
        const timeout = setTimeout(() => {
          console.error('[LANClient] Connection timeout');
          this.disconnect();
          resolve(false);
        }, 15000);

        this.socket.on(SocketEvents.CONNECT, () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('[LANClient] Connected to host');
          this.emit('connected', host);
          resolve(true);
        });

        this.socket.on(SocketEvents.CONNECT_ERROR, (error) => {
          clearTimeout(timeout);
          console.error('[LANClient] Connection error:', error.message);
          this.emit('connection_error', error);
          resolve(false);
        });
      } catch (error) {
        console.error('[LANClient] Connect error:', error);
        resolve(false);
      }
    });
  }

  /**
   * Disconnect from host
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.clearPendingActions();

    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
    }

    this.sessionId = null;
    this.userId = null;
    this.userName = null;
    this.permissions = [];
    this.isConnected = false;
    this.isAuthenticated = false;

    console.log('[LANClient] Disconnected');
    this.emit('disconnected');
  }

  // ============================================
  // Authentication
  // ============================================

  /**
   * Authenticate with the host
   */
  async authenticate(userId: string, password: string): Promise<AuthResponse> {
    if (!this.socket?.connected) {
      return {
        success: false,
        error: 'Not connected to host',
        errorCode: 'SERVER_ERROR',
      };
    }

    return new Promise((resolve) => {
      const machineName = this.getMachineName();

      const request: AuthRequest = {
        userId,
        password,
        machineName,
      };

      // Set timeout
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          error: 'Authentication timeout',
          errorCode: 'SERVER_ERROR',
        });
      }, 30000);

      // Listen for response
      this.socket!.once(SocketEvents.AUTH_RESPONSE, (response: AuthResponse) => {
        clearTimeout(timeout);

        if (response.success) {
          this.sessionId = response.sessionId || null;
          this.userId = response.userId || null;
          this.userName = response.userName || null;
          this.permissions = response.permissions || [];
          this.isAuthenticated = true;

          // Start heartbeat
          this.startHeartbeat();

          console.log(`[LANClient] Authenticated as ${this.userName}`);
          this.emit('authenticated', response);
        } else {
          console.log(`[LANClient] Authentication failed: ${response.error}`);
          this.emit('auth_failed', response);
        }

        resolve(response);
      });

      // Send auth request
      this.socket!.emit(SocketEvents.AUTH, request);
    });
  }

  // ============================================
  // Heartbeat
  // ============================================

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      return;
    }

    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, NetworkConstants.HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private sendHeartbeat(): void {
    if (!this.socket?.connected || !this.sessionId) {
      return;
    }

    const request: HeartbeatRequest = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    this.socket.emit(SocketEvents.HEARTBEAT, request);
  }

  // ============================================
  // Action Execution
  // ============================================

  /**
   * Execute an action on the host
   */
  async executeAction<TPayload = unknown, TResult = unknown>(
    module: string,
    action: string,
    payload: TPayload
  ): Promise<ActionResponse<TResult>> {
    if (!this.socket?.connected || !this.sessionId) {
      return {
        id: '',
        success: false,
        error: { code: 'NOT_CONNECTED', message: 'Not connected to host' },
      };
    }

    if (!this.isAuthenticated) {
      return {
        id: '',
        success: false,
        error: { code: 'NOT_AUTHENTICATED', message: 'Not authenticated' },
      };
    }

    const requestId = generateSecureId(16);

    const request: ActionRequest<TPayload> = {
      id: requestId,
      sessionId: this.sessionId,
      action,
      module,
      payload,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      // Set timeout for response
      const timeout = setTimeout(() => {
        this.pendingActions.delete(requestId);
        resolve({
          id: requestId,
          success: false,
          error: { code: 'TIMEOUT', message: 'Action timeout' },
        });
      }, 30000);

      // Store pending action
      this.pendingActions.set(requestId, {
        resolve: (response) => resolve(response as ActionResponse<TResult>),
        reject,
        timeout,
      });

      // Send action
      this.socket!.emit(SocketEvents.ACTION, request);
    });
  }

  // ============================================
  // Socket Event Handlers
  // ============================================

  private setupSocketHandlers(): void {
    if (!this.socket) return;

    // Heartbeat response
    this.socket.on(SocketEvents.HEARTBEAT_RESPONSE, (response: HeartbeatResponse) => {
      if (!response.success) {
        console.warn('[LANClient] Heartbeat failed, session may be invalid');
        this.emit('session_invalid');
      }
    });

    // Action response
    this.socket.on(SocketEvents.ACTION_RESPONSE, (response: ActionResponse) => {
      const pending = this.pendingActions.get(response.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingActions.delete(response.id);
        pending.resolve(response);
      }
    });

    // Server events
    this.socket.on(SocketEvents.SERVER_EVENT, (event: ServerEvent) => {
      this.handleServerEvent(event);
    });

    // Disconnect
    this.socket.on(SocketEvents.DISCONNECT, (reason) => {
      console.log(`[LANClient] Disconnected: ${reason}`);
      this.isConnected = false;
      this.isAuthenticated = false;
      this.stopHeartbeat();
      this.emit('disconnected', reason);
    });

    // Reconnection
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`[LANClient] Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;

      // Re-authenticate if we had a session
      if (this.sessionId) {
        this.emit('reconnected');
      }
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[LANClient] Reconnection failed');
      this.emit('reconnect_failed');
    });
  }

  /**
   * Handle server events
   */
  private handleServerEvent(event: ServerEvent): void {
    console.log(`[LANClient] Server event: ${event.type}`);

    switch (event.type) {
      case 'DATA_CHANGED':
        this.emit('data_changed', event.data);
        break;

      case 'USER_CONNECTED':
        this.emit('user_connected', event.data);
        break;

      case 'USER_DISCONNECTED':
        this.emit('user_disconnected', event.data);
        break;

      case 'LICENSE_WARNING':
        this.emit('license_warning', event.data);
        break;

      case 'SERVER_SHUTDOWN':
        console.log('[LANClient] Server shutting down');
        this.emit('server_shutdown', event.data);
        this.disconnect();
        break;

      case 'FORCE_LOGOUT':
        console.log('[LANClient] Force logout:', event.data);
        this.emit('force_logout', event.data);
        this.disconnect();
        break;
    }
  }

  // ============================================
  // Helpers
  // ============================================

  private getMachineName(): string {
    try {
      const os = require('os');
      return os.hostname() || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private clearPendingActions(): void {
    for (const [id, pending] of this.pendingActions) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    }
    this.pendingActions.clear();
  }

  // ============================================
  // Status Methods
  // ============================================

  /**
   * Get connection status
   */
  getStatus(): NetworkStatus {
    return {
      role: 'client',
      isConnected: this.isConnected && this.isAuthenticated,
      hostAddress: this.hostInfo?.address,
      hostPort: this.hostInfo?.port,
      sessionId: this.sessionId || undefined,
      activeSessions: 0,
      maxSessions: 0,
    };
  }

  /**
   * Check if connected
   */
  isConnectedToHost(): boolean {
    return this.isConnected;
  }

  /**
   * Check if authenticated
   */
  isAuthenticatedWithHost(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Get current user name
   */
  getUserName(): string | null {
    return this.userName;
  }

  /**
   * Get user permissions
   */
  getPermissions(): string[] {
    return [...this.permissions];
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    if (this.permissions.includes('*')) {
      return true;
    }
    return this.permissions.includes(permission);
  }

  /**
   * Get host info
   */
  getHostInfo(): DiscoveredHost | null {
    return this.hostInfo;
  }
}

// ============================================
// Singleton Instance
// ============================================

let lanClientInstance: LANClient | null = null;

export function getLANClient(): LANClient {
  if (!lanClientInstance) {
    lanClientInstance = new LANClient();
  }
  return lanClientInstance;
}

export function resetLANClient(): void {
  if (lanClientInstance) {
    lanClientInstance.disconnect();
    lanClientInstance = null;
  }
}
