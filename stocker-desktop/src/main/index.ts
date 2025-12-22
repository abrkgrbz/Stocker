/**
 * Stocker Desktop - Main Process Entry Point
 *
 * This is the Electron main process that:
 * - Creates the application window
 * - Verifies license and initializes encrypted database
 * - Registers all IPC handlers
 * - Applies security hardening
 * - Manages application lifecycle
 */

import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'fs';
import { registerAllHandlers } from './ipc';

// Security imports
import {
  getLicenseManager,
  getDatabaseManager,
  initializeHardening,
  getAdminModeManager,
  getAuditLogger,
  isLicenseForceUnlocked,
} from './security';

// ============================================
// Demo Mode Configuration
// ============================================

// Enable demo mode for testing without license
// Set to false for production release
const DEMO_MODE = true;

// ============================================
// Application State
// ============================================

let isLicenseValid = false;
let isDatabaseReady = false;
let demoPrisma: PrismaClient | null = null;

// ============================================
// Window Management
// ============================================

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    title: 'Stocker',
    // Disable frame in production for custom titlebar
    frame: is.dev,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      // Disable web security only in development
      webSecurity: !is.dev,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Initialize security hardening in production
  if (!is.dev) {
    initializeHardening(mainWindow);
  }

  // Initialize admin mode manager
  const adminManager = getAdminModeManager();
  adminManager.initialize(mainWindow);

  // Load the renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// ============================================
// Demo Mode Database
// ============================================

async function initializeDemoDatabase(): Promise<PrismaClient | null> {
  try {
    console.log('[App] Initializing demo database...');

    const dbPath = join(app.getPath('userData'), 'stocker-demo.db');
    console.log('[App] Demo database path:', dbPath);

    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${dbPath}`,
        },
      },
      log: ['error', 'warn'],
    });

    await prisma.$connect();
    console.log('[App] Demo database connected successfully');

    demoPrisma = prisma;
    isDatabaseReady = true;
    isLicenseValid = true;

    return prisma;
  } catch (error) {
    console.error('[App] Demo database initialization failed:', error);
    return null;
  }
}

// ============================================
// License Verification
// ============================================

async function verifyLicenseAndDatabase(): Promise<boolean> {
  // Demo mode - skip license verification
  if (DEMO_MODE) {
    console.log('[App] Running in DEMO MODE - License check skipped');
    const prisma = await initializeDemoDatabase();
    return prisma !== null;
  }

  const licenseManager = getLicenseManager();
  const dbManager = getDatabaseManager();

  console.log('[App] Verifying license...');

  // Check for force unlock (admin override)
  if (isLicenseForceUnlocked()) {
    console.log('[App] License force unlocked by admin');
    isLicenseValid = true;
  } else {
    // Normal license verification
    const licenseStatus = await licenseManager.loadLicense();

    if (!licenseStatus.isValid) {
      console.error('[App] License validation failed:', licenseStatus.error);

      // Show appropriate dialog
      if (!licenseStatus.isMachineMatch) {
        dialog.showErrorBox(
          'License Error',
          'This license is bound to a different machine. Please contact support.'
        );
      } else if (licenseStatus.isExpired) {
        dialog.showErrorBox(
          'License Expired',
          'Your license has expired. Please renew to continue using the application.'
        );
      } else {
        dialog.showErrorBox(
          'License Required',
          licenseStatus.error || 'Please activate your license to use this application.'
        );
      }

      return false;
    }

    isLicenseValid = true;
    console.log('[App] License valid. Days remaining:', licenseStatus.daysRemaining);

    // Warn if expiring soon
    if (licenseStatus.daysRemaining <= 30 && licenseStatus.daysRemaining > 0) {
      dialog.showMessageBox({
        type: 'warning',
        title: 'License Expiring Soon',
        message: `Your license will expire in ${licenseStatus.daysRemaining} days.`,
        detail: 'Please contact your administrator to renew.',
      });
    }
  }

  // Initialize encrypted database
  console.log('[App] Initializing encrypted database...');
  const dbStatus = await dbManager.initialize();

  if (!dbStatus.isOpen) {
    console.error('[App] Database initialization failed:', dbStatus.error);
    dialog.showErrorBox(
      'Database Error',
      dbStatus.error || 'Failed to open the database. The database may be corrupted or the license is incorrect.'
    );
    return false;
  }

  isDatabaseReady = true;
  console.log('[App] Database initialized successfully');

  return true;
}

// ============================================
// Window Control IPC
// ============================================

function registerWindowControls(): void {
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow?.close();
  });
}

// ============================================
// Application Lifecycle
// ============================================

app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.stocker.desktop');

  // Watch for shortcuts in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Verify license and initialize database
  const isReady = await verifyLicenseAndDatabase();

  if (!isReady) {
    // In development, allow running without license for testing
    if (is.dev) {
      console.log('[App] Development mode: Continuing without valid license');
    } else {
      // In production, show activation window or exit
      console.log('[App] License/database initialization failed. Showing activation screen.');
      // TODO: Create and show activation window
      // For now, we'll still create the main window to show activation UI
    }
  }

  // Get database client (if available)
  let prisma: PrismaClient | null = null;

  if (DEMO_MODE && demoPrisma) {
    prisma = demoPrisma;
  } else {
    const dbManager = getDatabaseManager();
    prisma = dbManager.isReady() ? dbManager.getClient() : null;
  }

  // Register IPC handlers
  registerWindowControls();
  if (prisma) {
    registerAllHandlers(prisma);

    // Initialize audit logger (skip in demo mode for simplicity)
    if (!DEMO_MODE) {
      const auditLogger = getAuditLogger(prisma);
      await auditLogger.initialize();

      // Log application start
      await auditLogger.log({
        userId: 'system',
        userName: 'System',
        action: 'USER_LOGIN',
        entityType: 'APPLICATION',
        entityId: 'startup',
        description: 'Application started',
        oldValues: null,
        newValues: { timestamp: new Date().toISOString() },
      });
    } else {
      console.log('[App] Demo mode - audit logging skipped');
    }
  }

  // Create the main window
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup on app quit
app.on('will-quit', async () => {
  console.log('[App] Cleaning up...');

  // Cleanup admin mode
  const adminManager = getAdminModeManager();
  await adminManager.cleanup();

  // Demo mode cleanup
  if (DEMO_MODE && demoPrisma) {
    await demoPrisma.$disconnect();
    console.log('[App] Demo database disconnected');
  } else {
    // Log application shutdown
    const dbManager = getDatabaseManager();
    if (dbManager.isReady()) {
      const auditLogger = getAuditLogger(dbManager.getClient());
      await auditLogger.log({
        userId: 'system',
        userName: 'System',
        action: 'USER_LOGOUT',
        entityType: 'APPLICATION',
        entityId: 'shutdown',
        description: 'Application shutdown',
        oldValues: null,
        newValues: { timestamp: new Date().toISOString() },
      });

      // Close database connection
      await dbManager.close();
    }
  }

  console.log('[App] Cleanup complete');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[App] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[App] Unhandled rejection:', reason);
});
