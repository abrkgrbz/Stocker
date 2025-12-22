/**
 * Preload Script Entry Point
 *
 * This script runs in a sandboxed context with access to
 * both Node.js and DOM APIs. It exposes a secure API bridge
 * to the renderer process via contextBridge.
 */

// Import and execute the API bridge setup
import './api';

console.log('[Preload] API bridge initialized');
