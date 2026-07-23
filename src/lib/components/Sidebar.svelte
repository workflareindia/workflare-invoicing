<script>
  import { Plus, Trash2, UserCheck, Save, Bookmark, Upload, FileText, FileSpreadsheet } from '@lucide/svelte';

  export let invoice;
  export let settings = {};
  export let clients = [];
  export let invoices = [];
  export let onSelectClient;
  export let onSaveInvoice;
  export let onNewInvoice;
  export let onOpenBulkCsv;

  function addLineItem() {
    invoice.items = [
      ...invoice.items,
      { description: 'Development Services', subText: '', quantity: 1, rate: 1000 }
    ];
  }

  function removeLineItem(index) {
    invoice.items = invoice.items.filter((_, i) => i !== index);
  }

  function handleClientSignatureUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        invoice.clientSignatureImage = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleClientSelect(e) {
    const selectedId = e.target.value;
    if (selectedId === 'new') return;
    const client = clients.find(c => String(c.id) === String(selectedId));
    if (client) {
      onSelectClient(client);
    }
  }

  function handleInvoiceSelect(e) {
    const selectedInvNo = e.target.value;
    if (!selectedInvNo) return;
    const found = invoices.find(inv => inv.invoiceNumber === selectedInvNo);
    if (found) {
      invoice = { ...found };
    }
  }
</script>

