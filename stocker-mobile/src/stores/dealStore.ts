import { create } from 'zustand';
import { databaseService } from '../services/db/database';
import { syncService } from '../services/sync/SyncService';
import { TABLES } from '../services/db/schema';

interface DealState {
    deals: any[];
    isLoading: boolean;
    loadDeals: () => Promise<void>;
    addDeal: (deal: any) => Promise<void>;
    deleteDeals: (ids: string[]) => Promise<void>;
    syncDeals: () => Promise<void>;
}

export const useDealStore = create<DealState>((set, get) => ({
    deals: [],
    isLoading: false,

    loadDeals: async () => {
        set({ isLoading: true });
        try {
            const query = `SELECT * FROM ${TABLES.DEALS} WHERE isDeleted = 0 ORDER BY createdAt DESC`;
            const items = await databaseService.getAllAsync<any>(query);
            set({ deals: items });
        } catch (error) {
            console.error('Failed to load deals from DB:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addDeal: async (deal: any) => {
        const newDeal = {
            ...deal,
            id: deal.id || Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isSynced: 0
        };

        try {
            await databaseService.runAsync(
                `INSERT INTO ${TABLES.DEALS} (id, customerId, title, description, value, currency, stage, probability, expectedCloseDate, createdAt, updatedAt, isSynced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [newDeal.id, newDeal.customerId, newDeal.title, newDeal.description, newDeal.value, newDeal.currency, newDeal.stage, newDeal.probability, newDeal.expectedCloseDate, newDeal.createdAt, newDeal.updatedAt, 0]
            );

            const current = get().deals;
            set({ deals: [newDeal, ...current] });

            await syncService.queueAction('CREATE', TABLES.DEALS, newDeal.id, newDeal);
        } catch (error) {
            console.error('Failed to add deal:', error);
            throw error;
        }
    },

    deleteDeals: async (ids: string[]) => {
        try {
            const placeholders = ids.map(() => '?').join(',');
            await databaseService.runAsync(
                `UPDATE ${TABLES.DEALS} SET isDeleted = 1, isSynced = 0 WHERE id IN (${placeholders})`,
                ids
            );

            const current = get().deals;
            set({ deals: current.filter(d => !ids.includes(d.id)) });

            for (const id of ids) {
                await syncService.queueAction('DELETE', TABLES.DEALS, id, null);
            }
        } catch (error) {
            console.error('Failed to delete deals:', error);
            throw error;
        }
    },

    syncDeals: async () => {
        await syncService.sync();
        await get().loadDeals();
    }
}));
