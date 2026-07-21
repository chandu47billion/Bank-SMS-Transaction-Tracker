/**
 * Regex patterns for parsing Indian bank transaction SMS messages.
 * Each entry matches a bank/format and exposes named capture groups
 * where possible. `parser.js` iterates these in order and uses the
 * first one that matches.
 */

// Generic amount matcher: "Rs.1,234.50", "Rs 1234", "INR 1,234.00", "₹500"
const AMOUNT = '(?:Rs\\.?|INR|₹)\\s?([0-9,]+(?:\\.[0-9]{1,2})?)';
const ACCOUNT_TAIL = '(?:A/c|Ac|Acct|account)?\\s?[Xx*]*(\\d{3,6})';

export const BANK_PATTERNS = [
  {
    bank: 'hdfc',
    label: 'HDFC Bank',
    test: /hdfc/i,
    debit: new RegExp(`${AMOUNT}\\s?(?:has been)?\\s?debited (?:from|to)?\\s?(?:your)?\\s?${ACCOUNT_TAIL}`, 'i'),
    credit: new RegExp(`${AMOUNT}\\s?(?:has been)?\\s?credited (?:to|from)?\\s?(?:your)?\\s?${ACCOUNT_TAIL}`, 'i'),
  },
  {
    bank: 'sbi',
    label: 'State Bank of India',
    test: /\bsbi\b/i,
    debit: new RegExp(`${AMOUNT}\\s?debited\\s?(?:from)?\\s?${ACCOUNT_TAIL}`, 'i'),
    credit: new RegExp(`${AMOUNT}\\s?credited\\s?(?:to)?\\s?${ACCOUNT_TAIL}`, 'i'),
  },
  {
    bank: 'icici',
    label: 'ICICI Bank',
    test: /icici/i,
    debit: new RegExp(`icici bank[:\\s].*?${AMOUNT}\\s?debited`, 'i'),
    credit: new RegExp(`icici bank[:\\s].*?${AMOUNT}\\s?credited`, 'i'),
  },
  {
    bank: 'axis',
    label: 'Axis Bank',
    test: /axis/i,
    debit: new RegExp(`${AMOUNT}\\s?debited`, 'i'),
    credit: new RegExp(`${AMOUNT}\\s?credited`, 'i'),
  },
  {
    bank: 'kotak',
    label: 'Kotak Mahindra Bank',
    test: /kotak/i,
    debit: new RegExp(`${AMOUNT}\\s?debited\\s?(?:from)?\\s?${ACCOUNT_TAIL}`, 'i'),
    credit: new RegExp(`${AMOUNT}\\s?credited\\s?(?:to)?\\s?${ACCOUNT_TAIL}`, 'i'),
  },
  {
    bank: 'pnb',
    label: 'Punjab National Bank',
    test: /\bpnb\b/i,
    debit: new RegExp(`${AMOUNT}\\s?debited`, 'i'),
    credit: new RegExp(`${AMOUNT}\\s?credited`, 'i'),
  },
];

// Fallback generic pattern used when no bank-specific pattern matches
// but the message still clearly looks like a transaction alert.
export const GENERIC_DEBIT = new RegExp(`${AMOUNT}\\s?(?:has been)?\\s?(?:debited|spent|paid|withdrawn)`, 'i');
export const GENERIC_CREDIT = new RegExp(`${AMOUNT}\\s?(?:has been)?\\s?(?:credited|received)`, 'i');

export const BALANCE_PATTERN = new RegExp(`(?:avl(?:ailable)?\\s?bal(?:ance)?|bal)[:\\s]*${AMOUNT}`, 'i');
export const REFERENCE_PATTERN = /(?:ref(?:erence)?(?:\s?no\.?)?|txn\s?id|utr)[:\s#-]*([A-Za-z0-9]{6,20})/i;
export const ACCOUNT_PATTERN = new RegExp(ACCOUNT_TAIL, 'i');

export const UPI_PATTERN = /\bupi\b/i;
export const ATM_PATTERN = /\batm\b|cash\s?withdrawal/i;
export const BALANCE_QUERY_PATTERN = /available balance is|your balance is|bal(?:ance)? enquiry/i;

// Merchant / payee extraction: text after "to"/"at"/"for" up to punctuation,
// or the UPI VPA / payee name pattern banks commonly use.
export const MERCHANT_PATTERNS = [
  /(?:to|at)\s+([A-Za-z0-9 .&'_-]{3,40}?)(?:\s+on|\s+dt|\s+ref|\.|,|$)/i,
  /trf to\s+([A-Za-z0-9 .&'_-]{3,40})/i,
  /info[:\s]+([A-Za-z0-9 .&'_-]{3,40})/i,
];

export default {
  BANK_PATTERNS,
  GENERIC_DEBIT,
  GENERIC_CREDIT,
  BALANCE_PATTERN,
  REFERENCE_PATTERN,
  ACCOUNT_PATTERN,
  UPI_PATTERN,
  ATM_PATTERN,
  BALANCE_QUERY_PATTERN,
  MERCHANT_PATTERNS,
};
