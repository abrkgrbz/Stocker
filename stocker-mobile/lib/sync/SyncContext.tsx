import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { offlineStorage, SyncStatus, QueueItem } from '../storage/offline';

interface SyncContextType {
    status: SyncStatus;
    syncNow: () => Promise<{ success: number; failed: number }>;
    isOnline: boolean;
    pendingCount: number;
    isSyncing: boolean;
    lastSyncTime: Date | null;
    // Offline-aware mutation helpers
    queueMutation: (entity: string, type: 'create' | 'update' | 'delete', payload: any) => Promise<void>;
    // Force refresh all caches
    refreshAllCaches: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | null>(null);

// Map entity types to their query keys for cache invalidation
const ENTITY_QUERY_KEYS: Record<string, string[]> = {
    customer: ['crm'],
    deal: ['crm'],
    product: ['inventory'],
    stockMovement: ['inventory'],
    stockAdjustment: ['inventory'],
    stockTransfer: ['inventory'],
    stockCount: ['inventory'],
    leaveRequest: ['hr'],
    attendance: ['hr'],
    order: ['sales'],
    invoice: ['sales'],
    quote: ['sales'],
    payment: ['sales'],
};

export function SyncProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const previousPendingCount = useRef(0);

    const [status, setStatus] = useState<SyncStatus>({
        isOnline: true,
        lastSyncTime: null,
        pendingCount: 0,
        isSyncing: false,
    });

    useEffect(() => {
        // Load initial status
        offlineStorage.getStatus().then(setStatus);

        // Subscribe to status changes
        const unsubscribe = offlineStorage.subscribe((newStatus) => {
            setStatus(newStatus);

            // If pending count decreased and we're not syncing anymore, items were processed
            // Invalidate relevant caches
            if (
                previousPendingCount.current > newStatus.pendingCount &&
                !newStatus.isSyncing
            ) {
                // Sync completed successfully, refresh all affected caches
                console.log('📥 Sync completed, refreshing caches...');
                invalidateAffectedCaches();
            }

            previousPendingCount.current = newStatus.pendingCount;
        });

        return unsubscribe;
    }, []);

    const invalidateAffectedCaches = useCallback(async () => {
        // Get unique query keys that need invalidation
        const keysToInvalidate = new Set<string>();

        // For now, invalidate all main entity caches
        Object.values(ENTITY_QUERY_KEYS).flat().forEach(key => keysToInvalidate.add(key));

        // Invalidate each unique key
        for (const key of keysToInvalidate) {
            await queryClient.invalidateQueries({ queryKey: [key] });
        }
    }, [queryClient]);

    const syncNow = useCallback(async () => {
        const result = await offlineStorage.processPendingQueue();

        // After sync, invalidate caches to get fresh data
        if (result.success > 0) {
            await invalidateAffectedCaches();
        }

        return result;
    }, [invalidateAffectedCaches]);

    const queueMutation = useCallback(async (
        entity: string,
        type: 'create' | 'update' | 'delete',
        payload: any
    ) => {
        await offlineStorage.addToQueue({ entity, type, payload });

        // Optimistically update UI by invalidating related queries
        const queryKeys = ENTITY_QUERY_KEYS[entity];
        if (queryKeys) {
            for (const key of queryKeys) {
                await queryClient.invalidateQueries({ queryKey: [key] });
            }
        }
    }, [queryClient]);

    const refreshAllCaches = useCallback(async () => {
        console.log('🔄 Refreshing all caches...');
        await queryClient.invalidateQueries();
    }, [queryClient]);

    const value: SyncContextType = {
        status,
        syncNow,
        isOnline: status.isOnline,
        pendingCount: status.pendingCount,
        isSyncing: status.isSyncing,
        lastSyncTime: status.lastSyncTime ? new Date(status.lastSyncTime) : null,
        queueMutation,
        refreshAllCaches,
    };

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    );
}

export function useSync(): SyncContextType {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
}
