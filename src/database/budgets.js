/**
 * CRUD helpers for the `budgets` table.
 * Budgets are stored per category, per month (monthKey format: 'YYYY-MM').
 */

import {getDBConnection} from './db';

const rowsToArray = rows => {
  const arr = [];
  for (let i = 0; i < rows.length; i++) {
    arr.push(rows.item(i));
  }
  return arr;
};

export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export async function getBudgetsForMonth(monthKey = currentMonthKey()) {
  const db = await getDBConnection();
  const [result] = await db.executeSql(
    'SELECT * FROM budgets WHERE monthKey = ?',
    [monthKey],
  );
  return rowsToArray(result.rows);
}

export async function setBudget(
  categoryId,
  limitAmount,
  monthKey = currentMonthKey(),
) {
  const db = await getDBConnection();
  const id = `${categoryId}_${monthKey}`;
  await db.executeSql(
    'INSERT OR REPLACE INTO budgets (id, categoryId, monthKey, limitAmount) VALUES (?, ?, ?, ?)',
    [id, categoryId, monthKey, limitAmount],
  );
  return id;
}

export async function deleteBudget(categoryId, monthKey = currentMonthKey()) {
  const db = await getDBConnection();
  await db.executeSql(
    'DELETE FROM budgets WHERE categoryId = ? AND monthKey = ?',
    [categoryId, monthKey],
  );
}

export async function getBudgetForCategory(
  categoryId,
  monthKey = currentMonthKey(),
) {
  const db = await getDBConnection();
  const [result] = await db.executeSql(
    'SELECT * FROM budgets WHERE categoryId = ? AND monthKey = ?',
    [categoryId, monthKey],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows.item(0);
}

export default {
  getBudgetsForMonth,
  setBudget,
  deleteBudget,
  getBudgetForCategory,
  currentMonthKey,
};
