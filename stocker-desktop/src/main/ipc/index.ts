/**
 * IPC Handler Registration
 *
 * Central registration point for all IPC handlers
 */

import { PrismaClient } from '@prisma/client';
import { registerSalesHandlers } from './sales.ipc';
import { registerNetworkHandlers, setupNetworkEventForwarding, NetworkChannels } from './network.ipc';
// Import other handlers as they are created
// import { registerInventoryHandlers } from './inventory.ipc';
// import { registerCrmHandlers } from './crm.ipc';
// import { registerHrHandlers } from './hr.ipc';
import { registerAuthHandlers } from './auth.ipc';
import { registerSystemHandlers } from './system.ipc';

/**
 * Register all IPC handlers
 */
export function registerAllHandlers(prisma: PrismaClient): void {
  console.log('[IPC] Registering all handlers...');

  // Sales module
  registerSalesHandlers(prisma);

  // Network module (LAN multi-user)
  registerNetworkHandlers(prisma);

  // Inventory module (to be implemented)
  // registerInventoryHandlers(prisma);

  // CRM module (to be implemented)
  // registerCrmHandlers(prisma);

  // HR module (to be implemented)
  // registerHrHandlers(prisma);

  // Auth handlers
  registerAuthHandlers(prisma);

  // System handlers
  registerSystemHandlers(prisma);

  console.log('[IPC] All handlers registered');
}

// Re-export network event setup for use in main process
export { setupNetworkEventForwarding, NetworkChannels };
