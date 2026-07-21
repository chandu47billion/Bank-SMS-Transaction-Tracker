/**
 * SQLite table schema definitions for MoneyFlow.
 */

export const TABLES = {
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  BUDGETS: 'budgets',
  SETTINGS: 'settings',
};

export const CREATE_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.TRANSACTIONS} (
    id TEXT PRIMARY KEY NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    bank TEXT,
    accountLast4 TEXT,
    merchant TEXT,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'others',
    balance REAL,
    referenceNo TEXT,
    timestamp TEXT NOT NULL,
    source TEXT DEFAULT 'sms',
    rawSms TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_CATEGORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.CATEGORIES} (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    emoji TEXT,
    icon TEXT,
    color TEXT,
    isCustom INTEGER DEFAULT 0
  );
`;

export const CREATE_BUDGETS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.BUDGETS} (
    id TEXT PRIMARY KEY NOT NULL,
    categoryId TEXT NOT NULL,
    monthKey TEXT NOT NULL,
    limitAmount REAL NOT NULL DEFAULT 0,
    UNIQUE(categoryId, monthKey)
  );
`;

export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.SETTINGS} (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT
  );
`;

export const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_txn_timestamp ON ${TABLES.TRANSACTIONS} (timestamp);`,
  `CREATE INDEX IF NOT EXISTS idx_txn_category ON ${TABLES.TRANSACTIONS} (category);`,
  `CREATE INDEX IF NOT EXISTS idx_txn_bank ON ${TABLES.TRANSACTIONS} (bank);`,
];

export default {
  TABLES,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_BUDGETS_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_INDEXES,
};
