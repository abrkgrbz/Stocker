/**
 * Network Manager - Coordinates Host/Client mode and network operations
 *
 * Manages the transition between standalone, host, and client modes.
 * Provides a unified interface for network operations.
 */

import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import {
  NetworkRole,
  NetworkStatus,
  DiscoveredHost,
  NetworkConstants,
  AuthResponse,
} from './types';
import { HostServer, getHostServer, resetHostServer } from './host-server';
import { LANClient, getLANClient, resetLANClient } from './lan-client';
import { DiscoveryService, getDiscoveryService, resetDiscoveryService } from './discovery';
import { getSessionManager } from './session-manager';

// ============================================
// Network Manager Class
// ============================================

export class NetworkManager extends EventEmitter {
  private role: NetworkRole = 'standalone';
  private hostServer: HostServer | null = null;
  private lanClient: LANClient | null = null;
  private discoveryService: DiscoveryService;
  private prisma: PrismaClient | null = null;
  private isInitialized = false;

  constructor() {
    super();
    this.discoveryService = getDiscoveryService();
    this.setupDiscoveryEvents();
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize the network manager
   */
  initialize(prisma: PrismaClient): void {
    if (this.isInitialized) {
      return;
    }

    this.prisma = prisma;
    this.isInitialized = true;

    console.log('[NetworkManager] Initialized');
  }

  // ============================================
  // Role Management
  // ============================================

  /**
   * Start as host (first PC to open DB)
   */
  async startAsHost(port: number = NetworkConstants.DEFAULT_PORT): Promise<boolean> {
    if (!this.prisma) {
      console.error('[NetworkManager] Not initialized');
      return false;
    }

    if (this.role !== 'standalone') {
      console.log('[NetworkManager] Already in network mode');
      return false;
    }

    try {
      // Create and start host server
      this.hostServer = getHostServer(this.prisma);
      const started = await this.hostServer.start(port);

      if (!started) {
        console.error('[NetworkManager] Failed to start host server');
        return false;
      }

      // Setup host events
      this.setupHostEvents();

      // Start advertising on the network
      const hostInfo = this.hostServer.getHostInfo();
      hostInfo.address = this.discoveryService.getLocalIP();

      await this.discoveryService.startAdvertising(hostInfo);

      this.role = 'host';
      this.emit('role_changed', 'host');

      console.log(`[NetworkManager] Started as host at ${hostInfo.address}:${port}`);
      return true;
    } catch (error) {
      console.error('[NetworkManager] Failed to start as host:', error);
      await this.reset();
      return false;
    }
  }

  /**
   * Start as client (connect to existing host)
   */
  async startAsClient(host: DiscoveredHost): Promise<boolean> {
    if (this.role !== 'standalone') {
      console.log('[NetworkManager] Already in network mode');
      return false;
    }

    try {
      this.lanClient = getLANClient();
      this.setupClientEvents();

      const connected = await this.lanClient.connect(host);

      if (!connected) {
        console.error('[NetworkManager] Failed to connect to host');
        return false;
      }

      this.role = 'client';
      this.emit('role_changed', 'client');

      console.log(`[NetworkManager] Connected to host at ${host.address}:${host.port}`);
      return true;
    } catch (error) {
      console.error('[NetworkManager] Failed to start as client:', error);
      await this.reset();
      return false;
    }
  }

  /**
   * Authenticate with the host (client mode only)
   */
  async authenticate(userId: string, password: string): Promise<AuthResponse> {
    if (this.role !== 'client' || !this.lanClient) {
      return {
        success: false,
        error: 'Not in client mode',
        errorCode: 'SERVER_ERROR',
      };
    }

    return this.lanClient.authenticate(userId, password);
  }

  /**
   * Reset to standalone mode
   */
  async reset(): Promise<void> {
    console.log('[NetworkManager] Resetting to standalone mode');

    // Stop host server
    if (this.hostServer) {
      await this.hostServer.stop();
      resetHostServer();
      this.hostServer = null;
    }

    // Disconnect client
    if (this.lanClient) {
      this.lanClient.disconnect();
      resetLANClient();
      this.lanClient = null;
    }

    // Stop discovery
    this.discoveryService.stopAdvertising();
    this.discoveryService.stopBrowsing();

    this.role = 'standalone';
    this.emit('role_changed', 'standalone');
  }

  // ============================================
  // Discovery
  // ============================================

  /**
   * Start browsing for hosts
   */
  async startDiscovery(): Promise<void> {
    await this.discoveryService.startBrowsing();
  }

  /**
   * Stop browsing for hosts
   */
  stopDiscovery(): void {
    this.discoveryService.stopBrowsing();
  }

  /**
   * Get discovered hosts
   */
  getDiscoveredHosts(): DiscoveredHost[] {
    return this.discoveryService.getDiscoveredHosts();
  }

  // ============================================
  // Event Handlers
  // ============================================

  private setupDiscoveryEvents(): void {
    this.discoveryService.on('host_found', (host: DiscoveredHost) => {
      this.emit('host_found', host);
    });

    this.discoveryService.on('host_lost', (host: DiscoveredHost) => {
      this.emit('host_lost', host);
    });
  }

  private setupHostEvents(): void {
    if (!this.hostServer) return;

    this.hostServer.on('started', () => {
      this.emit('host_started');
    });

    this.hostServer.on('stopped', () => {
      this.emit('host_stopped');
    });

    this.hostServer.on('action', (request, session) => {
      this.emit('action_received', request, session);
    });
  }

  private setupClientEvents(): void {
    if (!this.lanClient) return;

    this.lanClient.on('connected', (host: DiscoveredHost) => {
      this.emit('connected_to_host', host);
    });

    this.lanClient.on('disconnected', (reason: string) => {
      this.emit('disconnected_from_host', reason);
      // Reset to standalone if disconnected
      this.role = 'standalone';
      this.lanClient = null;
    });

    this.lanClient.on('authenticated', (response: AuthResponse) => {
      this.emit('authenticated', response);
    });

    this.lanClient.on('auth_failed', (response: AuthResponse) => {
      this.emit('auth_failed', response);
    });

    this.lanClient.on('data_changed', (data) => {
      this.emit('data_changed', data);
    });

    this.lanClient.on('force_logout', (data) => {
      this.emit('force_logout', data);
    });

    this.lanClient.on('server_shutdown', (data) => {
      this.emit('server_shutdown', data);
      this.role = 'standalone';
      this.lanClient = null;
    });
  }

  // ============================================
  // Status
  // ============================================

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    if (this.role === 'host' && this.hostServer) {
      return this.hostServer.getNetworkStatus();
    }

    if (this.role === 'client' && this.lanClient) {
      return this.lanClient.getStatus();
    }

    return {
      role: 'standalone',
      isConnected: false,
      activeSessions: 0,
      maxSessions: 1,
    };
  }

