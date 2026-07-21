/**
 * Miscellaneous helper functions shared across screens.
 */

import {getCategoryById} from '../data/categories';
import {getBankById} from '../data/banks';
import {currentMonthKey} from '../database/budgets';

export function getDateRangeForFilter(filter) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  let start = new Date(now);

  switch (filter) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      start = new Date(2000, 0, 1);
  }
  return {startISO: start.toISOString(), endISO: end.toISOString()};
}

export function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return {startISO: start.toISOString(), endISO: end.toISOString()};
}

export function getTodayRange() {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  return {startISO: start.toISOString(), endISO: end.toISOString()};
}

export function getMonthRange(monthKey = currentMonthKey()) {
  const [year, month] = monthKey.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return {startISO: start.toISOString(), endISO: end.toISOString()};
}

export function summarizeTransactions(transactions) {
  let credit = 0;
  let debit = 0;
  transactions.forEach(t => {
    if (t.type === 'credit') {
      credit += t.amount;
    } else {
      debit += t.amount;
    }
  });
  return {credit, debit, net: credit - debit, count: transactions.length};
}

export function groupByCategory(transactions) {
  const map = {};
  transactions
    .filter(t => t.type === 'debit')
    .forEach(t => {
      if (!map[t.category]) {
        map[t.category] = 0;
      }
      map[t.category] += t.amount;
    });
  return Object.entries(map)
    .map(([categoryId, total]) => ({
      categoryId,
      category: getCategoryById(categoryId),
      total,
    }))
    .sort((a, b) => b.total - a.total);
}

export function groupByDay(transactions) {
  const map = {};
  transactions.forEach(t => {
    const day = t.timestamp.slice(0, 10);
    if (!map[day]) {
      map[day] = {credit: 0, debit: 0};
    }
    if (t.type === 'credit') {
      map[day].credit += t.amount;
    } else {
      map[day].debit += t.amount;
    }
  });
  return Object.entries(map)
    .map(([date, totals]) => ({date, ...totals}))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function enrichTransaction(txn) {
  return {
    ...txn,
    categoryInfo: getCategoryById(txn.category),
    bankInfo: getBankById(txn.bank),
  };
}

export function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default {
  getDateRangeForFilter,
  getCurrentMonthRange,
  getTodayRange,
  getMonthRange,
  summarizeTransactions,
  groupByCategory,
  groupByDay,
  enrichTransaction,
  debounce,
  clamp,
};
