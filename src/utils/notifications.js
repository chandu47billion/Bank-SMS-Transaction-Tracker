/**
 * App-generated notification/insight logic. Derives a list of
 * human-readable notifications from the current transaction set
 * (no push notifications - these are shown in the Notifications screen).
 */

import { formatCurrency, formatDayLabel } from './formatters';
import { getCurrentMonthRange, summarizeTransactions } from './helpers';

const LARGE_EXPENSE_THRESHOLD = 5000;
const LOW_BALANCE_THRESHOLD = 2000;

export function generateNotifications(transactions) {
  const notifications = [];
  const sorted = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Salary credited
  const salaryTxns = sorted.filter(t => t.category === 'salary' && t.type === 'credit');
  if (salaryTxns.length > 0) {
    const t = salaryTxns[0];
    notifications.push({
      id: `salary_${t.id}`,
      type: 'salary',
      icon: 'cash-multiple',
      color: '#27AE60',
      title: 'Salary Credited',
      message: `${formatCurrency(t.amount)} credited to your ${t.bank ? t.bank.toUpperCase() : ''} account`,
      timestamp: t.timestamp,
    });
  }

  // Large expense alerts
  sorted
    .filter(t => t.type === 'debit' && t.amount > LARGE_EXPENSE_THRESHOLD)
    .slice(0, 5)
    .forEach(t => {
      notifications.push({
        id: `large_${t.id}`,
        type: 'alert',
        icon: 'alert-circle',
        color: '#E74C3C',
        title: 'Large Expense Alert',
        message: `${formatCurrency(t.amount)} spent on ${t.merchant || 'a transaction'}`,
        timestamp: t.timestamp,
      });
    });

  // Low balance warning
  const latestWithBalance = sorted.find(t => t.balance != null);
  if (latestWithBalance && latestWithBalance.balance < LOW_BALANCE_THRESHOLD) {
    notifications.push({
      id: `lowbal_${latestWithBalance.id}`,
      type: 'warning',
      icon: 'alert',
      color: '#F39C12',
      title: 'Low Balance Warning',
      message: `Your available balance is ${formatCurrency(latestWithBalance.balance)}`,
      timestamp: latestWithBalance.timestamp,
    });
  }

  // Unusual spending detection: today's debit total is 2x+ the recent daily average
  const unusual = detectUnusualSpending(sorted);
  if (unusual) {
    notifications.push(unusual);
  }

  // Weekly summary
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekTxns = sorted.filter(t => new Date(t.timestamp) >= weekAgo);
  if (weekTxns.length > 0) {
    const summary = summarizeTransactions(weekTxns);
    notifications.push({
      id: 'weekly_summary',
      type: 'summary',
      icon: 'chart-line',
      color: '#2E86AB',
      title: 'Weekly Summary',
      message: `You spent ${formatCurrency(summary.debit)} and received ${formatCurrency(summary.credit)} this week`,
      timestamp: new Date().toISOString(),
    });
  }

  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function detectUnusualSpending(sortedTxns) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTxns = sortedTxns.filter(t => new Date(t.timestamp) >= today && t.type === 'debit');
  if (todayTxns.length === 0) return null;

  const todayTotal = todayTxns.reduce((sum, t) => sum + t.amount, 0);

  const past30 = new Date();
  past30.setDate(past30.getDate() - 30);
  const recentDebits = sortedTxns.filter(t => t.type === 'debit' && new Date(t.timestamp) >= past30);
  const dailyAvg = recentDebits.reduce((sum, t) => sum + t.amount, 0) / 30;

  if (dailyAvg > 0 && todayTotal > dailyAvg * 2) {
    return {
      id: `unusual_${today.toISOString()}`,
      type: 'insight',
      icon: 'trending-up',
      color: '#8E44AD',
      title: 'Unusual Spending Detected',
      message: `${formatDayLabel(today.toISOString())}'s spending (${formatCurrency(todayTotal)}) is higher than your daily average`,
      timestamp: new Date().toISOString(),
    };
  }
  return null;
}

export function getMonthlySpendAlert(transactions, budgetTotal) {
  const { startISO, endISO } = getCurrentMonthRange();
  const monthTxns = transactions.filter(t => t.timestamp >= startISO && t.timestamp <= endISO && t.type === 'debit');
  const spent = monthTxns.reduce((sum, t) => sum + t.amount, 0);
  if (budgetTotal > 0 && spent > budgetTotal) {
    return {
      id: 'budget_exceeded',
      type: 'alert',
      icon: 'alert-octagon',
      color: '#E74C3C',
      title: 'Budget Exceeded',
      message: `You've spent ${formatCurrency(spent)} against a budget of ${formatCurrency(budgetTotal)} this month`,
      timestamp: new Date().toISOString(),
    };
  }
  return null;
}

export default { generateNotifications, getMonthlySpendAlert };
