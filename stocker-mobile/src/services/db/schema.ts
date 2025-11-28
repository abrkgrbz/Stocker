export const TABLES = {
    CUSTOMERS: 'customers',
    DEALS: 'deals',
    ACTIVITIES: 'activities',
    SYNC_QUEUE: 'sync_queue'
};

export const SCHEMA = {
    createCustomersTable: `
        CREATE TABLE IF NOT EXISTS ${TABLES.CUSTOMERS} (
            id TEXT PRIMARY KEY,
            companyName TEXT NOT NULL,
            contactPerson TEXT,
            email TEXT,
            phone TEXT,
            website TEXT,
            address TEXT,
            city TEXT,
            country TEXT,
            customerType TEXT,
            notes TEXT,
            createdAt TEXT,
            updatedAt TEXT,
            isDeleted INTEGER DEFAULT 0,
            isSynced INTEGER DEFAULT 1
        );
    `,
    createDealsTable: `
        CREATE TABLE IF NOT EXISTS ${TABLES.DEALS} (
            id TEXT PRIMARY KEY,
            customerId TEXT,
            title TEXT NOT NULL,
            description TEXT,
            value REAL,
            currency TEXT,
            stage TEXT,
            probability INTEGER,
            expectedCloseDate TEXT,
            createdAt TEXT,
            updatedAt TEXT,
            isDeleted INTEGER DEFAULT 0,
            isSynced INTEGER DEFAULT 1,
            FOREIGN KEY (customerId) REFERENCES ${TABLES.CUSTOMERS} (id)
        );
    `,
    createActivitiesTable: `
        CREATE TABLE IF NOT EXISTS ${TABLES.ACTIVITIES} (
            id TEXT PRIMARY KEY,
            customerId TEXT,
            dealId TEXT,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT,
            duration INTEGER,
            completed INTEGER DEFAULT 0,
            createdAt TEXT,
            updatedAt TEXT,
            isDeleted INTEGER DEFAULT 0,
            isSynced INTEGER DEFAULT 1
        );
    `,
    createSyncQueueTable: `
        CREATE TABLE IF NOT EXISTS ${TABLES.SYNC_QUEUE} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
            table_name TEXT NOT NULL,
            record_id TEXT NOT NULL,
            data TEXT, -- JSON string of data
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            retryCount INTEGER DEFAULT 0
        );
    `
};
