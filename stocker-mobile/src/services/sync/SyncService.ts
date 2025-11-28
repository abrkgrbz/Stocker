import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { databaseService } from '../db/database';
import { TABLES } from '../db/schema';
import { apiService } from '../api';

class SyncService {
    private isConnected: boolean = false;
    private isSyncing: boolean = false;

    constructor() {
        NetInfo.addEventListener(this.handleConnectivityChange);
    }

    private handleConnectivityChange = (state: NetInfoState) => {
        const wasConnected = this.isConnected;
        this.isConnected = state.isConnected ?? false;

        if (!wasConnected && this.isConnected) {
            console.log('Online: Triggering sync...');
            this.sync();
        }
    };

    public async sync() {
        if (this.isSyncing || !this.isConnected) return;

        this.isSyncing = true;
        try {
            await this.pushChanges();
            await this.pullChanges();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    private async pushChanges() {
        console.log('Pushing changes...');
        const queue = await databaseService.getAllAsync<any>(
            `SELECT * FROM ${TABLES.SYNC_QUEUE} ORDER BY id ASC`
        );

        for (const item of queue) {
            try {
                const data = JSON.parse(item.data);

                if (item.table_name === TABLES.CUSTOMERS) {
                    if (item.action === 'CREATE') {
                        await apiService.crm.createCustomer(data);
                    } else if (item.action === 'UPDATE') {
                        await apiService.crm.updateCustomer(item.record_id, data);
                    } else if (item.action === 'DELETE') {
                        // Bulk delete logic might be different, assuming single for now or handling bulk in queue
                        // For simplicity, let's assume single delete for now or adapt
                    }
                }
                // Add other tables (Deals, Activities) logic here

                // Remove from queue on success
                await databaseService.runAsync(
                    `DELETE FROM ${TABLES.SYNC_QUEUE} WHERE id = ?`,
                    [item.id]
                );
            } catch (error) {
                console.error(`Failed to sync item ${item.id}:`, error);
                // Increment retry count or handle error
            }
        }
    }

    private async pullChanges() {
        console.log('Pulling changes...');
        // 1. Customers
        try {
            const response = await apiService.crm.getCustomers({ pageSize: 1000 }); // Fetch all for now
            if (response.data.success) {
                const customers = response.data.data.items;
                await databaseService.withTransactionAsync(async () => {
                    await databaseService.runAsync(`DELETE FROM ${TABLES.CUSTOMERS}`); // Simple replace strategy
                    for (const c of customers) {
                        await databaseService.runAsync(
                            `INSERT INTO ${TABLES.CUSTOMERS} (id, companyName, contactPerson, email, phone, website, address, city, country, customerType, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [c.id, c.companyName, c.contactPerson, c.email, c.phone, c.website, c.address, c.city, c.country, c.customerType, c.notes, c.createdAt, c.updatedAt]
                        );
                    }
                });
            }
        } catch (error) {
            console.error('Failed to pull customers:', error);
        }

        // 2. Deals (Similar logic)
        try {
            const response = await apiService.crm.getDeals();
            if (response.data.success) {
                const deals = response.data.data; // Assuming it returns list directly or items
                // Check API response structure from previous files. getDeals returns data directly or paginated?
                // Looking at DealListScreen: response.data.data is the array.

                await databaseService.withTransactionAsync(async () => {
                    await databaseService.runAsync(`DELETE FROM ${TABLES.DEALS}`);
                    for (const d of deals) {
                        await databaseService.runAsync(
                            `INSERT INTO ${TABLES.DEALS} (id, customerId, title, description, value, currency, stage, probability, expectedCloseDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [d.id, d.customerId, d.title, d.description, d.value, d.currency, d.stage, d.probability, d.expectedCloseDate, d.createdAt, d.updatedAt]
                        );
                    }
                });
            }
        } catch (error) {
            console.error('Failed to pull deals:', error);
        }

        // 3. Activities
        // ... similar logic
    }

    // Helper to queue actions
    public async queueAction(action: 'CREATE' | 'UPDATE' | 'DELETE', tableName: string, recordId: string, data: any) {
        await databaseService.runAsync(
            `INSERT INTO ${TABLES.SYNC_QUEUE} (action, table_name, record_id, data) VALUES (?, ?, ?, ?)`,
            [action, tableName, recordId, JSON.stringify(data)]
        );

        // Try to sync immediately if online
        if (this.isConnected) {
            this.sync();
        }
    }
}

export const syncService = new SyncService();
