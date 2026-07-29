<script>
  import { onMount } from 'svelte';
  import Header from './lib/components/Header.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import InvoicePreview from './lib/components/InvoicePreview.svelte';
  import SettingsModal from './lib/components/SettingsModal.svelte';
  import ClientManager from './lib/components/ClientManager.svelte';
  import BulkCsvModal from './lib/components/BulkCsvModal.svelte';
  import PwaRegister from './lib/components/PwaRegister.svelte';
  import { getSettings, db } from './lib/db.js';

  let settings = {};
  let clients = [];
  let invoices = [];
  let activeTemplate = 'emerald';

  let isSettingsOpen = false;
  let isClientsOpen = false;
  let isBulkCsvOpen = false;

  // Mobile view state: 'editor' | 'preview'
  let mobileView = 'editor';

  let invoice = {
    invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    periodFrom: '',
    periodTo: '',
    status: 'UNPAID',
    clientName: 'Sarah Jenkins',
    clientCompany: 'TechCorp Global Solutions',
    clientEmail: 'billing@techcorpglobal.com',
    clientAddress: '450 Innovation Parkway, Suite 800, San Francisco, CA 94107',
    clientTaxId: 'US-EIN-987654321',
    currencySymbol: '₹',
    taxRate: 18,
    items: [
      {
        description: 'Monthly Engineering Retainer — Full Stack Development',
        subText: 'Core architecture, feature development, API optimizations, and production support.',
        quantity: 1,
        rate: 150000
      }
    ],
    notes: 'Payment due within 15 days of invoice date. Late payments subject to a 1.5% interest charge per month.',
    clientSignatureType: 'text',
    clientSignatureText: 'Sarah Jenkins',
    clientSignatureName: 'Sarah Jenkins',
    clientSignatureDesignation: 'VP of Engineering',
    clientSignatureImage: ''
  };

  $: subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  $: taxAmount = (subtotal * (invoice.taxRate || 0)) / 100;
  $: totalAmount = subtotal + taxAmount;

  $: invoice.subtotal = subtotal;
  $: invoice.taxAmount = taxAmount;
  $: invoice.totalAmount = totalAmount;

  onMount(async () => {
    settings = await getSettings();
    await loadDatabaseData();
  });

  async function loadDatabaseData() {
    clients = await db.clients.toArray();
    invoices = await db.invoices.toArray();
  }

  function handleSelectClient(client) {
    invoice.clientName = client.name || '';
    invoice.clientCompany = client.company || '';
    invoice.clientEmail = client.email || '';
    invoice.clientPhone = client.phone || '';
    invoice.clientAddress = client.address || '';
    invoice.clientTaxId = client.taxId || '';
    invoice.clientSignatureText = '';
    invoice.clientSignatureName = '';
  }

  async function handleSaveInvoice() {
    await db.invoices.put({
      ...invoice,
      updatedAt: new Date().toISOString()
    });
    await loadDatabaseData();
    // On mobile, switch to preview after saving
    mobileView = 'preview';
    alert('Invoice saved! Showing preview.');
  }

  function handleNewInvoice() {
    invoice = {
      invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      periodFrom: '',
      periodTo: '',
      status: 'UNPAID',
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      clientAddress: '',
      clientTaxId: '',
      currencySymbol: settings.currencySymbol || '₹',
      taxRate: settings.defaultTaxRate || 0,
      items: [
        { description: '', subText: '', quantity: 1, rate: 0 }
      ],
      notes: settings.paymentTerms || '',
      clientSignatureType: 'text',
      clientSignatureText: '',
      clientSignatureName: '',
      clientSignatureDesignation: '',
      clientSignatureImage: ''
    };
    // Go back to editor on new invoice
    mobileView = 'editor';
  }

  function handleImportInvoiceData(meta, items) {
    if (meta.invoiceNumber) invoice.invoiceNumber = meta.invoiceNumber;
    if (meta.date) invoice.date = meta.date;
    if (meta.dueDate) invoice.dueDate = meta.dueDate;
    if (meta.status) invoice.status = meta.status;
    if (meta.selectedClient) {
      handleSelectClient(meta.selectedClient);
    }
    if (items && items.length > 0) {
      invoice.items = items;
    }
  }

  async function handleResetDb() {
    if (confirm('Are you sure you want to delete all stored clients, invoices, and custom settings from local IndexedDB database?')) {
      await db.delete();
      window.location.reload();
    }
  }
</script>

<div class="app-layout">
  <Header 
    onOpenSettings={() => isSettingsOpen = true}
    onOpenClients={() => isClientsOpen = true}
    onOpenBulkCsv={() => isBulkCsvOpen = true}
    onNewInvoice={handleNewInvoice}
    onResetDb={handleResetDb}
    {mobileView}
    onSwitchView={(v) => mobileView = v}
  />

  <main class="main-content">
    <!-- Editor panel: always shown on desktop; on mobile shown when mobileView==='editor' -->
    <div class="sidebar-wrapper" class:mobile-hidden={mobileView === 'preview'}>
      <Sidebar 
        bind:invoice
        {settings}
        {clients}
        {invoices}
        onSelectClient={handleSelectClient}
        onSaveInvoice={handleSaveInvoice}
        onNewInvoice={handleNewInvoice}
        onOpenBulkCsv={() => isBulkCsvOpen = true}
      />
    </div>

    <!-- Preview panel: always shown on desktop; on mobile shown when mobileView==='preview' -->
    <section class="preview-area" class:mobile-hidden={mobileView === 'editor'}>
      <InvoicePreview {invoice} {settings} template={activeTemplate} />
    </section>
  </main>

  <SettingsModal 
    bind:settings
    isOpen={isSettingsOpen} 
    onClose={() => isSettingsOpen = false} 
  />

  <ClientManager 
    isOpen={isClientsOpen} 
    onClose={() => isClientsOpen = false}
    onSelectClient={handleSelectClient}
  />

  <BulkCsvModal 
    isOpen={isBulkCsvOpen} 
    onClose={() => isBulkCsvOpen = false}
    {invoices}
    {clients}
    onLoadInvoice={(inv) => invoice = inv}
  />
  <PwaRegister />
</div>

<style>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    display: flex;
    flex: 1;
    height: calc(100vh - 60px);
    overflow: hidden;
  }

  .sidebar-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .preview-area {
    flex: 1;
    padding: 30px;
    background: var(--bg-page);
    overflow-y: auto;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .main-content {
      height: calc(100vh - 56px);
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-wrapper {
      width: 100%;
      height: 100%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .preview-area {
      width: 100%;
      height: 100%;
      padding: 8px;
      overflow-y: auto;
    }

    /* Hide panels based on mobile view state */
    .mobile-hidden {
      display: none !important;
    }
  }
</style>
