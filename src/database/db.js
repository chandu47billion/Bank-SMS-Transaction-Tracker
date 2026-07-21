/**
 * SQLite database bootstrap for MoneyFlow.
 * Wraps react-native-sqlite-storage with a promise-based API and runs
 * schema migrations + first-launch seeding.
 */

import SQLite from 'react-native-sqlite-storage';
import {
  CREATE_TRANSACTIONS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_BUDGETS_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_INDEXES,
} from './schema';
import {CATEGORIES} from '../data/categories';
import {generateSeedTransactions} from '../data/seed';

SQLite.enablePromise(true);
SQLite.DEBUG(false);

const DATABASE_NAME = 'moneyflow.db';
const SEED_FLAG_KEY = 'seed_completed';

let dbInstance = null;

export async function getDBConnection() {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabase({
    name: DATABASE_NAME,
    location: 'default',
  });
  return dbInstance;
}

async function execute(db, sql, params = []) {
  return db.executeSql(sql, params);
}

async function runMigrations(db) {
  await execute(db, CREATE_TRANSACTIONS_TABLE);
  await execute(db, CREATE_CATEGORIES_TABLE);
  await execute(db, CREATE_BUDGETS_TABLE);
  await execute(db, CREATE_SETTINGS_TABLE);
  for (const idx of CREATE_INDEXES) {
    await execute(db, idx);
  }
}

async function seedCategoriesIfEmpty(db) {
  const [result] = await execute(
    db,
    'SELECT COUNT(*) as count FROM categories',
  );
  const count = result.rows.item(0).count;
  if (count > 0) {
    return;
  }

  for (const cat of CATEGORIES) {
    await execute(
      db,
      'INSERT OR IGNORE INTO categories (id, name, emoji, icon, color, isCustom) VALUES (?, ?, ?, ?, ?, 0)',
      [cat.id, cat.name, cat.emoji, cat.icon, cat.color],
    );
  }
}

async function getSetting(db, key) {
  const [result] = await execute(
    db,
    'SELECT value FROM settings WHERE key = ?',
    [key],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows.item(0).value;
}

async function setSetting(db, key, value) {
  await execute(
    db,
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, String(value)],
  );
}

async function seedTransactionsIfNeeded(db) {
  const seeded = await getSetting(db, SEED_FLAG_KEY);
  if (seeded === 'true') {
    return;
  }

  const [result] = await execute(
    db,
    'SELECT COUNT(*) as count FROM transactions',
  );
  const count = result.rows.item(0).count;
  if (count === 0) {
    const seedData = generateSeedTransactions();
    for (const txn of seedData) {
      await execute(
        db,
        `INSERT OR IGNORE INTO transactions
          (id, amount, type, bank, accountLast4, merchant, description, category, balance, referenceNo, timestamp, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          txn.id,
          txn.amount,
          txn.type,
          txn.bank,
          txn.accountLast4,
          txn.merchant,
          txn.description,
          txn.category,
          txn.balance,
          txn.referenceNo,
          txn.timestamp,
          txn.source || 'seed',
        ],
      );
    }
  }
  await setSetting(db, SEED_FLAG_KEY, 'true');
}

/**
 * Initializes the database: creates tables/indexes, seeds default
 * categories, and (on first run) seeds sample transactions so the app
 * is populated with realistic data before real SMS import runs.
 */
export async function initDatabase() {
  const db = await getDBConnection();
  await runMigrations(db);
  await seedCategoriesIfEmpty(db);
  await seedTransactionsIfNeeded(db);
  return db;
}

export async function closeDatabase() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}

export default {getDBConnection, initDatabase, closeDatabase};
