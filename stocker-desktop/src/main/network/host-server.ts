/**
 * Host Server - Socket.io server for LAN multi-user architecture
 *
 * The first PC to open the DB becomes the Host.
 * Manages client connections, enforces seat limits, and proxies database operations.
 *
 * Ported from specification: HostServer.ts
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import {
  NetworkConstants,
  SocketEvents,
  AuthRequest,
  AuthResponse,
  AuthErrorCode,
  HeartbeatRequest,
  HeartbeatResponse,
  ActionRequest,
  ActionResponse,
  ServerEvent,
  ServerEventType,
  HostInfo,
  NetworkStatus,
  DataChangedEvent,
  UserConnectionEvent,
  ForceLogoutEvent,
} from './types';
import { getSessionManager, SessionManager } from './session-manager';
import { getLicenseManager } from '../security';
import { getAuditLogger } from '../security/audit-logger';
import { sha256 } from '../security/crypto';

// ============================================
// Host Server Class
// ============================================

export class HostServer extends EventEmitter {
  private httpServer: HttpServer | null = null;
  private io: SocketIOServer | null = null;
  private sessionManager: SessionManager;
  private prisma: PrismaClient;
  private isRunning = false;
  private hostId: string;
  private hostName: string;
  private port: number;

  // Socket -> SessionId mapping
  private socketSessions: Map<string, string> = new Map();

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
    this.sessionManager = getSessionManager();
    this.hostId = this.generateHostId();
    this.hostName = this.getHostName();
    this.port = NetworkConstants.DEFAULT_PORT;

    this.setupSessionManagerEvents();
  }

  // ============================================
  // Server Lifecycle
  // ============================================

  /**
   * Start the host server
   */
  async start(port: number = NetworkConstants.DEFAULT_PORT): Promise<boolean> {
    if (this.isRunning) {
      console.log('[HostServer] Already running');
      return true;
    }

    try {
      this.port = port;

      // Create HTTP server
      this.httpServer = createServer();

      // Create Socket.IO server
      this.io = new SocketIOServer(this.httpServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
        pingTimeout: NetworkConstants.HEARTBEAT_TIMEOUT_MS,
        pingInterval: NetworkConstants.HEARTBEAT_INTERVAL_MS,
      });

      // Setup event handlers
      this.setupSocketHandlers();

      // Start listening
      await new Promise<void>((resolve, reject) => {
        this.httpServer!.listen(port, () => {
          console.log(`[HostServer] Started on port ${port}`);
          resolve();
        });

        this.httpServer!.on('error', (err) => {
          console.error('[HostServer] Failed to start:', err);
          reject(err);
        });
      });

      // Start zombie killer
      this.sessionManager.startZombieKiller();

      this.isRunning = true;
      this.emit('started', this.getHostInfo());

      // Log audit event
      const auditLogger = getAuditLogger(this.prisma);
      await auditLogger.log({
        userId: 'system',
        userName: 'System',
        action: 'DATA_EXPORT',
        entityType: 'HOST_SERVER',
        entityId: this.hostId,
        description: `Host server started on port ${port}`,
        oldValues: null,
        newValues: { port, hostId: this.hostId },
      });

      return true;
    } catch (error) {
      console.error('[HostServer] Start failed:', error);
      await this.stop();
      return false;
    }
  }

  /**
   * Stop the host server
   */
  async stop(): Promise<void> {
    if (!this.isRunning && !this.io) {
      return;
    }

    console.log('[HostServer] Stopping...');

    // Notify all clients
    this.broadcastEvent('SERVER_SHUTDOWN', {
      reason: 'server_shutdown',
      message: 'Host server is shutting down',
    } as ForceLogoutEvent);

    // Stop zombie killer
    this.sessionManager.stopZombieKiller();

    // Disconnect all sessions
    this.sessionManager.disconnectAll('server_shutdown');

    // Close socket.io
    if (this.io) {
      await new Promise<void>((resolve) => {
        this.io!.close(() => resolve());
      });
      this.io = null;
    }

    // Close HTTP server
    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer!.close(() => resolve());
      });
      this.httpServer = null;
    }

    this.socketSessions.clear();
    this.isRunning = false;

    console.log('[HostServer] Stopped');
    this.emit('stopped');
  }

  // ============================================
  // Socket Event Handlers
  // ============================================

  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on(SocketEvents.CONNECTION, (socket: Socket) => {
      console.log(`[HostServer] New connection from ${socket.handshake.address}`);

      // Authentication handler
      socket.on(SocketEvents.AUTH, async (data: AuthRequest) => {
        await this.handleAuth(socket, data);
      });

      // Heartbeat handler
      socket.on(SocketEvents.HEARTBEAT, (data: HeartbeatRequest) => {
        this.handleHeartbeat(socket, data);
      });

      // Action handler
      socket.on(SocketEvents.ACTION, async (data: ActionRequest) => {
        await this.handleAction(socket, data);
      });

      // Disconnect handler
      socket.on(SocketEvents.DISCONNECT, (reason) => {
        this.handleDisconnect(socket, reason);
      });
    });
  }

  /**
   * Handle client authentication
   */
  private async handleAuth(socket: Socket, data: AuthRequest): Promise<void> {
    const { userId, password, machineName } = data;
    const ipAddress = socket.handshake.address;

    console.log(`[HostServer] Auth request from ${userId} at ${ipAddress}`);

    try {
      // Check license status
      const licenseManager = getLicenseManager();
      const licenseStatus = await licenseManager.loadLicense();

      if (!licenseStatus.isValid) {
        this.sendAuthResponse(socket, {
          success: false,
          error: 'License is not valid',
          errorCode: 'LICENSE_EXPIRED',
        });
        return;
      }

      // Check if user already connected
      if (this.sessionManager.isUserConnected(userId)) {
        this.sendAuthResponse(socket, {
          success: false,
          error: 'User is already connected from another device',
          errorCode: 'USER_ALREADY_CONNECTED',
        });
        return;
      }

      // Check seat limit
      if (!this.sessionManager.canAcceptNewSession()) {
        const maxSeats = this.sessionManager.getMaxSeats();
        this.sendAuthResponse(socket, {
          success: false,
          error: `Maximum user limit (${maxSeats}) reached. Please upgrade your license.`,
          errorCode: 'MAX_SEATS_REACHED',
        });
        return;
      }

      // Verify credentials
      const user = await this.verifyCredentials(userId, password);
      if (!user) {
        this.sendAuthResponse(socket, {
          success: false,
          error: 'Invalid username or password',
          errorCode: 'INVALID_CREDENTIALS',
        });
        return;
      }

      // Create session
      const session = this.sessionManager.createSession(
        user.id,
        user.name,
        ipAddress,
        machineName
      );

      if (!session) {
        this.sendAuthResponse(socket, {
          success: false,
          error: 'Failed to create session',
          errorCode: 'SERVER_ERROR',
        });
        return;
      }

      // Map socket to session
      this.socketSessions.set(socket.id, session.sessionId);

      // Join user to their room
      socket.join(`user:${user.id}`);

      // Send success response
      this.sendAuthResponse(socket, {
        success: true,
        sessionId: session.sessionId,
        userId: user.id,
        userName: user.name,
        permissions: this.getUserPermissions(user),
      });

      // Broadcast user connected event
      this.broadcastEvent('USER_CONNECTED', {
        userId: user.id,
        userName: user.name,
        action: 'connected',
      } as UserConnectionEvent);

      // Log audit event
      const auditLogger = getAuditLogger(this.prisma);
      await auditLogger.log({
        userId: user.id,
        userName: user.name,
        action: 'USER_LOGIN',
        entityType: 'SESSION',
        entityId: session.sessionId,
        description: `User logged in from ${ipAddress}`,
        oldValues: null,
        newValues: { ipAddress, machineName },
      });

      console.log(`[HostServer] User ${user.name} authenticated successfully`);
    } catch (error) {
      console.error('[HostServer] Auth error:', error);
      this.sendAuthResponse(socket, {
        success: false,
        error: 'Authentication failed',
        errorCode: 'SERVER_ERROR',
      });
    }
  }

  /**
   * Handle heartbeat
   */
  private handleHeartbeat(socket: Socket, data: HeartbeatRequest): void {
    const sessionId = this.socketSessions.get(socket.id);

    if (!sessionId || sessionId !== data.sessionId) {
      socket.emit(SocketEvents.HEARTBEAT_RESPONSE, {
        success: false,
        serverTime: Date.now(),
      } as HeartbeatResponse);
      return;
    }

    const updated = this.sessionManager.updateHeartbeat(sessionId);

    socket.emit(SocketEvents.HEARTBEAT_RESPONSE, {
      success: updated,
      serverTime: Date.now(),
    } as HeartbeatResponse);
  }

  /**
   * Handle action request
   */
  private async handleAction(socket: Socket, data: ActionRequest): Promise<void> {
    const sessionId = this.socketSessions.get(socket.id);

    if (!sessionId || sessionId !== data.sessionId) {
      this.sendActionResponse(socket, data.id, {
        id: data.id,
        success: false,
        error: { code: 'INVALID_SESSION', message: 'Invalid session' },
      });
      return;
    }

    // Validate session
    if (!this.sessionManager.isValidSession(sessionId)) {
      this.sendActionResponse(socket, data.id, {
        id: data.id,
        success: false,
        error: { code: 'SESSION_EXPIRED', message: 'Session has expired' },
      });
      return;
    }

    try {
      // Execute action through action handler
      const result = await this.executeAction(data);
      this.sendActionResponse(socket, data.id, result);
    } catch (error) {
      console.error('[HostServer] Action error:', error);
      this.sendActionResponse(socket, data.id, {
        id: data.id,
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Action execution failed',
        },
      });
    }
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(socket: Socket, reason: string): void {
    const sessionId = this.socketSessions.get(socket.id);

    if (sessionId) {
      const session = this.sessionManager.getSession(sessionId);

      if (session) {
        // Broadcast user disconnected
        this.broadcastEvent('USER_DISCONNECTED', {
          userId: session.userId,
          userName: session.userName,
          action: 'disconnected',
        } as UserConnectionEvent);

        // Log audit event
        const auditLogger = getAuditLogger(this.prisma);
        auditLogger.log({
          userId: session.userId,
          userName: session.userName,
          action: 'USER_LOGOUT',
          entityType: 'SESSION',
          entityId: sessionId,
          description: `User disconnected: ${reason}`,
          oldValues: null,
          newValues: { reason },
        });
      }

      this.sessionManager.removeSession(sessionId, reason);
      this.socketSessions.delete(socket.id);
    }

    console.log(`[HostServer] Client disconnected: ${reason}`);
  }

  // ============================================
  // Session Manager Events
  // ============================================

  private setupSessionManagerEvents(): void {
    this.sessionManager.on('session:force_disconnect', (sessionId: string, reason: string) => {
      // Find socket for this session
      for (const [socketId, sessId] of this.socketSessions) {
        if (sessId === sessionId) {
          const socket = this.io?.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit(SocketEvents.SERVER_EVENT, {
              type: 'FORCE_LOGOUT',
              data: {
                reason: reason as ForceLogoutEvent['reason'],
                message: this.getForceLogoutMessage(reason),
              },
              timestamp: Date.now(),
            } as ServerEvent<ForceLogoutEvent>);
            socket.disconnect(true);
          }
          this.socketSessions.delete(socketId);
          break;
        }
      }
    });

    this.sessionManager.on('session:zombie', (sessionId: string) => {
      console.log(`[HostServer] Zombie session evicted: ${sessionId}`);
    });
  }

  private getForceLogoutMessage(reason: string): string {
    switch (reason) {
      case 'kicked_by_admin':
        return 'You have been disconnected by an administrator';
      case 'license_revoked':
        return 'License has been revoked';
      case 'server_shutdown':
        return 'Server is shutting down';
      case 'heartbeat_timeout':
        return 'Connection timed out';
      default:
        return 'Session ended';
    }
  }

  // ============================================
  // Action Execution
  // ============================================

  /**
   * Execute an action request
   * This is the main entry point for client operations
   */
  private async executeAction(request: ActionRequest): Promise<ActionResponse> {
    const { id, action, module, payload } = request;
    const session = this.sessionManager.getSession(request.sessionId);

    if (!session) {
      return {
        id,
        success: false,
        error: { code: 'INVALID_SESSION', message: 'Session not found' },
      };
    }

    // TODO: Implement action routing to service handlers
    // For now, return a placeholder response
    console.log(`[HostServer] Executing action: ${module}.${action}`);

    // Emit action for external handlers
    this.emit('action', request, session);

    return {
      id,
      success: true,
      data: { message: 'Action received', action: `${module}.${action}` },
    };
  }

  // ============================================
  // Credential Verification
  // ============================================

  /**
   * Verify user credentials against database
   */
  private async verifyCredentials(
    userId: string,
    password: string
  ): Promise<{ id: string; name: string; role: string } | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: userId }, { email: userId }],
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          role: true,
        },
      });

      if (!user || !user.passwordHash) {
        return null;
      }

      // Verify password hash
      // Note: In production, use bcrypt.compare
      const hashedPassword = sha256(password);
      if (hashedPassword !== user.passwordHash) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      console.error('[HostServer] Credential verification failed:', error);
      return null;
    }
  }

  /**
   * Get user permissions based on role
   */
  private getUserPermissions(user: { id: string; role: string }): string[] {
    // TODO: Implement role-based permissions
    const rolePermissions: Record<string, string[]> = {
      ADMIN: ['*'],
      MANAGER: ['sales', 'inventory', 'reports', 'users:read'],
      CASHIER: ['sales', 'inventory:read'],
      WORKER: ['inventory'],
    };

    return rolePermissions[user.role] || [];
  }

  // ============================================
  // Broadcasting
  // ============================================

  /**
   * Broadcast an event to all connected clients
   */
  broadcastEvent<T>(type: ServerEventType, data: T): void {
    if (!this.io) return;

    const event: ServerEvent<T> = {
      type,
      data,
      timestamp: Date.now(),
    };

    this.io.emit(SocketEvents.SERVER_EVENT, event);
  }

  /**
   * Broadcast data change to all clients
   */
  broadcastDataChange(change: DataChangedEvent): void {
    this.broadcastEvent('DATA_CHANGED', change);
  }

  /**
   * Send event to specific user
   */
  sendToUser<T>(userId: string, type: ServerEventType, data: T): void {
    if (!this.io) return;

    const event: ServerEvent<T> = {
      type,
      data,
      timestamp: Date.now(),
    };

    this.io.to(`user:${userId}`).emit(SocketEvents.SERVER_EVENT, event);
  }

  // ============================================
  // Response Helpers
  // ============================================

  private sendAuthResponse(socket: Socket, response: AuthResponse): void {
    socket.emit(SocketEvents.AUTH_RESPONSE, response);
  }

  private sendActionResponse(socket: Socket, requestId: string, response: ActionResponse): void {
    socket.emit(SocketEvents.ACTION_RESPONSE, response);
  }

  // ============================================
  // Host Info
  // ============================================

  private generateHostId(): string {
    // Generate based on machine characteristics
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `host-${timestamp}-${random}`;
  }

  private getHostName(): string {
    try {
      const os = require('os');
      return os.hostname() || 'Stocker Host';
    } catch {
      return 'Stocker Host';
    }
  }

  /**
   * Get host info for discovery
   */
  getHostInfo(): HostInfo {
    return {
      hostId: this.hostId,
      hostName: this.hostName,
      address: '0.0.0.0', // Will be replaced by actual IP
      port: this.port,
      version: NetworkConstants.PROTOCOL_VERSION,
      activeSessions: this.sessionManager.getActiveSessionCount(),
      maxSessions: this.sessionManager.getMaxSeats(),
    };
  }

  /**
   * Get network status
   */
  getNetworkStatus(): NetworkStatus {
    return {
      role: 'host',
      isConnected: this.isRunning,
      hostAddress: '0.0.0.0',
      hostPort: this.port,
      activeSessions: this.sessionManager.getActiveSessionCount(),
      maxSessions: this.sessionManager.getMaxSeats(),
    };
  }

  /**
   * Check if server is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get the port the server is running on
   */
  getPort(): number {
    return this.port;
  }
}

// ============================================
// Singleton Instance
// ============================================

let hostServerInstance: HostServer | null = null;

export function getHostServer(prisma: PrismaClient): HostServer {
  if (!hostServerInstance) {
    hostServerInstance = new HostServer(prisma);
  }
  return hostServerInstance;
}

export function resetHostServer(): void {
  if (hostServerInstance) {
    hostServerInstance.stop();
    hostServerInstance = null;
  }
}
