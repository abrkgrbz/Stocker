import { create } from 'zustand';
import { databaseService } from '../services/db/database';
import { syncService } from '../services/sync/SyncService';
import { TABLES } from '../services/db/schema';

interface CustomerState {
    customers: any[];
    isLoading: boolean;
    loadCustomers: (search?: string) => Promise<void>;
    addCustomer: (customer: any) => Promise<void>;
    deleteCustomers: (ids: string[]) => Promise<void>;
    syncCustomers: () => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
    customers: [],
    isLoading: false,

    loadCustomers: async (search?: string) => {
        set({ isLoading: true });
        try {
            let query = `SELECT * FROM ${TABLES.CUSTOMERS} WHERE isDeleted = 0`;
            const params: any[] = [];

            if (search) {
                query += ` AND (companyName LIKE ? OR contactPerson LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }

            query += ` ORDER BY createdAt DESC`;

            const items = await databaseService.getAllAsync<any>(query, params);
            set({ customers: items });
        } catch (error) {
            console.error('Failed to load customers from DB:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addCustomer: async (customer: any) => {
        // Optimistic update
        const newCustomer = {
            ...customer,
            id: customer.id || Math.random().toString(36).substr(2, 9), // Temp ID if not provided
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isSynced: 0
        };

        try {
            await databaseService.runAsync(
                `INSERT INTO ${TABLES.CUSTOMERS} (id, companyName, contactPerson, email, phone, website, address, city, country, customerType, notes, createdAt, updatedAt, isSynced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [newCustomer.id, newCustomer.companyName, newCustomer.contactPerson, newCustomer.email, newCustomer.phone, newCustomer.website, newCustomer.address, newCustomer.city, newCustomer.country, newCustomer.customerType, newCustomer.notes, newCustomer.createdAt, newCustomer.updatedAt, 0]
            );

            // Update state
            const current = get().customers;
            set({ customers: [newCustomer, ...current] });

            // Queue for sync
            await syncService.queueAction('CREATE', TABLES.CUSTOMERS, newCustomer.id, newCustomer);
        } catch (error) {
            console.error('Failed to add customer:', error);
            throw error;
        }
    },

    deleteCustomers: async (ids: string[]) => {
        try {
            // Optimistic update
            const placeholders = ids.map(() => '?').join(',');
            await databaseService.runAsync(
                `UPDATE ${TABLES.CUSTOMERS} SET isDeleted = 1, isSynced = 0 WHERE id IN (${placeholders})`,
                ids
            );

            // Update state
            const current = get().customers;
            set({ customers: current.filter(c => !ids.includes(c.id)) });

            // Queue for sync (one by one or bulk if API supports it)
            // For now, let's queue individual deletes or a bulk action if we implement it in SyncService
            // SyncService queueAction takes a single recordId.
            // We can loop.
            for (const id of ids) {
                await syncService.queueAction('DELETE', TABLES.CUSTOMERS, id, null);
            }
        } catch (error) {
            console.error('Failed to delete customers:', error);
            throw error;
        }
    },

    syncCustomers: async () => {
        await syncService.sync();
        await get().loadCustomers();
    }
}));
