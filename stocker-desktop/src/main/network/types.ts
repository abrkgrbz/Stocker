/**
 * Network Types - Shared types for LAN Host/Client communication
 *
 * Defines the protocol for multi-user LAN architecture
 */

// ============================================
// Session Types
// ============================================

export interface ClientSession {
  sessionId: string;
  userId: string;
  userName: string;
  ipAddress: string;
  machineName: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  missedHeartbeats: number;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  userName: string;
  connectedAt: Date;
}

// ============================================
// Connection Types
// ============================================

export type NetworkRole = 'host' | 'client' | 'standalone';

export interface NetworkStatus {
  role: NetworkRole;
  isConnected: boolean;
  hostAddress?: string;
  hostPort?: number;
  sessionId?: string;
  activeSessions: number;
  maxSessions: number;
}

export interface HostInfo {
  hostId: string;
  hostName: string;
  address: string;
  port: number;
  version: string;
  activeSessions: number;
  maxSessions: number;
}

// ============================================
// Protocol Messages
// ============================================

export interface AuthRequest {
  userId: string;
  password: string;
  machineName: string;
}

export interface AuthResponse {
  success: boolean;
  sessionId?: string;
  userId?: string;
  userName?: string;
  permissions?: string[];
  error?: string;
  errorCode?: AuthErrorCode;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'MAX_SEATS_REACHED'
  | 'USER_ALREADY_CONNECTED'
  | 'LICENSE_EXPIRED'
  | 'SERVER_ERROR';

export interface HeartbeatRequest {
  sessionId: string;
  timestamp: number;
}

export interface HeartbeatResponse {
  success: boolean;
  serverTime: number;
}

// ============================================
// Action Types (Client -> Host)
// ============================================

export interface ActionRequest<T = unknown> {
  id: string;
  sessionId: string;
  action: string;
  module: string;
  payload: T;
  timestamp: number;
}

export interface ActionResponse<T = unknown> {
  id: string;
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================
// Event Types (Host -> Client)
// ============================================

export interface ServerEvent<T = unknown> {
  type: ServerEventType;
  data: T;
  timestamp: number;
}

export type ServerEventType =
  | 'DATA_CHANGED'
  | 'USER_CONNECTED'
  | 'USER_DISCONNECTED'
  | 'LICENSE_WARNING'
  | 'SERVER_SHUTDOWN'
  | 'FORCE_LOGOUT';

export interface DataChangedEvent {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  changedBy: string;
}

export interface UserConnectionEvent {
  userId: string;
  userName: string;
  action: 'connected' | 'disconnected';
}

export interface LicenseWarningEvent {
  type: 'expiring' | 'seats_full';
  message: string;
  daysRemaining?: number;
}

export interface ForceLogoutEvent {
  reason: 'session_expired' | 'kicked_by_admin' | 'license_revoked' | 'server_shutdown';
  message: string;
}

// ============================================
// Discovery Types (mDNS)
// ============================================

export interface DiscoveredHost {
  hostId: string;
  hostName: string;
  address: string;
  port: number;
  version: string;
  discovered: Date;
}

// ============================================
// Socket Events
// ============================================

export const SocketEvents = {
  // Client -> Server
  AUTH: 'auth',
  HEARTBEAT: 'heartbeat',
  ACTION: 'action',
  DISCONNECT: 'disconnect',

  // Server -> Client
  AUTH_RESPONSE: 'auth:response',
  HEARTBEAT_RESPONSE: 'heartbeat:response',
  ACTION_RESPONSE: 'action:response',
  SERVER_EVENT: 'server:event',

  // Connection
  CONNECT: 'connect',
  CONNECT_ERROR: 'connect_error',
  CONNECTION: 'connection',
} as const;

// ============================================
// Constants
// ============================================

export const NetworkConstants = {
  DEFAULT_PORT: 3847,
  HEARTBEAT_INTERVAL_MS: 10000, // 10 seconds
  HEARTBEAT_TIMEOUT_MS: 30000, // 30 seconds (3 missed heartbeats)
  MAX_MISSED_HEARTBEATS: 3,
  MDNS_SERVICE_TYPE: '_stocker._tcp',
  MDNS_SERVICE_NAME: 'stocker-host',
  PROTOCOL_VERSION: '1.0.0',
} as const;
