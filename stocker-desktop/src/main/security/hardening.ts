/**
 * Application Hardening
 *
 * Security measures to prevent reverse engineering, debugging,
 * and unauthorized access to the application.
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { createHash, randomBytes } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ============================================
// Types
// ============================================

interface IntegrityHash {
  file: string;
  hash: string;
}

// ============================================
// DevTools Prevention
// ============================================

/**
 * Block DevTools from opening
 */
export function blockDevTools(window: BrowserWindow): void {
  // Immediately close DevTools if opened
  window.webContents.on('devtools-opened', () => {
    window.webContents.closeDevTools();
    console.warn('[Security] DevTools blocked');
  });

  // Prevent opening via context menu
  window.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });
}

/**
 * Block dangerous keyboard shortcuts
 */
export function blockKeyboardShortcuts(window: BrowserWindow): void {
  window.webContents.on('before-input-event', (event, input) => {
    // Block DevTools shortcuts
    const blockedShortcuts = [
      // DevTools
      { key: 'F12', modifiers: [] },
      { key: 'I', modifiers: ['Control', 'Shift'] },
      { key: 'I', modifiers: ['Meta', 'Option'] }, // macOS
      { key: 'J', modifiers: ['Control', 'Shift'] },
      { key: 'C', modifiers: ['Control', 'Shift'] },
      { key: 'U', modifiers: ['Control'] }, // View source

      // Reload (prevent bypassing license check)
      { key: 'R', modifiers: ['Control'] },
      { key: 'R', modifiers: ['Meta'] }, // macOS
      { key: 'F5', modifiers: [] },
      { key: 'F5', modifiers: ['Control'] },

      // Navigation that could bypass security
      { key: 'L', modifiers: ['Control'] }, // Focus URL bar (not applicable but safe)
    ];

    for (const shortcut of blockedShortcuts) {
      const keyMatch = input.key.toUpperCase() === shortcut.key.toUpperCase();
      const modifiersMatch =
        shortcut.modifiers.length === 0 ||
        shortcut.modifiers.every((mod) => {
          switch (mod) {
            case 'Control':
              return input.control;
            case 'Shift':
              return input.shift;
            case 'Alt':
              return input.alt;
            case 'Meta':
              return input.meta;
            case 'Option':
              return input.alt; // macOS Option = Alt
            default:
              return false;
          }
        });

      if (keyMatch && modifiersMatch) {
        event.preventDefault();
        console.log(`[Security] Blocked shortcut: ${shortcut.key}`);
        return;
      }
    }
  });
}

// ============================================
// File Integrity Verification
// ============================================

// Pre-computed hashes of critical files (update during build)
const CRITICAL_FILE_HASHES: IntegrityHash[] = [
  // These will be populated during build process
  // { file: 'main.js', hash: 'sha256-...' },
  // { file: 'preload.js', hash: 'sha256-...' },
];

/**
 * Verify integrity of critical files
 */
export function verifyFileIntegrity(): { valid: boolean; failedFiles: string[] } {
  const failedFiles: string[] = [];

  for (const { file, hash } of CRITICAL_FILE_HASHES) {
    const filePath = join(__dirname, file);

    if (!existsSync(filePath)) {
      failedFiles.push(file);
      continue;
    }

    try {
      const content = readFileSync(filePath);
      const actualHash = 'sha256-' + createHash('sha256').update(content).digest('base64');

      if (actualHash !== hash) {
        failedFiles.push(file);
      }
    } catch {
      failedFiles.push(file);
    }
  }

  return {
    valid: failedFiles.length === 0,
    failedFiles,
  };
}

/**
 * Generate integrity hashes for build process
 * Run this during build to generate CRITICAL_FILE_HASHES
 */
export function generateIntegrityHashes(files: string[]): IntegrityHash[] {
  return files.map((file) => {
    const content = readFileSync(file);
    const hash = 'sha256-' + createHash('sha256').update(content).digest('base64');
    return { file, hash };
  });
}

// ============================================
// Anti-Debugging
// ============================================

/**
 * Basic anti-debugging measures
 * Note: These can be bypassed by determined attackers but raise the bar
 */
export function enableAntiDebugging(): void {
  // Detect if running under debugger by timing
  const startTime = Date.now();
  // eslint-disable-next-line no-debugger
  debugger; // This statement takes longer if debugger is attached
  const endTime = Date.now();

  if (endTime - startTime > 100) {
    console.error('[Security] Debugger detected');
    // Take action: exit, alert, etc.
    // For now, just log
  }

  // Periodically check for DevTools
  setInterval(() => {
    const devToolsOpened = false; // Hard to detect reliably in Electron

    if (devToolsOpened) {
      console.error('[Security] DevTools detected');
    }
  }, 5000);
}

// ============================================
// Memory Protection
// ============================================

/**
 * Clear sensitive data from memory
 */
export function clearSensitiveData(data: Buffer | string): void {
  if (Buffer.isBuffer(data)) {
    data.fill(0);
  }
  // For strings, we can't really clear them due to V8 string immutability
  // Best practice: use Buffers for sensitive data
}

/**
 * Generate secure random token that's harder to predict
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

// ============================================
// Production Mode Enforcement
// ============================================

/**
 * Enforce production mode settings
 */
export function enforceProductionMode(): void {
  if (process.env.NODE_ENV !== 'development') {
    // Disable Node.js integration in renderer
    app.on('web-contents-created', (_, contents) => {
      // Block navigation to external URLs
      contents.on('will-navigate', (event, url) => {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'file:') {
          event.preventDefault();
          console.warn(`[Security] Blocked navigation to: ${url}`);
        }
      });

      // Block new window creation
      contents.setWindowOpenHandler(() => {
        return { action: 'deny' };
      });
    });

    // Note: Remote module events are deprecated in Electron 35+
    // The remote module is disabled by default in newer Electron versions
    // Security is enforced through webPreferences in BrowserWindow creation:
    // - nodeIntegration: false
    // - contextIsolation: true
    // - sandbox: false (or true for maximum security)
  }
}

// ============================================
// Tamper Detection
// ============================================

let tamperDetected = false;

/**
 * Report tamper detection
 */
export function reportTamper(reason: string): void {
  tamperDetected = true;
  console.error(`[Security] TAMPER DETECTED: ${reason}`);

  // Log to audit
  // Send to server (if online)
  // Show warning to user

  dialog.showErrorBox(
    'Security Alert',
    'Application integrity check failed. Please reinstall the application from the official source.'
  );
}

/**
 * Check if tamper was detected
 */
export function wasTamperDetected(): boolean {
  return tamperDetected;
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize all hardening measures
 */
export function initializeHardening(mainWindow: BrowserWindow): void {
  console.log('[Security] Initializing hardening...');

  // Only apply hardening in production
  if (process.env.NODE_ENV === 'production') {
    blockDevTools(mainWindow);
    blockKeyboardShortcuts(mainWindow);
    enforceProductionMode();

    // Verify file integrity
    const integrity = verifyFileIntegrity();
    if (!integrity.valid) {
      reportTamper(`Corrupted files: ${integrity.failedFiles.join(', ')}`);
    }

    console.log('[Security] Hardening enabled');
  } else {
    console.log('[Security] Development mode - hardening disabled');
  }
}
