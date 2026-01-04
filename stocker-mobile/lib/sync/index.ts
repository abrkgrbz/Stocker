export { SyncProvider, useSync } from './SyncContext';
export {
    offlineStorage,
    type QueueItem,
    type SyncStatus
} from '../storage/offline';

// Re-export common offline operations for convenience
export const offlineOps = {
    // CRM - Customers
    queueCustomerCreate: (data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueCustomerOperation('create', data)),
    queueCustomerUpdate: (id: string, data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueCustomerOperation('update', { id, ...data })),
    queueCustomerDelete: (id: string) =>
        import('../storage/offline').then(m => m.offlineStorage.queueCustomerOperation('delete', { id })),

    // CRM - Deals
    queueDealCreate: (data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueDealOperation('create', data)),
    queueDealUpdate: (id: string, data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueDealOperation('update', { id, data })),
    queueDealDelete: (id: string) =>
        import('../storage/offline').then(m => m.offlineStorage.queueDealOperation('delete', { id })),
    queueDealStageUpdate: (id: string, stage: string) =>
        import('../storage/offline').then(m => m.offlineStorage.queueDealStageUpdate(id, stage)),

    // Inventory
    queueProductCreate: (data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueProductOperation('create', data)),
    queueProductUpdate: (id: string, data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueProductOperation('update', { id, ...data })),
    queueStockMovement: (data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueStockMovement(data)),
    queueStockAdjustment: (productId: string, warehouseId: string, quantity: number, reason: string) =>
        import('../storage/offline').then(m => m.offlineStorage.queueStockAdjustment(productId, warehouseId, quantity, reason)),

    // HR
    queueLeaveRequest: (data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueLeaveRequest(data)),
    queueCheckIn: (data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueCheckIn(data)),
    queueCheckOut: (data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueCheckOut(data)),

    // Sales
    queueOrderCreate: (data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueOrderOperation('create', data)),
    queueInvoiceCreate: (data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queueInvoiceOperation('create', data)),
    queuePayment: (data: any) =>
        import('../storage/offline').then(m => m.offlineStorage.queuePayment(data)),
};
