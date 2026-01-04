import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Storage keys
const KEYS = {
    PENDING_SYNC: '@stocker/pending_sync',
    CACHE_PREFIX: '@stocker/cache/',
    LAST_SYNC: '@stocker/last_sync',
    OFFLINE_QUEUE: '@stocker/offline_queue',
} as const;

// Cache entry with TTL
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // milliseconds
}

// Offline queue item
export interface QueueItem {
    id: string;
    type: 'create' | 'update' | 'delete';
    entity: string;
    payload: any;
    timestamp: number;
    retryCount: number;
}

// Sync status
export interface SyncStatus {
    isOnline: boolean;
    lastSyncTime: number | null;
    pendingCount: number;
    isSyncing: boolean;
}

class OfflineStorage {
    private listeners: Set<(status: SyncStatus) => void> = new Set();
    private isSyncing = false;
    private isOnline = true;

    constructor() {
        // Monitor network status
        NetInfo.addEventListener((state: NetInfoState) => {
            const wasOffline = !this.isOnline;
            this.isOnline = state.isConnected ?? false;

            // Auto-sync when coming back online
            if (wasOffline && this.isOnline) {
                console.log('📡 Back online, triggering sync...');
                this.processPendingQueue();
            }

            this.notifyListeners();
        });
    }

    // ═══════════════════════════════════════════════
    // Cache Management
    // ═══════════════════════════════════════════════

