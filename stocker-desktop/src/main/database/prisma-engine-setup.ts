/**
 * Prisma Engine Setup for Packaged Electron App
 * 
 * This module must be imported BEFORE PrismaClient is created.
 * It sets up the correct paths for Prisma's query engine in packaged apps.
 */

import { app } from 'electron';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Configure Prisma query engine path for packaged Electron app.
 * In development, Prisma uses default paths.
 * In production (packaged), we need to point to extraResources.
 */
export function configurePrismaEngines(): void {
  // Check if we're running in a packaged app
  const isPackaged = app.isPackaged;

  if (isPackaged) {
    // In packaged app, Prisma engines are in resources folder
    const resourcesPath = process.resourcesPath;

    // Set the query engine path
    const enginePath = join(resourcesPath, 'node_modules', '@prisma', 'engines', 'query_engine-windows.dll.node');

    if (existsSync(enginePath)) {
      // Set environment variable for Prisma to find the engine
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
      console.log('[Database] Prisma engine path set:', enginePath);
    } else {
      console.warn('[Database] Prisma engine not found at:', enginePath);
    }

    // Also set the schema path
    const schemaPath = join(resourcesPath, 'prisma', 'schema.prisma');
    if (existsSync(schemaPath)) {
      process.env.PRISMA_SCHEMA_PATH = schemaPath;
      console.log('[Database] Prisma schema path set:', schemaPath);
    }
  }
}

// Auto-configure when this module is imported
configurePrismaEngines();
