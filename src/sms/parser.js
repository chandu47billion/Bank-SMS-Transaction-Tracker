/**
 * SMS parsing pipeline. Given a raw SMS body (and optional metadata),
 * extracts a normalized transaction object or returns null if the
 * message doesn't look like a bank transaction alert.
 */

import {
  BANK_PATTERNS,
  GENERIC_DEBIT,
  GENERIC_CREDIT,
  BALANCE_PATTERN,
  REFERENCE_PATTERN,
  ACCOUNT_PATTERN,
  MERCHANT_PATTERNS,
  BALANCE_QUERY_PATTERN,
} from './patterns';
import { categorizeTransaction } from './categorizer';
import { getBankByName } from '../data/banks';

const parseAmount = str => {
  if (!str) return null;
  const cleaned = str.replace(/,/g, '');
  const value = parseFloat(cleaned);
  return Number.isNaN(value) ? null : value;
};

const extractBalance = text => {
  const match = text.match(BALANCE_PATTERN);
  return match ? parseAmount(match[1]) : null;
};

const extractReference = text => {
  const match = text.match(REFERENCE_PATTERN);
  return match ? match[1] : null;
};

const extractAccountLast4 = text => {
  const match = text.match(ACCOUNT_PATTERN);
  return match ? match[1].slice(-4) : null;
};

const extractMerchant = text => {
  for (const pattern of MERCHANT_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }
  return null;
};

const detectBankFromSender = (sender, text) => {
  if (sender) {
    const bank = getBankByName(sender);
    if (bank && bank.id !== 'other') return bank.id;
  }
  for (const p of BANK_PATTERNS) {
    if (p.test.test(text)) return p.bank;
  }
  return 'other';
};

/**
 * Parses a single SMS message.
 * @param {object} sms - { body, sender, timestamp }
 * @returns {object|null} normalized transaction or null if not a transaction SMS
 */
export function parseSms(sms) {
  const { body, sender, timestamp } = sms;
  if (!body || typeof body !== 'string') return null;
  const text = body.trim();

  // Skip pure balance-enquiry messages (no debit/credit action)
  if (BALANCE_QUERY_PATTERN.test(text) && !GENERIC_DEBIT.test(text) && !GENERIC_CREDIT.test(text)) {
    return null;
  }

  const bankId = detectBankFromSender(sender, text);
  const bankPattern = BANK_PATTERNS.find(p => p.bank === bankId);

  let type = null;
  let amount = null;

  if (bankPattern) {
    const debitMatch = text.match(bankPattern.debit);
    const creditMatch = text.match(bankPattern.credit);
    if (debitMatch) {
      type = 'debit';
      amount = parseAmount(debitMatch[1]);
    } else if (creditMatch) {
      type = 'credit';
      amount = parseAmount(creditMatch[1]);
    }
  }

  // Fallback to generic patterns if bank-specific pattern didn't match
  if (!type) {
    const genericDebit = text.match(GENERIC_DEBIT);
    const genericCredit = text.match(GENERIC_CREDIT);
    if (genericDebit) {
      type = 'debit';
      amount = parseAmount(genericDebit[1]);
    } else if (genericCredit) {
      type = 'credit';
      amount = parseAmount(genericCredit[1]);
    }
  }

  if (!type || amount == null) {
    return null; // not recognized as a transaction SMS
  }

  const merchant = extractMerchant(text);
  const description = merchant ? `Payment ${type === 'debit' ? 'to' : 'from'} ${merchant}` : text.slice(0, 60);
  const category = categorizeTransaction({ merchant: merchant || '', description: text, type });

  return {
    amount,
    type,
    bank: bankId,
    accountLast4: extractAccountLast4(text),
    merchant: merchant || (bankPattern ? bankPattern.label : 'Unknown'),
    description,
    category,
    balance: extractBalance(text),
    referenceNo: extractReference(text),
    timestamp: timestamp || new Date().toISOString(),
    source: 'sms',
    rawSms: text,
  };
}

/**
 * Parses a batch of raw SMS messages, filtering out non-transaction
 * messages (OTPs, promos, balance enquiries, unparseable text).
 */
export function parseSmsBatch(smsList) {
  const results = [];
  for (const sms of smsList) {
    try {
      const parsed = parseSms(sms);
      if (parsed) results.push(parsed);
    } catch (e) {
      // skip malformed message, continue processing the rest of the batch
      continue;
    }
  }
  return results;
}

export default { parseSms, parseSmsBatch };
