/**
 * Auto-categorization: maps a transaction's merchant/description text
 * (and UPI/ATM signals) to one of the known category ids.
 */

import { CATEGORIES } from '../data/categories';
import { UPI_PATTERN, ATM_PATTERN } from './patterns';

export function categorizeTransaction({ merchant = '', description = '', type = 'debit' }) {
  const text = `${merchant} ${description}`.toLowerCase();

  if (type === 'credit' && /salary|payroll|sal credit/i.test(text)) {
    return 'salary';
  }

  for (const category of CATEGORIES) {
    if (category.id === 'others' || category.id === 'upi' || category.id === 'atm' || category.id === 'salary') {
      continue;
    }
    if (category.keywords.some(kw => text.includes(kw))) {
      return category.id;
    }
  }

  if (ATM_PATTERN.test(text)) return 'atm';
  if (UPI_PATTERN.test(text)) return 'upi';

  return 'others';
}

export default { categorizeTransaction };