    async setCache<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): Promise<void> {
        const cacheKey = `${KEYS.CACHE_PREFIX}${key}`;
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttlMs,
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    }

    async getCache<T>(key: string): Promise<T | null> {
        const cacheKey = `${KEYS.CACHE_PREFIX}${key}`;
        const raw = await AsyncStorage.getItem(cacheKey);

        if (!raw) return null;

        try {
            const entry: CacheEntry<T> = JSON.parse(raw);
            const isExpired = Date.now() - entry.timestamp > entry.ttl;

            if (isExpired) {
                await AsyncStorage.removeItem(cacheKey);
                return null;
            }

            return entry.data;
        } catch {
            return null;
        }
    }

    async invalidateCache(keyPattern?: string): Promise<void> {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k =>
            k.startsWith(KEYS.CACHE_PREFIX) &&
            (keyPattern ? k.includes(keyPattern) : true)
        );

        if (cacheKeys.length > 0) {
            await AsyncStorage.multiRemove(cacheKeys);
        }
    }

    // ═══════════════════════════════════════════════
    // Offline Queue Management
    // ═══════════════════════════════════════════════

    async addToQueue(item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
        const queue = await this.getQueue();
        const newItem: QueueItem = {
            ...item,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            retryCount: 0,
        };

        queue.push(newItem);
        await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
        this.notifyListeners();

        // Try to process immediately if online
        if (this.isOnline) {
            this.processPendingQueue();
        }
    }

    async getQueue(): Promise<QueueItem[]> {
        const raw = await AsyncStorage.getItem(KEYS.OFFLINE_QUEUE);
        return raw ? JSON.parse(raw) : [];
    }

    async removeFromQueue(id: string): Promise<void> {
        const queue = await this.getQueue();
        const filtered = queue.filter(item => item.id !== id);
        await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(filtered));
        this.notifyListeners();
    }

    async clearQueue(): Promise<void> {
        await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify([]));
        this.notifyListeners();
    }

    // ═══════════════════════════════════════════════
    // Sync Processing
    // ═══════════════════════════════════════════════

    async processPendingQueue(): Promise<{ success: number; failed: number }> {
        if (this.isSyncing || !this.isOnline) {
            return { success: 0, failed: 0 };
        }

        this.isSyncing = true;
        this.notifyListeners();

        const queue = await this.getQueue();
        let success = 0;
        let failed = 0;

        for (const item of queue) {
            try {
                await this.processQueueItem(item);
                await this.removeFromQueue(item.id);
                success++;
            } catch (error) {
                console.error(`Failed to process queue item ${item.id}:`, error);

                // Update retry count
                item.retryCount++;

                if (item.retryCount >= 3) {
                    // Move to failed queue or remove after max retries
                    await this.removeFromQueue(item.id);
                    console.warn(`Queue item ${item.id} exceeded max retries, removing`);
                }

                failed++;
            }
        }

        // Update last sync time
        await AsyncStorage.setItem(KEYS.LAST_SYNC, Date.now().toString());

        this.isSyncing = false;
        this.notifyListeners();

        return { success, failed };
    }

    private async processQueueItem(item: QueueItem): Promise<void> {
        console.log(`📤 Processing queue item: ${item.entity} - ${item.type}`);

        // Dynamic import to avoid circular dependencies
        const { crmService } = await import('../api/services/crm.service');
        const { inventoryService } = await import('../api/services/inventory.service');
        const { hrService } = await import('../api/services/hr.service');
        const { salesService } = await import('../api/services/sales.service');

        switch (item.entity) {
            // CRM Operations
            case 'customer':
                if (item.type === 'create') await crmService.createCustomer(item.payload);
                else if (item.type === 'update') await crmService.updateCustomer(item.payload.id, item.payload);
                else if (item.type === 'delete') await crmService.deleteCustomer(item.payload.id);
                break;

            case 'deal':
                if (item.type === 'create') await crmService.createDeal(item.payload);
                else if (item.type === 'update') {
                    const { action } = item.payload;
                    if (action === 'updateStage') await crmService.updateDealStage(item.payload.id, item.payload.stage);
                    else await crmService.updateDeal(item.payload.id, item.payload.data);
                }
                else if (item.type === 'delete') await crmService.deleteDeal(item.payload.id);
                break;

            // Inventory Operations
            case 'product':
                if (item.type === 'create') await inventoryService.createProduct(item.payload);
                else if (item.type === 'update') await inventoryService.updateProduct(item.payload.id, item.payload);
                else if (item.type === 'delete') await inventoryService.deleteProduct(item.payload.id);
                break;

            case 'stockMovement':
                if (item.type === 'create') await inventoryService.createStockMovement(item.payload);
                break;

            case 'stockAdjustment':
                if (item.type === 'create') {
                    await inventoryService.adjustStock(
                        item.payload.productId,
                        item.payload.warehouseId,
                        item.payload.quantity,
                        item.payload.reason
                    );
                }
                break;

            case 'stockTransfer':
                if (item.type === 'create') await inventoryService.createStockTransfer(item.payload);
                else if (item.type === 'update') {
                    const { action } = item.payload;
                    if (action === 'approve') await inventoryService.approveStockTransfer(item.payload.id);
                    else if (action === 'ship') await inventoryService.shipStockTransfer(item.payload.id);
                    else if (action === 'receive') await inventoryService.receiveStockTransfer(item.payload.id);
                    else if (action === 'cancel') await inventoryService.cancelStockTransfer(item.payload.id, item.payload.reason);
                }
                break;

            case 'stockCount':
                if (item.type === 'create') await inventoryService.createStockCount(item.payload);
                else if (item.type === 'update') {
                    if (item.payload.action === 'updateItem') {
                        await inventoryService.updateStockCountItem(
                            item.payload.countId,
                            item.payload.productId,
                            item.payload.data
                        );
                    } else if (item.payload.action === 'complete') {
                        await inventoryService.completeStockCount(item.payload.id, item.payload.applyVariance);
                    } else if (item.payload.action === 'cancel') {
                        await inventoryService.cancelStockCount(item.payload.id);
                    }
                }
                break;

            // HR Operations
            case 'leaveRequest':
                if (item.type === 'create') await hrService.createLeaveRequest(item.payload);
                else if (item.type === 'update') {
                    const { action } = item.payload;
                    if (action === 'approve') await hrService.approveLeaveRequest(item.payload.id, item.payload.data);
                    else if (action === 'reject') await hrService.rejectLeaveRequest(item.payload.id, item.payload.data);
                    else if (action === 'cancel') await hrService.cancelLeaveRequest(item.payload.id);
                    else await hrService.updateLeaveRequest(item.payload.id, item.payload.data);
                }
                break;

            case 'attendance':
                if (item.type === 'create') {
                    if (item.payload.action === 'checkIn') await hrService.checkIn(item.payload.data);
                    else if (item.payload.action === 'checkOut') await hrService.checkOut(item.payload.data);
                }
                break;

            // Sales Operations
            case 'order':
                if (item.type === 'create') await salesService.createOrder(item.payload);
                else if (item.type === 'update') {
                    const { action } = item.payload;
                    if (action === 'confirm') await salesService.confirmOrder(item.payload.id);
                    else if (action === 'cancel') await salesService.cancelOrder(item.payload.id, item.payload.reason);
                    else if (action === 'updateStatus') await salesService.updateOrderStatus(item.payload.id, item.payload.status);
                    else await salesService.updateOrder(item.payload.id, item.payload.data);
                }
                else if (item.type === 'delete') await salesService.deleteOrder(item.payload.id);
                break;

            case 'invoice':
                if (item.type === 'create') await salesService.createInvoice(item.payload);
                else if (item.type === 'update') {
                    const { action } = item.payload;
                    if (action === 'send') await salesService.sendInvoice(item.payload.id, item.payload.email);
                    else if (action === 'markPaid') await salesService.markInvoiceAsPaid(item.payload.id);
                    else if (action === 'cancel') await salesService.cancelInvoice(item.payload.id, item.payload.reason);
                    else await salesService.updateInvoice(item.payload.id, item.payload.data);
                }
                else if (item.type === 'delete') await salesService.deleteInvoice(item.payload.id);
                break;

            case 'quote':
                if (item.type === 'create') await salesService.createQuote(item.payload);
                else if (item.type === 'update') {
                    const { action } = item.payload;
                    if (action === 'send') await salesService.sendQuote(item.payload.id);
                    else if (action === 'accept') await salesService.acceptQuote(item.payload.id);
                    else if (action === 'reject') await salesService.rejectQuote(item.payload.id, item.payload.reason);
                    else if (action === 'convert') await salesService.convertQuoteToOrder(item.payload.id);
                    else await salesService.updateQuote(item.payload.id, item.payload.data);
                }
                else if (item.type === 'delete') await salesService.deleteQuote(item.payload.id);
                break;

            case 'payment':
                if (item.type === 'create') await salesService.createPayment(item.payload);
                else if (item.type === 'delete') await salesService.deletePayment(item.payload.id);
                break;

            default:
                console.warn(`⚠️ Unknown entity type: ${item.entity}`);
        }
    }

    // ═══════════════════════════════════════════════
    // Status & Listeners
    // ═══════════════════════════════════════════════

    async getStatus(): Promise<SyncStatus> {
        const queue = await this.getQueue();
        const lastSyncRaw = await AsyncStorage.getItem(KEYS.LAST_SYNC);

        return {
            isOnline: this.isOnline,
            lastSyncTime: lastSyncRaw ? parseInt(lastSyncRaw, 10) : null,
            pendingCount: queue.length,
            isSyncing: this.isSyncing,
        };
    }

    subscribe(listener: (status: SyncStatus) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private async notifyListeners(): Promise<void> {
        const status = await this.getStatus();
        this.listeners.forEach(listener => listener(status));
    }

    // ═══════════════════════════════════════════════
    // Entity-Specific Helpers
    // ═══════════════════════════════════════════════

    // -------- CRM Operations --------
    async cacheCustomers(customers: any[]): Promise<void> {
        await this.setCache('customers', customers, 10 * 60 * 1000); // 10 min TTL
    }

    async getCachedCustomers(): Promise<any[] | null> {
        return this.getCache('customers');
    }

    async queueCustomerOperation(
        type: 'create' | 'update' | 'delete',
        payload: any
    ): Promise<void> {
        await this.addToQueue({ type, entity: 'customer', payload });
    }

    async queueDealOperation(
        type: 'create' | 'update' | 'delete',
        payload: any
    ): Promise<void> {
        await this.addToQueue({ type, entity: 'deal', payload });
    }

    async queueDealStageUpdate(id: string, stage: string): Promise<void> {
        await this.addToQueue({
            type: 'update',
            entity: 'deal',
            payload: { id, action: 'updateStage', stage },
        });
    }

    // -------- Inventory Operations --------
    async cacheProducts(products: any[]): Promise<void> {
        await this.setCache('products', products, 10 * 60 * 1000);
    }

    async getCachedProducts(): Promise<any[] | null> {
        return this.getCache('products');
    }

    async queueProductOperation(
        type: 'create' | 'update' | 'delete',
        payload: any
    ): Promise<void> {
        await this.addToQueue({ type, entity: 'product', payload });
    }

    async queueStockMovement(movement: any): Promise<void> {
        await this.addToQueue({
            type: 'create',
            entity: 'stockMovement',
            payload: movement,
        });
    }

    async queueStockAdjustment(
        productId: string,
        warehouseId: string,
        quantity: number,
        reason: string
    ): Promise<void> {
        await this.addToQueue({
            type: 'create',
            entity: 'stockAdjustment',
            payload: { productId, warehouseId, quantity, reason },
        });
    }

    async queueStockTransfer(transfer: any): Promise<void> {
        await this.addToQueue({ type: 'create', entity: 'stockTransfer', payload: transfer });
    }

    async queueStockTransferAction(
        id: string,
        action: 'approve' | 'ship' | 'receive' | 'cancel',
        reason?: string
    ): Promise<void> {
        await this.addToQueue({
            type: 'update',
            entity: 'stockTransfer',
            payload: { id, action, reason },
        });
    }

    async queueStockCount(count: any): Promise<void> {
        await this.addToQueue({ type: 'create', entity: 'stockCount', payload: count });
    }

    async queueStockCountItemUpdate(
        countId: string,
        productId: string,
        data: { countedQuantity: number; notes?: string }
    ): Promise<void> {
        await this.addToQueue({
            type: 'update',
            entity: 'stockCount',
            payload: { action: 'updateItem', countId, productId, data },
        });
    }

    // -------- HR Operations --------
    async cacheEmployees(employees: any[]): Promise<void> {
        await this.setCache('employees', employees, 15 * 60 * 1000); // 15 min TTL
    }

    async getCachedEmployees(): Promise<any[] | null> {
        return this.getCache('employees');
    }

    async queueLeaveRequest(request: any): Promise<void> {
        await this.addToQueue({ type: 'create', entity: 'leaveRequest', payload: request });
    }

    async queueLeaveAction(
        id: string,
        action: 'approve' | 'reject' | 'cancel',
        data?: any
    ): Promise<void> {
        await this.addToQueue({
            type: 'update',
            entity: 'leaveRequest',
            payload: { id, action, data },
        });
    }

    async queueCheckIn(data: { employeeId: string; latitude?: number; longitude?: number; notes?: string }): Promise<void> {
        await this.addToQueue({
            type: 'create',
            entity: 'attendance',
            payload: { action: 'checkIn', data },
        });
    }

    async queueCheckOut(data: { employeeId: string; latitude?: number; longitude?: number; notes?: string }): Promise<void> {
        await this.addToQueue({
            type: 'create',
            entity: 'attendance',
            payload: { action: 'checkOut', data },
        });
    }

    // -------- Sales Operations --------
    async cacheOrders(orders: any[]): Promise<void> {
        await this.setCache('orders', orders, 5 * 60 * 1000); // 5 min TTL
    }

    async getCachedOrders(): Promise<any[] | null> {
        return this.getCache('orders');
    }

    async queueOrderOperation(
        type: 'create' | 'update' | 'delete',
        payload: any
    ): Promise<void> {
        await this.addToQueue({ type, entity: 'order', payload });
    }

    async queueOrderAction(
        id: string,
        action: 'confirm' | 'cancel' | 'updateStatus',
        data?: any
    ): Promise<void> {
        await this.addToQueue({
            type: 'update',
            entity: 'order',
            payload: { id, action, ...data },
        });
    }

    async queueInvoiceOperation(
        type: 'create' | 'update' | 'delete',
        payload: any
    ): Promise<void> {
        await this.addToQueue({ type, entity: 'invoice', payload });
    }

    async queueInvoiceAction(
        id: string,
        action: 'send' | 'markPaid' | 'cancel',
        data?: any
    ): Promise<void> {
        await this.addToQueue({
            type: 'update',
            entity: 'invoice',
            payload: { id, action, data },
        });
    }

    async queueQuoteOperation(
        type: 'create' | 'update' | 'delete',
        payload: any
    ): Promise<void> {
        await this.addToQueue({ type, entity: 'quote', payload });
    }

    async queueQuoteAction(
        id: string,
        action: 'send' | 'accept' | 'reject' | 'convert',
        reason?: string
    ): Promise<void> {
        await this.addToQueue({
            type: 'update',
            entity: 'quote',
            payload: { id, action, reason },
        });
    }

    async queuePayment(payment: any): Promise<void> {
        await this.addToQueue({ type: 'create', entity: 'payment', payload: payment });
    }
}

export const offlineStorage = new OfflineStorage();
