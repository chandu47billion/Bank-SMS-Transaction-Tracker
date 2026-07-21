/**
 * CRUD helpers for the `categories` table.
 */

import { getDBConnection } from './db';

const rowsToArray = rows => {
  const arr = [];
  for (let i = 0; i < rows.length; i++) {
    arr.push(rows.item(i));
  }
  return arr;
};

export async function getAllCategories() {
  const db = await getDBConnection();
  const [result] = await db.executeSql('SELECT * FROM categories ORDER BY name ASC');
  return rowsToArray(result.rows);
}

export async function getCategoryById(id) {
  const db = await getDBConnection();
  const [result] = await db.executeSql('SELECT * FROM categories WHERE id = ?', [id]);
  if (result.rows.length === 0) return null;
  return result.rows.item(0);
}

export async function addCustomCategory(category) {
  const db = await getDBConnection();
  const id = category.id || `custom_${Date.now()}`;
  await db.executeSql(
    'INSERT OR REPLACE INTO categories (id, name, emoji, icon, color, isCustom) VALUES (?, ?, ?, ?, ?, 1)',
    [id, category.name, category.emoji || '📦', category.icon || 'shape', category.color || '#8D6E63'],
  );
  return id;
}

export async function deleteCategory(id) {
  const db = await getDBConnection();
  await db.executeSql('DELETE FROM categories WHERE id = ? AND isCustom = 1', [id]);
}

/**
 * Returns total spent per category between two ISO timestamps (debits only).
 */
export async function getCategoryTotals({ startISO, endISO } = {}) {
  const db = await getDBConnection();
  let sql = `SELECT category, SUM(amount) as total, COUNT(*) as count
             FROM transactions WHERE type = 'debit'`;
  const params = [];
  if (startISO && endISO) {
    sql += ' AND timestamp >= ? AND timestamp <= ?';
    params.push(startISO, endISO);
  }
  sql += ' GROUP BY category ORDER BY total DESC';
  const [result] = await db.executeSql(sql, params);
  return rowsToArray(result.rows);
}

export default { getAllCategories, getCategoryById, addCustomCategory, deleteCategory, getCategoryTotals };
