/**
 * Supported Indian banks with brand colors and short codes.
 * Used across the SMS parser, Banks screen and filters.
 */

export const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', shortCode: 'HDFC', color: '#004C8F', senderIds: ['HDFCBK', 'HDFC'] },
  { id: 'sbi', name: 'State Bank of India', shortCode: 'SBI', color: '#22409A', senderIds: ['SBIINB', 'SBIPSG', 'SBI'] },
  { id: 'icici', name: 'ICICI Bank', shortCode: 'ICICI', color: '#F37021', senderIds: ['ICICIB', 'ICICI'] },
  { id: 'axis', name: 'Axis Bank', shortCode: 'AXIS', color: '#97144D', senderIds: ['AXISBK', 'AXIS'] },
  { id: 'kotak', name: 'Kotak Mahindra Bank', shortCode: 'KOTAK', color: '#ED1C24', senderIds: ['KOTAKB', 'KOTAK'] },
  { id: 'pnb', name: 'Punjab National Bank', shortCode: 'PNB', color: '#7A1F2B', senderIds: ['PNBSMS', 'PNB'] },
  { id: 'other', name: 'Other Bank', shortCode: 'BANK', color: '#5D6D7E', senderIds: [] },
];

export const getBankById = id => BANKS.find(b => b.id === id) || BANKS[BANKS.length - 1];

export const getBankByName = name => {
  if (!name) return BANKS[BANKS.length - 1];
  const lower = name.toLowerCase();
  return BANKS.find(b => lower.includes(b.id) || lower.includes(b.shortCode.toLowerCase())) || BANKS[BANKS.length - 1];
};

export default BANKS;