<aside class="sidebar no-print">
  <div class="sidebar-header">
    <div class="header-top">
      <h2>Invoice Editor</h2>
      <div class="btn-group">
        <button class="btn btn-secondary btn-sm" on:click={onNewInvoice} title="Create blank new invoice">
          <Plus size={13} /> New Invoice
        </button>
        <button class="btn btn-primary btn-sm" on:click={onSaveInvoice}>
          <Save size={13} /> Save
        </button>
      </div>
    </div>
  </div>

  <div class="sidebar-body">
    <!-- Saved Invoices & Bulk CSV Section -->
    <div class="form-section">
      <div class="section-label flex-between">
        <span>LOAD SAVED / IMPORTED INVOICE</span>
        <button class="text-btn" on:click={onOpenBulkCsv}>
          <FileSpreadsheet size={12} /> Bulk CSV Import
        </button>
      </div>
      {#if invoices && invoices.length > 0}
        <div class="form-row">
          <select on:change={handleInvoiceSelect} value={invoice.invoiceNumber}>
            <option value="">-- Choose Invoice ({invoices.length} Saved) --</option>
            {#each invoices as inv}
              <option value={inv.invoiceNumber}>
                #{inv.invoiceNumber} - {inv.clientCompany || inv.clientName || 'Draft'} ({inv.status})
              </option>
            {/each}
          </select>
        </div>
      {/if}
    </div>

    <!-- Client Section -->
    <div class="form-section">
      <div class="section-label">
        <span>CLIENT INFORMATION</span>
      </div>
      <div class="form-row">
        <label>Select Saved Client</label>
        <select on:change={handleClientSelect}>
          <option value="">-- Custom / Select Client --</option>
          {#each clients as c}
            <option value={c.id}>{c.company || c.name}</option>
          {/each}
        </select>
      </div>

      <div class="form-row">
        <label>Client Contact Name</label>
        <input type="text" bind:value={invoice.clientName} placeholder="John Doe" />
      </div>

      <div class="form-row">
        <label>Client Company Name</label>
        <input type="text" bind:value={invoice.clientCompany} placeholder="Acme Corp" />
      </div>

      <div class="grid-2">
        <div class="form-row">
          <label>Client Email</label>
          <input type="email" bind:value={invoice.clientEmail} placeholder="john@acme.com" />
        </div>
        <div class="form-row">
          <label>Client Phone No.</label>
          <input type="text" bind:value={invoice.clientPhone} placeholder="+91 98765 43210" />
        </div>
      </div>

      <div class="form-row">
        <label>Client Tax ID / GSTIN</label>
        <input type="text" bind:value={invoice.clientTaxId} placeholder="e.g. 07AAAAA0000A1Z5 / US-EIN" />
      </div>

      <div class="form-row">
        <label>Billing Address</label>
        <textarea bind:value={invoice.clientAddress} placeholder="Street, City, Country"></textarea>
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="form-section">
      <div class="section-label">
        <span>INVOICE DETAILS</span>
      </div>

      <div class="grid-2">
        <div class="form-row">
          <label>Invoice #</label>
          <input type="text" bind:value={invoice.invoiceNumber} />
        </div>
        <div class="form-row">
          <label id="lbl-currency" for="input-currency">Currency</label>
          <select 
            id="input-currency" 
            bind:value={invoice.currencyKey} 
            on:change={(e) => {
              const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
              invoice.currencySymbol = symbols[e.target.value] || '₹';
            }}
          >
            <option value="INR">₹ (INR)</option>
            <option value="USD">$ (USD)</option>
            <option value="EUR">€ (EUR)</option>
            <option value="GBP">£ (GBP)</option>
          </select>
        </div>
      </div>

      <div class="grid-2">
        <div class="form-row">
          <label>Invoice Date</label>
          <input type="date" bind:value={invoice.date} />
        </div>
        <div class="form-row">
          <label>Due Date</label>
          <input type="date" bind:value={invoice.dueDate} />
        </div>
      </div>

      <div class="grid-2">
        <div class="form-row">
          <label id="lbl-periodFrom" for="input-periodFrom">Period From</label>
          <input id="input-periodFrom" type="date" bind:value={invoice.periodFrom} />
        </div>
        <div class="form-row">
          <label id="lbl-periodTo" for="input-periodTo">Period To</label>
          <input id="input-periodTo" type="date" bind:value={invoice.periodTo} />
        </div>
      </div>

      <div class="grid-2">
        <div class="form-row">
          <label id="lbl-status" for="input-status">Payment Status Badge</label>
          <select id="input-status" bind:value={invoice.status}>
            <option value="UNPAID">Unpaid / Due</option>
            <option value="PAID">Paid</option>
            <option value="NONE">None (Hidden)</option>
          </select>
        </div>
        <div class="form-row">
          <label id="lbl-taxRate" for="input-taxRate">Tax Rate (%)</label>
          <input 
            id="input-taxRate" 
            type="number" 
            bind:value={invoice.taxRate} 
            min="0" 
            step="0.5" 
            disabled={!settings.taxId} 
            title={!settings.taxId ? 'Disabled because no Tax/GST ID is set in Globals' : ''}
          />
          {#if !settings.taxId}
            <p class="field-hint">Tax is 0% (No GST ID set in Globals)</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Line Items Section -->
    <div class="form-section">
      <div class="section-label flex-between">
        <span>LINE ITEMS</span>
        <button class="text-btn" on:click={addLineItem}><Plus size={12} /> Add Item</button>
      </div>

      {#each invoice.items as item, index}
        <div class="item-card">
          <div class="item-card-header">
            <span class="item-num">Item #{index + 1}</span>
            <button class="icon-btn-danger" on:click={() => removeLineItem(index)}><Trash2 size={13} /></button>
          </div>
          <input type="text" bind:value={item.description} placeholder="Item / Service description" class="mb-4" />
          <input type="text" bind:value={item.subText} placeholder="Subtext / Details (optional)" class="mb-4 text-sub" />
          <div class="grid-2">
            <div>
              <label>Qty / Hours</label>
              <input type="number" bind:value={item.quantity} min="0.5" step="0.5" />
            </div>
            <div>
              <label>Rate</label>
              <input type="number" bind:value={item.rate} min="0" step="100" />
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Client Signature -->
    <div class="form-section">
      <div class="section-label">
        <span>CLIENT ACCEPTANCE SIGNATURE</span>
      </div>

      <div class="sig-type-toggle">
        <button class="tab-btn" class:active={invoice.clientSignatureType === 'text'} on:click={() => invoice.clientSignatureType = 'text'}>Font Signature</button>
        <button class="tab-btn" class:active={invoice.clientSignatureType === 'image'} on:click={() => invoice.clientSignatureType = 'image'}>Upload Image</button>
        <button class="tab-btn" class:active={invoice.clientSignatureType === 'none'} on:click={() => invoice.clientSignatureType = 'none'}>None / Leave Blank</button>
      </div>

      {#if invoice.clientSignatureType === 'text'}
        <div class="form-row">
          <label id="lbl-clientSigText" for="input-clientSigText">Signature Text (Cursive)</label>
          <input id="input-clientSigText" type="text" bind:value={invoice.clientSignatureText} placeholder={invoice.clientName || 'Client Name'} />
          <div class="font-preview" style="font-family: 'Caveat', cursive; font-size: 26px; color: #0c4a6e; margin-top: 4px;">
            {invoice.clientSignatureText || invoice.clientName || 'Signature Preview'}
          </div>
        </div>
      {:else if invoice.clientSignatureType === 'image'}
        <div class="logo-row">
          <div class="logo-preview">
            {#if invoice.clientSignatureImage}
              <img src={invoice.clientSignatureImage} alt="Client Signature" />
            {:else}
              <span class="no-logo">No Image</span>
            {/if}
          </div>
          <label class="btn btn-secondary upload-btn">
            <Upload size={14} /> Upload Signature
            <input type="file" accept="image/*" on:change={handleClientSignatureUpload} hidden />
          </label>
        </div>
      {/if}

      {#if invoice.clientSignatureType !== 'none'}
        <div class="grid-2" style="margin-top: 10px;">
          <div class="form-row">
            <label id="lbl-clientSigName" for="input-clientSigName">Signatory Name</label>
            <input id="input-clientSigName" type="text" bind:value={invoice.clientSignatureName} placeholder={invoice.clientName || 'Client Name'} />
          </div>
          <div class="form-row">
            <label id="lbl-clientSigDesig" for="input-clientSigDesig">Designation</label>
            <input id="input-clientSigDesig" type="text" bind:value={invoice.clientSignatureDesignation} placeholder="" />
          </div>
        </div>
      {/if}
    </div>
  </div>
</aside>

<style>
  .sidebar {
    width: 440px;
    flex-shrink: 0;
    background: #ffffff;
    border-right: 1px solid var(--border);
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    background: #ffffff;
    z-index: 10;
  }

  .header-top { display: flex; justify-content: space-between; align-items: center; }
  .header-top h2 { font-size: 15px; font-weight: 700; }

  .sidebar-body { padding: 20px; flex: 1; overflow-y: auto; }

  .form-section { margin-bottom: 24px; }
  .section-label { font-size: 10px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.8px; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 4px; }
  .flex-between { display: flex; justify-content: space-between; align-items: center; }
  .text-btn { background: none; border: none; color: var(--primary); font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 2px; }

  .form-row { margin-bottom: 12px; }
  label { display: block; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
  input, select, textarea { width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; outline: none; }
  input:focus, select:focus, textarea:focus { border-color: var(--primary); }
  input:disabled, select:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; border-color: #e2e8f0; }

  .field-hint { font-size: 10px; color: #64748b; margin-top: 3px; font-weight: 500; }

  .sig-type-toggle { display: flex; gap: 6px; margin-bottom: 10px; }
  .tab-btn { flex: 1; padding: 6px; font-size: 11px; font-weight: 600; border: 1px solid var(--border); background: #fafafa; border-radius: 5px; cursor: pointer; transition: all 0.15s; }
  .tab-btn.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
  .font-preview { padding: 6px 10px; background: #fafafa; border: 1px solid var(--border); border-radius: 6px; }
  .logo-row { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
  .logo-preview { width: 100px; height: 50px; border: 1px dashed var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #fafafa; overflow: hidden; }
  .logo-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .no-logo { font-size: 10px; color: var(--text-muted); }
  .upload-btn { position: relative; cursor: pointer; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  .item-card { background: #f8fafc; border: 1px solid var(--border); padding: 12px; border-radius: 6px; margin-bottom: 10px; }
  .item-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .item-num { font-size: 11px; font-weight: 700; color: var(--text-muted); }
  .icon-btn-danger { background: none; border: none; color: #ef4444; cursor: pointer; }
  .mb-4 { margin-bottom: 6px; }
  .text-sub { font-size: 11px; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
</style>
