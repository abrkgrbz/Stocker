/**
 * Network IPC Handlers
 *
 * IPC bridge for network operations between renderer and main process.
 * Handles host/client mode switching, discovery, and session management.
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { PrismaClient } from '@prisma/client';
import { Result, AppError } from '../domain/common/result';
import {
  getNetworkManager,
  NetworkStatus,
  DiscoveredHost,
  NetworkConstants,
} from '../network';

// ============================================
// IPC Channel Names
// ============================================

const NetworkChannels = {
  // Status
  GET_STATUS: 'network:get-status',
  GET_ROLE: 'network:get-role',
  GET_LOCAL_IP: 'network:get-local-ip',

  // Host Mode
  START_AS_HOST: 'network:start-as-host',
  STOP_HOST: 'network:stop-host',
  GET_ACTIVE_SESSIONS: 'network:get-active-sessions',
  FORCE_DISCONNECT_USER: 'network:force-disconnect-user',

  // Client Mode
  START_DISCOVERY: 'network:start-discovery',
  STOP_DISCOVERY: 'network:stop-discovery',
  GET_DISCOVERED_HOSTS: 'network:get-discovered-hosts',
  CONNECT_TO_HOST: 'network:connect-to-host',
  AUTHENTICATE: 'network:authenticate',
  DISCONNECT: 'network:disconnect',

  // Actions
  EXECUTE_ACTION: 'network:execute-action',

  // Events (from main to renderer)
  ON_HOST_FOUND: 'network:on-host-found',
  ON_HOST_LOST: 'network:on-host-lost',
  ON_CONNECTED: 'network:on-connected',
  ON_DISCONNECTED: 'network:on-disconnected',
  ON_DATA_CHANGED: 'network:on-data-changed',
  ON_FORCE_LOGOUT: 'network:on-force-logout',
} as const;

// ============================================
// Handler Registration
// ============================================

export function registerNetworkHandlers(prisma: PrismaClient): void {
  console.log('[IPC] Registering network handlers...');

  const networkManager = getNetworkManager();
  networkManager.initialize(prisma);

  // ========================================
  // Status Handlers
  // ========================================

  ipcMain.handle(NetworkChannels.GET_STATUS, async (): Promise<NetworkStatus> => {
    return networkManager.getStatus();
  });

  ipcMain.handle(NetworkChannels.GET_ROLE, async (): Promise<string> => {
    return networkManager.getRole();
  });

  ipcMain.handle(NetworkChannels.GET_LOCAL_IP, async (): Promise<string> => {
    return networkManager.getLocalIP();
  });

  // ========================================
  // Host Mode Handlers
  // ========================================

  ipcMain.handle(
    NetworkChannels.START_AS_HOST,
    async (_event: IpcMainInvokeEvent, port?: number) => {
      try {
        const success = await networkManager.startAsHost(port || NetworkConstants.DEFAULT_PORT);

        if (success) {
          return Result.success({ port: port || NetworkConstants.DEFAULT_PORT }).toIpcResult();
        }

        return Result.failure(
          AppError.internal('Network.Host', 'Failed to start as host')
        ).toIpcResult();
      } catch (error) {
        return Result.failure(
          AppError.internal('Network.Host', error instanceof Error ? error.message : 'Unknown error')
        ).toIpcResult();
      }
    }
  );

  ipcMain.handle(NetworkChannels.STOP_HOST, async () => {
    try {
      await networkManager.reset();
      return Result.success().toIpcResult();
    } catch (error) {
      return Result.failure(
        AppError.internal('Network.Host', error instanceof Error ? error.message : 'Unknown error')
      ).toIpcResult();
    }
  });

  ipcMain.handle(NetworkChannels.GET_ACTIVE_SESSIONS, async () => {
    return {
      active: networkManager.getActiveSessions(),
      max: networkManager.getMaxSeats(),
    };
  });

  ipcMain.handle(
    NetworkChannels.FORCE_DISCONNECT_USER,
    async (_event: IpcMainInvokeEvent, userId: string) => {
      const success = networkManager.forceDisconnectUser(userId);
      return success
        ? Result.success().toIpcResult()
        : Result.failure(AppError.notFound('User', 'User not found or not connected')).toIpcResult();
    }
  );

  // ========================================
  // Discovery Handlers
  // ========================================

  ipcMain.handle(NetworkChannels.START_DISCOVERY, async () => {
    try {
      await networkManager.startDiscovery();
      return Result.success().toIpcResult();
    } catch (error) {
      return Result.failure(
        AppError.internal('Network.Discovery', error instanceof Error ? error.message : 'Unknown error')
      ).toIpcResult();
    }
  });

  ipcMain.handle(NetworkChannels.STOP_DISCOVERY, async () => {
    networkManager.stopDiscovery();
    return Result.success().toIpcResult();
  });

  ipcMain.handle(NetworkChannels.GET_DISCOVERED_HOSTS, async (): Promise<DiscoveredHost[]> => {
    return networkManager.getDiscoveredHosts();
  });

  // ========================================
  // Client Mode Handlers
  // ========================================

  ipcMain.handle(
    NetworkChannels.CONNECT_TO_HOST,
    async (_event: IpcMainInvokeEvent, host: DiscoveredHost) => {
      try {
        const success = await networkManager.startAsClient(host);

        if (success) {
          return Result.success({ host }).toIpcResult();
        }

        return Result.failure(
          AppError.internal('Network.Client', 'Failed to connect to host')
        ).toIpcResult();
      } catch (error) {
        return Result.failure(
          AppError.internal('Network.Client', error instanceof Error ? error.message : 'Unknown error')
        ).toIpcResult();
      }
    }
  );

  ipcMain.handle(
    NetworkChannels.AUTHENTICATE,
    async (_event: IpcMainInvokeEvent, credentials: { userId: string; password: string }) => {
      try {
        const response = await networkManager.authenticate(credentials.userId, credentials.password);

        if (response.success) {
          return Result.success({
            sessionId: response.sessionId,
            userId: response.userId,
            userName: response.userName,
            permissions: response.permissions,
          }).toIpcResult();
        }

        return Result.failure(
          AppError.unauthorized('Network.Auth', response.error || 'Authentication failed')
        ).toIpcResult();
      } catch (error) {
        return Result.failure(
          AppError.internal('Network.Auth', error instanceof Error ? error.message : 'Unknown error')
        ).toIpcResult();
      }
    }
  );

  ipcMain.handle(NetworkChannels.DISCONNECT, async () => {
    await networkManager.reset();
    return Result.success().toIpcResult();
  });

  // ========================================
  // Action Execution Handler
  // ========================================

  ipcMain.handle(
    NetworkChannels.EXECUTE_ACTION,
    async (
      _event: IpcMainInvokeEvent,
      params: { module: string; action: string; payload: unknown }
    ) => {
      try {
        const result = await networkManager.executeAction(
          params.module,
          params.action,
          params.payload
        );

        if (result.success) {
          return Result.success(result.data).toIpcResult();
        }

        return Result.failure(
          AppError.internal('Network.Action', result.error || 'Action failed')
        ).toIpcResult();
      } catch (error) {
        return Result.failure(
          AppError.internal('Network.Action', error instanceof Error ? error.message : 'Unknown error')
        ).toIpcResult();
      }
    }
  );

  // ========================================
  // Event Forwarding to Renderer
  // ========================================

  // These events will be sent to the renderer via webContents
  // The BrowserWindow instance needs to be passed to setup these

  console.log('[IPC] Network handlers registered');
}

/**
 * Setup network event forwarding to a BrowserWindow
 */
export function setupNetworkEventForwarding(webContents: Electron.WebContents): void {
  const networkManager = getNetworkManager();

  networkManager.on('host_found', (host: DiscoveredHost) => {
    webContents.send(NetworkChannels.ON_HOST_FOUND, host);
  });

  networkManager.on('host_lost', (host: DiscoveredHost) => {
    webContents.send(NetworkChannels.ON_HOST_LOST, host);
  });

  networkManager.on('connected_to_host', (host: DiscoveredHost) => {
    webContents.send(NetworkChannels.ON_CONNECTED, host);
  });

  networkManager.on('disconnected_from_host', (reason: string) => {
    webContents.send(NetworkChannels.ON_DISCONNECTED, reason);
  });

  networkManager.on('data_changed', (data: unknown) => {
    webContents.send(NetworkChannels.ON_DATA_CHANGED, data);
  });

  networkManager.on('force_logout', (data: unknown) => {
    webContents.send(NetworkChannels.ON_FORCE_LOGOUT, data);
  });
}

// Export channel names for use in preload
export { NetworkChannels };
