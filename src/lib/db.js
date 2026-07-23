import Dexie from 'dexie';

export const db = new Dexie('InvoiceGeneratorDB');

db.version(1).stores({
  settings: 'id', // stores single object with id 'company_settings'
  clients: '++id, name, email, company',
  invoices: '++id, invoiceNumber, clientId, date, dueDate, status',
  items: '++id, name, rate'
});

export const DEFAULT_SETTINGS = {
  id: 'company_settings',
  companyName: 'Nexus Systems LLC',
  companyTagline: 'Cloud Infrastructure & Enterprise Solutions',
  ownerName: 'Raj Kumar',
  ownerTitle: 'Principal Systems Architect',
  email: 'billing@nexussystems.io',
  phone: '+91 98765 43210',
  website: 'https://rajkumar.dev',
  address: '102 Tech Hub Towers, Cyber City',
  cityStateZip: 'Gurugram, HR 122002',
  taxId: 'GSTIN07AAAAA0000A1Z5',
  beneficiaryName: 'Nexus Systems LLC',
  bankName: 'HDFC Bank',
  accountNumber: '50200012345678',
  ifscCode: 'HDFC0001234',
  upiId: 'rajkumar@upi',
  logoUrl: '', // Base64 or Blob URL
  defaultCurrency: 'INR',
  currencySymbol: '₹',
  defaultTaxRate: 18,
  paymentTerms: 'Payment due within 15 days of invoice date.',
  issuerSignatureType: 'text',
  issuerSignatureText: 'Raj Kumar',
  issuerSignatureImage: ''
};

export async function getSettings() {
  let settings = await db.settings.get('company_settings');
  if (!settings) {
    await db.settings.put(DEFAULT_SETTINGS);
    settings = DEFAULT_SETTINGS;
  }
  return settings;
}

export async function saveSettings(newSettings) {
  await db.settings.put({ ...newSettings, id: 'company_settings' });
}
