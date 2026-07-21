/**
 * Realistic sample transaction data used to pre-populate the local database
 * on first launch (before any real SMS have been parsed). Dates are computed
 * relative to "now" so the data always spans the last ~2 months.
 */

import {getBankById} from './banks';

let idCounter = 1;
const nextId = () => `seed_${idCounter++}`;

const daysAgo = (days, hour = 10, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const buildTxn = ({
  day,
  hour,
  minute,
  amount,
  type,
  bank,
  last4,
  merchant,
  description,
  category,
  balance,
  refNo,
}) => ({
  id: nextId(),
  amount,
  type,
  bank,
  accountLast4: last4,
  merchant,
  description,
  category,
  balance,
  referenceNo: refNo,
  timestamp: daysAgo(day, hour, minute),
  source: 'seed',
});

/**
 * Generates a deterministic, realistic set of 40+ transactions
 * spanning the last ~60 days across multiple banks and categories.
 */
export function generateSeedTransactions() {
  const txns = [];
  let balance = 84500;

  const push = fields => {
    txns.push(buildTxn({...fields, balance}));
  };

  const applyDebit = amt => {
    balance -= amt;
  };
  const applyCredit = amt => {
    balance += amt;
  };

  // --- Salary credits (monthly, HDFC) ---
  applyCredit(68000);
  push({
    day: 58,
    hour: 9,
    minute: 5,
    amount: 68000,
    type: 'credit',
    bank: 'hdfc',
    last4: '4521',
    merchant: 'ACME TECHNOLOGIES PVT LTD',
    description: 'Salary credited for last month',
    category: 'salary',
    refNo: 'REF10023481',
  });

  applyCredit(69500);
  push({
    day: 28,
    hour: 9,
    minute: 12,
    amount: 69500,
    type: 'credit',
    bank: 'hdfc',
    last4: '4521',
    merchant: 'ACME TECHNOLOGIES PVT LTD',
    description: 'Salary credited for last month',
    category: 'salary',
    refNo: 'REF10098213',
  });

  // --- UPI food delivery ---
  const foodOrders = [
    {day: 55, amt: 420, merchant: 'SWIGGY', bank: 'sbi'},
    {day: 50, amt: 610, merchant: 'ZOMATO', bank: 'icici'},
    {day: 45, amt: 275, merchant: 'SWIGGY', bank: 'sbi'},
    {day: 40, amt: 890, merchant: 'DOMINOS PIZZA', bank: 'hdfc'},
    {day: 33, amt: 350, merchant: 'ZOMATO', bank: 'icici'},
    {day: 24, amt: 520, merchant: 'SWIGGY', bank: 'sbi'},
    {day: 16, amt: 680, merchant: 'CAFE COFFEE DAY', bank: 'hdfc'},
    {day: 9, amt: 310, merchant: 'ZOMATO', bank: 'icici'},
    {day: 3, amt: 445, merchant: 'SWIGGY', bank: 'sbi'},
  ];
  foodOrders.forEach(({day, amt, merchant, bank}) => {
    applyDebit(amt);
    push({
      day,
      hour: 13,
      minute: 30,
      amount: amt,
      type: 'debit',
      bank,
      last4: getBankById(bank).id === 'sbi' ? '7845' : '4521',
      merchant,
      description: `UPI payment to ${merchant}`,
      category: 'food',
      refNo: `UPI${400000000 + day * 37}`,
    });
  });

  // --- Shopping ---
  const shopping = [
    {day: 52, amt: 2450, merchant: 'AMAZON', bank: 'hdfc'},
    {day: 44, amt: 3899, merchant: 'FLIPKART', bank: 'sbi'},
    {day: 37, amt: 1299, merchant: 'MYNTRA', bank: 'icici'},
    {day: 21, amt: 5600, merchant: 'AMAZON', bank: 'hdfc'},
    {day: 12, amt: 899, merchant: 'AJIO', bank: 'sbi'},
    {day: 6, amt: 2150, merchant: 'FLIPKART', bank: 'icici'},
  ];
  shopping.forEach(({day, amt, merchant, bank}) => {
    applyDebit(amt);
    push({
      day,
      hour: 19,
      minute: 45,
      amount: amt,
      type: 'debit',
      bank,
      last4: '4521',
      merchant,
      description: `Payment to ${merchant}`,
      category: 'shopping',
      refNo: `TXN${500000000 + day * 41}`,
    });
  });

  // --- ATM withdrawals ---
  const atms = [
    {day: 49, amt: 5000, bank: 'sbi'},
    {day: 34, amt: 10000, bank: 'hdfc'},
    {day: 19, amt: 5000, bank: 'sbi'},
    {day: 4, amt: 8000, bank: 'icici'},
  ];
  atms.forEach(({day, amt, bank}) => {
    applyDebit(amt);
    push({
      day,
      hour: 11,
      minute: 0,
      amount: amt,
      type: 'debit',
      bank,
      last4: '7845',
      merchant: 'ATM Withdrawal',
      description: 'Cash withdrawal at ATM',
      category: 'atm',
      refNo: `ATM${600000000 + day * 53}`,
    });
  });

  // --- Bills ---
  const bills = [
    {
      day: 47,
      amt: 1850,
      merchant: 'BESCOM ELECTRICITY',
      bank: 'hdfc',
      category: 'bills',
    },
    {
      day: 42,
      amt: 599,
      merchant: 'AIRTEL POSTPAID',
      bank: 'sbi',
      category: 'bills',
    },
    {
      day: 30,
      amt: 799,
      merchant: 'JIO FIBER',
      bank: 'icici',
      category: 'bills',
    },
    {
      day: 17,
      amt: 1920,
      merchant: 'BESCOM ELECTRICITY',
      bank: 'hdfc',
      category: 'bills',
    },
    {
      day: 8,
      amt: 599,
      merchant: 'AIRTEL POSTPAID',
      bank: 'sbi',
      category: 'bills',
    },
  ];
  bills.forEach(({day, amt, merchant, bank, category}) => {
    applyDebit(amt);
    push({
      day,
      hour: 8,
      minute: 15,
      amount: amt,
      type: 'debit',
      bank,
      last4: '4521',
      merchant,
      description: `Bill payment to ${merchant}`,
      category,
      refNo: `BIL${700000000 + day * 59}`,
    });
  });

  // --- Fuel ---
  const fuel = [
    {day: 46, amt: 2000, bank: 'hdfc'},
    {day: 31, amt: 1500, bank: 'sbi'},
    {day: 15, amt: 2200, bank: 'icici'},
    {day: 2, amt: 1800, bank: 'hdfc'},
  ];
  fuel.forEach(({day, amt, bank}) => {
    applyDebit(amt);
    push({
      day,
      hour: 18,
      minute: 0,
      amount: amt,
      type: 'debit',
      bank,
      last4: '4521',
      merchant: 'Indian Oil Petrol Pump',
      description: 'Fuel purchase',
      category: 'fuel',
      refNo: `FUE${800000000 + day * 61}`,
    });
  });

  // --- Medical ---
  const medical = [
    {day: 38, amt: 650, merchant: 'APOLLO PHARMACY', bank: 'sbi'},
    {day: 20, amt: 1450, merchant: 'MEDPLUS', bank: 'hdfc'},
    {day: 5, amt: 380, merchant: 'NETMEDS', bank: 'icici'},
  ];
  medical.forEach(({day, amt, merchant, bank}) => {
    applyDebit(amt);
    push({
      day,
      hour: 17,
      minute: 30,
      amount: amt,
      type: 'debit',
      bank,
      last4: '7845',
      merchant,
      description: `Payment to ${merchant}`,
      category: 'medical',
      refNo: `MED${900000000 + day * 67}`,
    });
  });

  // --- Entertainment (subscriptions) ---
  const entertainment = [
    {day: 54, amt: 649, merchant: 'NETFLIX', bank: 'hdfc'},
    {day: 48, amt: 119, merchant: 'SPOTIFY', bank: 'hdfc'},
    {day: 25, amt: 649, merchant: 'NETFLIX', bank: 'hdfc'},
    {day: 14, amt: 599, merchant: 'BOOKMYSHOW', bank: 'sbi'},
  ];
  entertainment.forEach(({day, amt, merchant, bank}) => {
    applyDebit(amt);
    push({
      day,
      hour: 20,
      minute: 0,
      amount: amt,
      type: 'debit',
      bank,
      last4: '4521',
      merchant,
      description: `Payment to ${merchant}`,
      category: 'entertainment',
      refNo: `ENT${100000000 + day * 71}`,
    });
  });

  // --- UPI misc / P2P transfers ---
  const upiMisc = [
    {day: 43, amt: 1200, merchant: 'RAHUL SHARMA', bank: 'icici'},
    {day: 27, amt: 500, merchant: 'PRIYA VERMA', bank: 'sbi'},
    {day: 11, amt: 2500, merchant: 'ROOMMATE RENT SPLIT', bank: 'hdfc'},
    {day: 1, amt: 300, merchant: 'AUTO DRIVER', bank: 'icici'},
  ];
  upiMisc.forEach(({day, amt, merchant, bank}) => {
    applyDebit(amt);
    push({
      day,
      hour: 12,
      minute: 10,
      amount: amt,
      type: 'debit',
      bank,
      last4: '7845',
      merchant,
      description: `UPI transfer to ${merchant}`,
      category: 'upi',
      refNo: `UPI${200000000 + day * 73}`,
    });
  });

  // --- Travel ---
  const travel = [
    {day: 36, amt: 480, merchant: 'UBER', bank: 'sbi'},
    {day: 22, amt: 3200, merchant: 'IRCTC', bank: 'hdfc'},
    {day: 7, amt: 260, merchant: 'OLA', bank: 'icici'},
  ];
  travel.forEach(({day, amt, merchant, bank}) => {
    applyDebit(amt);
    push({
      day,
      hour: 9,
      minute: 40,
      amount: amt,
      type: 'debit',
      bank,
      last4: '4521',
      merchant,
      description: `Payment to ${merchant}`,
      category: 'travel',
      refNo: `TRV${300000000 + day * 79}`,
    });
  });

  // --- Small interest / refund credit ---
  applyCredit(340);
  push({
    day: 39,
    hour: 6,
    minute: 0,
    amount: 340,
    type: 'credit',
    bank: 'hdfc',
    last4: '4521',
    merchant: 'HDFC BANK',
    description: 'Quarterly interest credited',
    category: 'others',
    refNo: 'INT88213',
  });

  applyCredit(1200);
  push({
    day: 13,
    hour: 15,
    minute: 20,
    amount: 1200,
    type: 'credit',
    bank: 'icici',
    last4: '7845',
    merchant: 'AMAZON REFUND',
    description: 'Refund for returned item',
    category: 'others',
    refNo: 'RFD44521',
  });

  // Sort by timestamp ascending, then recompute a running balance for realism
  txns.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  let runningBalance = 20000;
  txns.forEach(t => {
    runningBalance += t.type === 'credit' ? t.amount : -t.amount;
    t.balance = Math.round(runningBalance);
  });

  // Return newest first (typical inbox/list order)
  return txns.slice().reverse();
}

export const SEED_TRANSACTIONS = generateSeedTransactions();

export default SEED_TRANSACTIONS;
