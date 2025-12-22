/**
 * Session Manager - Manages active client sessions
 *
 * Tracks connected clients, enforces seat limits, and handles zombie cleanup.
 * Ported from specification: ActiveSessions Map with heartbeat-based eviction.
 */

import { EventEmitter } from 'events';
import {
  ClientSession,
  SessionInfo,
  NetworkConstants,
} from './types';
import { getLicenseManager } from '../security';
import { generateSecureId } from '../security/crypto';

// ============================================
// Session Manager Class
// ============================================

export class SessionManager extends EventEmitter {
  private sessions: Map<string, ClientSession> = new Map();
  private userSessions: Map<string, string> = new Map(); // userId -> sessionId
  private zombieKillerInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  // ============================================
  // Session Lifecycle
  // ============================================

  /**
   * Create a new session for a user
   * Returns null if seat limit reached or user already connected
   */
  createSession(
    userId: string,
    userName: string,
    ipAddress: string,
    machineName: string
  ): ClientSession | null {
    // Check if user already has an active session
    const existingSessionId = this.userSessions.get(userId);
    if (existingSessionId) {
      console.log(`[SessionManager] User ${userId} already has active session`);
      return null;
    }

    // Check seat limit
    if (!this.canAcceptNewSession()) {
      console.log('[SessionManager] Max seat limit reached');
      return null;
    }

    const sessionId = generateSecureId(32);
    const now = new Date();

    const session: ClientSession = {
      sessionId,
      userId,
      userName,
      ipAddress,
      machineName,
      connectedAt: now,
      lastHeartbeat: now,
      missedHeartbeats: 0,
    };

    this.sessions.set(sessionId, session);
    this.userSessions.set(userId, sessionId);

    console.log(`[SessionManager] Created session ${sessionId} for user ${userId} from ${ipAddress}`);
    this.emit('session:created', session);

    return session;
  }

  /**
   * Remove a session
   */
  removeSession(sessionId: string, reason: string = 'disconnected'): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    this.sessions.delete(sessionId);
    this.userSessions.delete(session.userId);

    console.log(`[SessionManager] Removed session ${sessionId} (${reason})`);
    this.emit('session:removed', session, reason);

    return true;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): ClientSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get session by user ID
   */
  getSessionByUserId(userId: string): ClientSession | undefined {
    const sessionId = this.userSessions.get(userId);
    if (!sessionId) return undefined;
    return this.sessions.get(sessionId);
  }

  /**
   * Validate session exists and is active
   */
  isValidSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Check if session has timed out
    const timeSinceHeartbeat = Date.now() - session.lastHeartbeat.getTime();
    return timeSinceHeartbeat < NetworkConstants.HEARTBEAT_TIMEOUT_MS;
  }

  // ============================================
  // Heartbeat Management
  // ============================================

  /**
   * Update heartbeat for a session
   */
  updateHeartbeat(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.lastHeartbeat = new Date();
    session.missedHeartbeats = 0;

    return true;
  }

  /**
   * Start the zombie killer interval
   * Checks for stale sessions and evicts them
   */
  startZombieKiller(): void {
    if (this.zombieKillerInterval) {
      return;
    }

    console.log('[SessionManager] Starting zombie killer');

    this.zombieKillerInterval = setInterval(() => {
      this.checkForZombies();
    }, NetworkConstants.HEARTBEAT_INTERVAL_MS);
  }

  /**
   * Stop the zombie killer
   */
  stopZombieKiller(): void {
    if (this.zombieKillerInterval) {
      clearInterval(this.zombieKillerInterval);
      this.zombieKillerInterval = null;
      console.log('[SessionManager] Stopped zombie killer');
    }
  }

  /**
   * Check for and evict zombie sessions
   */
  private checkForZombies(): void {
    const now = Date.now();
    const zombies: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      const timeSinceHeartbeat = now - session.lastHeartbeat.getTime();

      if (timeSinceHeartbeat >= NetworkConstants.HEARTBEAT_INTERVAL_MS) {
        session.missedHeartbeats++;

        if (session.missedHeartbeats >= NetworkConstants.MAX_MISSED_HEARTBEATS) {
          zombies.push(sessionId);
        } else {
          console.log(
            `[SessionManager] Session ${sessionId} missed ${session.missedHeartbeats} heartbeats`
          );
        }
      }
    }

    // Evict zombies
    for (const sessionId of zombies) {
      console.log(`[SessionManager] Evicting zombie session ${sessionId}`);
      this.removeSession(sessionId, 'heartbeat_timeout');
      this.emit('session:zombie', sessionId);
    }
  }

  // ============================================
  // Seat Management
  // ============================================

  /**
   * Check if we can accept a new session based on seat limit
   */
  canAcceptNewSession(): boolean {
    const maxSeats = this.getMaxSeats();
    const currentSessions = this.sessions.size;

    return currentSessions < maxSeats;
  }

  /**
   * Get the maximum allowed seats from license
   */
  getMaxSeats(): number {
    try {
      const licenseManager = getLicenseManager();
      return licenseManager.getMaxSeats();
    } catch {
      // Default to 1 if license not available
      return 1;
    }
  }

  /**
   * Get current session count
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get available seats
   */
  getAvailableSeats(): number {
    return Math.max(0, this.getMaxSeats() - this.sessions.size);
  }

  // ============================================
  // Session Information
  // ============================================

  /**
   * Get all active sessions
   */
  getAllSessions(): ClientSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get session info (safe for sharing)
   */
  getSessionInfoList(): SessionInfo[] {
    return this.getAllSessions().map((session) => ({
      sessionId: session.sessionId,
      userId: session.userId,
      userName: session.userName,
      connectedAt: session.connectedAt,
    }));
  }

  /**
   * Check if a user is currently connected
   */
  isUserConnected(userId: string): boolean {
    return this.userSessions.has(userId);
  }

  // ============================================
  // Admin Operations
  // ============================================

  /**
   * Force disconnect a user (admin action)
   */
  forceDisconnect(userId: string, reason: string = 'kicked_by_admin'): boolean {
    const sessionId = this.userSessions.get(userId);
    if (!sessionId) {
      return false;
    }

    this.emit('session:force_disconnect', sessionId, reason);
    return this.removeSession(sessionId, reason);
  }

  /**
   * Force disconnect all sessions (e.g., for server shutdown)
   */
  disconnectAll(reason: string = 'server_shutdown'): void {
    const sessionIds = Array.from(this.sessions.keys());

    for (const sessionId of sessionIds) {
      this.emit('session:force_disconnect', sessionId, reason);
      this.removeSession(sessionId, reason);
    }
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.stopZombieKiller();
    this.disconnectAll('cleanup');
    this.sessions.clear();
    this.userSessions.clear();
    this.removeAllListeners();
  }
}

// ============================================
// Singleton Instance
// ============================================

let sessionManagerInstance: SessionManager | null = null;

export function getSessionManager(): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager();
  }
  return sessionManagerInstance;
}

export function resetSessionManager(): void {
  if (sessionManagerInstance) {
    sessionManagerInstance.cleanup();
    sessionManagerInstance = null;
  }
}
