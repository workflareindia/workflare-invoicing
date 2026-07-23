import Papa from 'papaparse';
import { db } from './db.js';

export function exportClientsCSV(clients) {
  const csv = Papa.unparse(clients.map(c => ({
    'Client Name': c.name || '',
    'Company': c.company || '',
    'Email': c.email || '',
    'Phone': c.phone || '',
    'Address': c.address || '',
    'Tax ID / GST': c.taxId || ''
  })));

  downloadBlob(csv, `clients_export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportInvoicesCSV(invoices) {
  const data = invoices.map(inv => ({
    'Invoice #': inv.invoiceNumber,
    'Date': inv.date,
    'Due Date': inv.dueDate,
    'Client Name': inv.clientName || '',
    'Subtotal': inv.subtotal || 0,
    'Tax Amount': inv.taxAmount || 0,
    'Total Amount': inv.totalAmount || 0,
    'Status': inv.status || 'Pending'
  }));

  const csv = Papa.unparse(data);
  downloadBlob(csv, `invoices_export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    });
  });
}

export function downloadSampleClientsCSV() {
  const sampleData = [
    {
      'Client Name': 'John Doe',
      'Company': 'Acme Corporation',
      'Email': 'john@acme.com',
      'Phone': '+1 555-0199',
      'Address': '100 Main Street, New York, NY 10001',
      'Tax ID / GST': 'US123456789'
    },
    {
      'Client Name': 'Jane Smith',
      'Company': 'Global Dynamics Ltd',
      'Email': 'jane@globaldynamics.com',
      'Phone': '+44 20 7946 0912',
      'Address': '25 Oxford Street, London W1D 2DW',
      'Tax ID / GST': 'GB987654321'
    }
  ];
  const csv = Papa.unparse(sampleData);
  downloadBlob(csv, 'sample_clients_import.csv', 'text/csv;charset=utf-8;');
}

export function downloadSampleInvoiceItemsCSV() {
  const sampleData = [
    {
      'Invoice No.': 'INV-1001',
      'Issue Date': '2026-07-23',
      'Due Date': '2026-08-07',
      'Payment Status': 'UNPAID',
      'Description': 'Full-Stack Software Development',
      'Details': 'Monthly engineering sprint deliverable & API design',
      'Qty': '1',
      'Rate': '5000'
    },
    {
      'Invoice No.': 'INV-1002',
      'Issue Date': '2026-07-20',
      'Due Date': '2026-08-04',
      'Payment Status': 'PAID',
      'Description': 'UI/UX Design & Prototyping',
      'Details': 'Design system Figma components & user flow review',
      'Qty': '10',
      'Rate': '150'
    },
    {
      'Invoice No.': 'INV-1003',
      'Issue Date': '2026-07-15',
      'Due Date': '2026-07-30',
      'Payment Status': 'NONE',
      'Description': 'Cloud Infrastructure Audit',
      'Details': 'AWS / GCP security posture assessment & report',
      'Qty': '1',
      'Rate': '2500'
    }
  ];
  const csv = Papa.unparse(sampleData);
  downloadBlob(csv, 'sample_invoice_import.csv', 'text/csv;charset=utf-8;');
}

function downloadBlob(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
