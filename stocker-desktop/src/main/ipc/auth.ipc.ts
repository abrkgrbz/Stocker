import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';
import { IpcResult } from '../domain/common/result';

export function registerAuthHandlers(prisma: PrismaClient): void {

    ipcMain.handle('auth:login', async (_event, payload): Promise<IpcResult<unknown>> => {
        console.log('[Auth] Login attempt:', payload.username);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock Success
            if (payload.username === 'admin' && payload.password === 'admin') {
                return {
                    isSuccess: true,
                    value: {
                        token: 'mock-jwt-token',
                        user: { id: '1', username: 'admin', role: 'admin' }
                    }
                };
            }

            // Mock Failure
            if (payload.password !== 'admin') {
                return {
                    isSuccess: false,
                    error: { code: 'InvalidCredentials', message: 'Invalid username or password', type: 'Validation' }
                };
            }

            return {
                isSuccess: true,
                value: {
                    token: 'mock-jwt-token-user',
                    user: { id: '2', username: payload.username, role: 'user' }
                }
            };

        } catch (error) {
            return {
                isSuccess: false,
                error: {
                    code: 'AuthError',
                    message: 'Authentication failed',
                    type: 'Internal'
                }
            };
        }
    });

    ipcMain.handle('auth:logout', async (_event): Promise<IpcResult<unknown>> => {
        // Clear session logic here
        return { isSuccess: true };
    });

    ipcMain.handle('auth:getCurrentUser', async (_event): Promise<IpcResult<unknown>> => {
        // Return mock user
        return {
            isSuccess: true,
            value: { id: '1', username: 'admin', role: 'admin' }
        };
    });
}
