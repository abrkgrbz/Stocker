/**
 * Sales Module IPC Handlers
 *
 * Registers IPC handlers for sales operations
 * Maps IPC channels to service methods
 */

import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';
import { SalesOrderService } from '../services/sales/sales-order.service';
import { IpcResult } from '../domain/common/result';

// Current user context (simplified for desktop app)
function getCurrentUserId(): string {
  // In a real app, this would come from local auth
  return 'local-user';
}

export function registerSalesHandlers(prisma: PrismaClient): void {
  const salesOrderService = new SalesOrderService(prisma);

  // ============================================
  // Sales Orders
  // ============================================

  ipcMain.handle('sales:orders:list', async (_event, payload): Promise<IpcResult<unknown>> => {
    const result = await salesOrderService.list(payload || {});
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:get', async (_event, payload): Promise<IpcResult<unknown>> => {
    const { id } = payload;
    const result = await salesOrderService.findById(id);
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:create', async (_event, payload): Promise<IpcResult<unknown>> => {
    const userId = getCurrentUserId();
    const result = await salesOrderService.create(payload, userId);
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:addItem', async (_event, payload): Promise<IpcResult<unknown>> => {
    const { orderId, ...itemData } = payload;
    const result = await salesOrderService.addItem(orderId, itemData);
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:removeItem', async (_event, payload): Promise<IpcResult<unknown>> => {
    const { orderId, itemId } = payload;
    const result = await salesOrderService.removeItem(orderId, itemId);
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:approve', async (_event, payload): Promise<IpcResult<unknown>> => {
    const { id } = payload;
    const userId = getCurrentUserId();
    const result = await salesOrderService.approve(id, userId);
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:confirm', async (_event, payload): Promise<IpcResult<unknown>> => {
    const { id } = payload;
    const userId = getCurrentUserId();
    const result = await salesOrderService.confirm(id, userId);
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:ship', async (_event, payload): Promise<IpcResult<unknown>> => {
    const { id } = payload;
    const userId = getCurrentUserId();
    const result = await salesOrderService.ship(id, userId);
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:deliver', async (_event, payload): Promise<IpcResult<unknown>> => {
    const { id } = payload;
    const userId = getCurrentUserId();
    const result = await salesOrderService.deliver(id, userId);
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:complete', async (_event, payload): Promise<IpcResult<unknown>> => {
    const { id } = payload;
    const userId = getCurrentUserId();
    const result = await salesOrderService.complete(id, userId);
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:cancel', async (_event, payload): Promise<IpcResult<unknown>> => {
    const { id, reason } = payload;
    const userId = getCurrentUserId();
    const result = await salesOrderService.cancel(id, reason, userId);
    return result.toIpcResult();
  });

  ipcMain.handle('sales:orders:applyDiscount', async (_event, payload): Promise<IpcResult<unknown>> => {
    const { id, ...discountData } = payload;
    const userId = getCurrentUserId();
    const result = await salesOrderService.applyDiscount(id, discountData, userId);
    return result.toIpcResult();
  });

  // ============================================
  // Invoices (placeholder - implement similarly)
  // ============================================

  ipcMain.handle('sales:invoices:list', async (_event, _payload): Promise<IpcResult<unknown>> => {
    // TODO: Implement invoice service
    return { isSuccess: true, value: { items: [], totalCount: 0 } };
  });

  ipcMain.handle('sales:invoices:get', async (_event, _payload): Promise<IpcResult<unknown>> => {
    return { isSuccess: false, error: { code: 'NotImplemented', message: 'Not implemented', type: 'Internal' } };
  });

  ipcMain.handle('sales:invoices:create', async (_event, _payload): Promise<IpcResult<unknown>> => {
    return { isSuccess: false, error: { code: 'NotImplemented', message: 'Not implemented', type: 'Internal' } };
  });

  // ============================================
  // Payments (placeholder)
  // ============================================

  ipcMain.handle('sales:payments:list', async (_event, _payload): Promise<IpcResult<unknown>> => {
    return { isSuccess: true, value: { items: [], totalCount: 0 } };
  });

  ipcMain.handle('sales:payments:get', async (_event, _payload): Promise<IpcResult<unknown>> => {
    return { isSuccess: false, error: { code: 'NotImplemented', message: 'Not implemented', type: 'Internal' } };
  });

  ipcMain.handle('sales:payments:create', async (_event, _payload): Promise<IpcResult<unknown>> => {
    return { isSuccess: false, error: { code: 'NotImplemented', message: 'Not implemented', type: 'Internal' } };
  });

  // ============================================
  // Quotations (placeholder)
  // ============================================

  ipcMain.handle('sales:quotations:list', async (_event, _payload): Promise<IpcResult<unknown>> => {
    return { isSuccess: true, value: { items: [], totalCount: 0 } };
  });

  ipcMain.handle('sales:quotations:get', async (_event, _payload): Promise<IpcResult<unknown>> => {
    return { isSuccess: false, error: { code: 'NotImplemented', message: 'Not implemented', type: 'Internal' } };
  });

  ipcMain.handle('sales:quotations:create', async (_event, _payload): Promise<IpcResult<unknown>> => {
    return { isSuccess: false, error: { code: 'NotImplemented', message: 'Not implemented', type: 'Internal' } };
  });

  console.log('[IPC] Sales handlers registered');
}