  /**
   * Get current role
   */
  getRole(): NetworkRole {
    return this.role;
  }

  /**
   * Check if in host mode
   */
  isHost(): boolean {
    return this.role === 'host';
  }

  /**
   * Check if in client mode
   */
  isClient(): boolean {
    return this.role === 'client';
  }

  /**
   * Check if in standalone mode
   */
  isStandalone(): boolean {
    return this.role === 'standalone';
  }

  /**
   * Get local IP address
   */
  getLocalIP(): string {
    return this.discoveryService.getLocalIP();
  }

  /**
   * Get all local IPs
   */
  getAllLocalIPs(): string[] {
    return this.discoveryService.getAllLocalIPs();
  }

  // ============================================
  // Action Execution
  // ============================================

  /**
   * Execute an action (routes to host or local based on mode)
   */
  async executeAction<TPayload = unknown, TResult = unknown>(
    module: string,
    action: string,
    payload: TPayload
  ): Promise<{ success: boolean; data?: TResult; error?: string }> {
    if (this.role === 'client' && this.lanClient) {
      // Route through LAN client
      const response = await this.lanClient.executeAction<TPayload, TResult>(
        module,
        action,
        payload
      );

      return {
        success: response.success,
        data: response.data,
        error: response.error?.message,
      };
    }

    // In host or standalone mode, execute locally
    // This will be handled by the service layer
    return {
      success: false,
      error: 'Local execution not implemented - use service layer directly',
    };
  }

  // ============================================
  // Host Operations (Host mode only)
  // ============================================

  /**
   * Get active sessions (host mode only)
   */
  getActiveSessions(): number {
    if (this.role !== 'host') {
      return 0;
    }
    return getSessionManager().getActiveSessionCount();
  }

  /**
   * Get max seats (host mode only)
   */
  getMaxSeats(): number {
    if (this.role !== 'host') {
      return 1;
    }
    return getSessionManager().getMaxSeats();
  }

  /**
   * Force disconnect a user (host mode only)
   */
  forceDisconnectUser(userId: string): boolean {
    if (this.role !== 'host') {
      return false;
    }
    return getSessionManager().forceDisconnect(userId, 'kicked_by_admin');
  }

  /**
   * Broadcast a data change event (host mode only)
   */
  broadcastDataChange(entityType: string, entityId: string, action: 'create' | 'update' | 'delete', changedBy: string): void {
    if (this.role !== 'host' || !this.hostServer) {
      return;
    }

    this.hostServer.broadcastDataChange({
      entityType,
      entityId,
      action,
      changedBy,
    });
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Cleanup all resources
   */
  async cleanup(): Promise<void> {
    await this.reset();
    resetDiscoveryService();
    this.removeAllListeners();
    this.isInitialized = false;
  }
}

// ============================================
// Singleton Instance
// ============================================

let networkManagerInstance: NetworkManager | null = null;

export function getNetworkManager(): NetworkManager {
  if (!networkManagerInstance) {
    networkManagerInstance = new NetworkManager();
  }
  return networkManagerInstance;
}

export function resetNetworkManager(): void {
  if (networkManagerInstance) {
    networkManagerInstance.cleanup();
    networkManagerInstance = null;
  }
}
