import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';
import { IpcResult } from '../domain/common/result';

export function registerSystemHandlers(prisma: PrismaClient): void {
    // ============================================
    // Initialization
    // ============================================

    ipcMain.handle('system:initialize', async (_event, payload): Promise<IpcResult<unknown>> => {
        console.log('[System] Initializing with payload:', payload);
        try {
            // TODO: Implement actual DB initialization
            // 1. Save Company Info
            // 2. Create Admin User
            // 3. Mark setup as complete

            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            return { isSuccess: true, value: { success: true } };
        } catch (error) {
            console.error('[System] Init failed:', error);
            return {
                isSuccess: false,
                error: {
                    code: 'InitFailed',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    type: 'Internal'
                }
            };
        }
    });

    // ============================================
    // License
    // ============================================

    ipcMain.handle('license:verify', async (_event, payload): Promise<IpcResult<unknown>> => {
        console.log('[License] Verifying key:', payload);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock success for any key
        return { isSuccess: true, value: { valid: true, type: 'Enterprise', expiresAt: '2025-12-31' } };
    });

    ipcMain.handle('license:status', async (_event): Promise<IpcResult<unknown>> => {
        return { isSuccess: true, value: { active: true } };
    });

}
