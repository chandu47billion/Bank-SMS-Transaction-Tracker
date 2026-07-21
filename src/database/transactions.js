/**
 * CRUD + query helpers for the `transactions` table.
 */

import { getDBConnection } from './db';

const rowsToArray = rows => {
  const arr = [];
  for (let i = 0; i < rows.length; i++) {
    arr.push(rows.item(i));
  }
  return arr;
};

const genId = () => `txn_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

export async function insertTransaction(txn) {
  const db = await getDBConnection();
  const id = txn.id || genId();
  await db.executeSql(
    `INSERT OR IGNORE INTO transactions
      (id, amount, type, bank, accountLast4, merchant, description, category, balance, referenceNo, timestamp, source, rawSms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      txn.amount,
      txn.type,
      txn.bank || null,
      txn.accountLast4 || null,
      txn.merchant || null,
      txn.description || null,
      txn.category || 'others',
      txn.balance != null ? txn.balance : null,
      txn.referenceNo || null,
      txn.timestamp,
      txn.source || 'sms',
      txn.rawSms || null,
    ],
  );
  return id;
}

export async function insertTransactionsBulk(txns) {
  const db = await getDBConnection();
  await db.transaction(tx => {
    txns.forEach(txn => {
      tx.executeSql(
        `INSERT OR IGNORE INTO transactions
          (id, amount, type, bank, accountLast4, merchant, description, category, balance, referenceNo, timestamp, source, rawSms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          txn.id || genId(),
          txn.amount,
          txn.type,
          txn.bank || null,
          txn.accountLast4 || null,
          txn.merchant || null,
          txn.description || null,
          txn.category || 'others',
          txn.balance != null ? txn.balance : null,
          txn.referenceNo || null,
          txn.timestamp,
          txn.source || 'sms',
          txn.rawSms || null,
        ],
      );
    });
  });
}

export async function getAllTransactions({ limit, offset } = {}) {
  const db = await getDBConnection();
  let sql = 'SELECT * FROM transactions ORDER BY timestamp DESC';
  const params = [];
  if (limit != null) {
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset || 0);
  }
  const [result] = await db.executeSql(sql, params);
  return rowsToArray(result.rows);
}

export async function getTransactionById(id) {
  const db = await getDBConnection();
  const [result] = await db.executeSql('SELECT * FROM transactions WHERE id = ?', [id]);
  if (result.rows.length === 0) return null;
  return result.rows.item(0);
}

export async function getTransactionsBetween(startISO, endISO) {
  const db = await getDBConnection();
  const [result] = await db.executeSql(
    'SELECT * FROM transactions WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC',
    [startISO, endISO],
  );
  return rowsToArray(result.rows);
}

export async function getTransactionsByCategory(categoryId, { startISO, endISO } = {}) {
  const db = await getDBConnection();
  let sql = 'SELECT * FROM transactions WHERE category = ?';
  const params = [categoryId];
  if (startISO && endISO) {
    sql += ' AND timestamp >= ? AND timestamp <= ?';
    params.push(startISO, endISO);
  }
  sql += ' ORDER BY timestamp DESC';
  const [result] = await db.executeSql(sql, params);
  return rowsToArray(result.rows);
}

export async function searchTransactions(query) {
  const db = await getDBConnection();
  const like = `%${query}%`;
  const [result] = await db.executeSql(
    `SELECT * FROM transactions
     WHERE merchant LIKE ? OR description LIKE ? OR bank LIKE ? OR category LIKE ?
     ORDER BY timestamp DESC`,
    [like, like, like, like],
  );
  return rowsToArray(result.rows);
}

export async function updateTransactionCategory(id, categoryId) {
  const db = await getDBConnection();
  await db.executeSql('UPDATE transactions SET category = ? WHERE id = ?', [categoryId, id]);
}

export async function updateTransaction(id, fields) {
  const db = await getDBConnection();
  const keys = Object.keys(fields);
  if (keys.length === 0) return;
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => fields[k]);
  await db.executeSql(`UPDATE transactions SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteTransaction(id) {
  const db = await getDBConnection();
  await db.executeSql('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function deleteAllTransactions() {
  const db = await getDBConnection();
  await db.executeSql('DELETE FROM transactions');
}

export async function getTransactionCount() {
  const db = await getDBConnection();
  const [result] = await db.executeSql('SELECT COUNT(*) as count FROM transactions');
  return result.rows.item(0).count;
}

export async function getLatestBalance() {
  const db = await getDBConnection();
  const [result] = await db.executeSql(
    'SELECT balance FROM transactions WHERE balance IS NOT NULL ORDER BY timestamp DESC LIMIT 1',
  );
  if (result.rows.length === 0) return 0;
  return result.rows.item(0).balance;
}

export default {
  insertTransaction,
  insertTransactionsBulk,
  getAllTransactions,
  getTransactionById,
  getTransactionsBetween,
  getTransactionsByCategory,
  searchTransactions,
  updateTransactionCategory,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  getTransactionCount,
  getLatestBalance,
};
