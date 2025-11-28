import * as SQLite from 'expo-sqlite';
import { SCHEMA, TABLES } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export const databaseService = {
    init: async () => {
        if (db) return;

        try {
            db = await SQLite.openDatabaseAsync('stocker.db');

            // Enable foreign keys
            await db.execAsync('PRAGMA foreign_keys = ON;');

            // Create tables
            await db.execAsync(SCHEMA.createCustomersTable);
            await db.execAsync(SCHEMA.createDealsTable);
            await db.execAsync(SCHEMA.createActivitiesTable);
            await db.execAsync(SCHEMA.createSyncQueueTable);

            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    },

    getDB: () => {
        if (!db) {
            throw new Error('Database not initialized. Call init() first.');
        }
        return db;
    },

    // Generic helpers
    runAsync: async (sql: string, params: any[] = []) => {
        if (!db) throw new Error('Database not initialized');
        return await db.runAsync(sql, params);
    },

    getAllAsync: async <T>(sql: string, params: any[] = []): Promise<T[]> => {
        if (!db) throw new Error('Database not initialized');
        return await db.getAllAsync<T>(sql, params);
    },

    getFirstAsync: async <T>(sql: string, params: any[] = []): Promise<T | null> => {
        if (!db) throw new Error('Database not initialized');
        return await db.getFirstAsync<T>(sql, params);
    },

    // Transaction helper (simplified for expo-sqlite new API)
    withTransactionAsync: async (callback: () => Promise<void>) => {
        if (!db) throw new Error('Database not initialized');
        await db.withTransactionAsync(callback);
    }
};
