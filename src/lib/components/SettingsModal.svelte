<script>
  import { X, Upload, Save, Building, Image, CreditCard, FileCheck, Download } from '@lucide/svelte';
  import { saveSettings } from '../db.js';

  export let settings;
  export let isOpen = false;
  export let onClose;

  let form = { ...settings };

  $: if (settings) {
    form = { ...settings };
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        form.logoUrl = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSignatureUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        form.issuerSignatureImage = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSave() {
    await saveSettings(form);
    settings = { ...form };
    onClose();
  }

  function handleExportGlobals() {
    const dataStr = JSON.stringify(form, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company_globals_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportGlobals(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const imported = JSON.parse(evt.target.result);
          form = { ...form, ...imported, id: 'company_settings' };
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
      reader.readTextAsText ? reader.readTextAsText(file) : reader.readAsText(file);
    }
  }
</script>

{#if isOpen}
<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-card">
    <div class="modal-header">
      <div class="title-with-icon">
        <Building size={18} color="#059669" />
        <h3>Global Company Settings & Branding</h3>
      </div>
      <button class="icon-btn" on:click={onClose}><X size={18} /></button>
    </div>

    <div class="modal-body">
      <!-- Section 1: Branding & Logo -->
      <div class="form-section">
        <h4 class="section-title"><Image size={14} /> Logo & Business Branding</h4>
        <div class="grid-2">
          <div>
            <label>Company Name</label>
            <input type="text" bind:value={form.companyName} placeholder="e.g. Acme Studio" />
          </div>
          <div>
            <label>Tagline / Subheading</label>
            <input type="text" bind:value={form.companyTagline} placeholder="e.g. Design & Development" />
          </div>
        </div>

        <div class="logo-row">
          <div class="logo-preview">
            {#if form.logoUrl}
              <img src={form.logoUrl} alt="Logo" />
            {:else}
              <span class="no-logo">No Logo Uploaded</span>
            {/if}
          </div>
          <div class="logo-actions">
            <label class="btn btn-secondary upload-btn">
              <Upload size={14} /> Upload Logo
              <input type="file" accept="image/*" on:change={handleLogoUpload} hidden />
            </label>
            {#if form.logoUrl}
              <button class="btn btn-danger-text" on:click={() => form.logoUrl = ''}>Remove Logo</button>
            {/if}
          </div>
        </div>
      </div>

      <!-- Section 2: Contact Details -->
      <div class="form-section">
        <h4 class="section-title"><Building size={14} /> Issuer Address & Contact Details</h4>
        <div class="grid-2">
          <div>
            <label>Owner / Authorized Person</label>
            <input type="text" bind:value={form.ownerName} />
          </div>
          <div>
            <label>Designation / Title</label>
            <input type="text" bind:value={form.ownerTitle} />
          </div>
        </div>

        <div class="grid-2">
          <div>
            <label>Email Address</label>
            <input type="email" bind:value={form.email} />
          </div>
          <div>
            <label>Phone Number</label>
            <input type="text" bind:value={form.phone} />
          </div>
        </div>

        <div class="grid-2">
          <div>
            <label>Street Address</label>
            <input type="text" bind:value={form.address} />
          </div>
          <div>
            <label>City, State, ZIP</label>
            <input type="text" bind:value={form.cityStateZip} />
          </div>
        </div>

        <div>
          <label>Tax Registration / GSTIN / VAT ID</label>
          <input type="text" bind:value={form.taxId} />
        </div>
      </div>

      <!-- Section 3: Bank & Payment Info -->
      <div class="form-section">
        <h4 class="section-title"><CreditCard size={14} /> Payment & Bank Account Details</h4>
        <div class="form-row" style="margin-bottom: 12px;">
          <label id="lbl-beneficiaryName" for="input-beneficiaryName">Beneficiary Name / Account Holder Name</label>
          <input id="input-beneficiaryName" type="text" bind:value={form.beneficiaryName} placeholder={form.companyName || form.ownerName || 'e.g. Nexus Systems LLC'} />
        </div>

        <div class="grid-2">
          <div>
            <label>Bank Name</label>
            <input type="text" bind:value={form.bankName} />
          </div>
          <div>
            <label>Account Number</label>
            <input type="text" bind:value={form.accountNumber} />
          </div>
        </div>

        <div class="grid-2">
          <div>
            <label>IFSC Code / Swift Code</label>
            <input type="text" bind:value={form.ifscCode} />
          </div>
          <div>
            <label>UPI ID / Pay Link</label>
            <input type="text" bind:value={form.upiId} />
          </div>
        </div>

        <div class="grid-2">
          <div>
            <label id="lbl-currency" for="select-currency">Default Currency</label>
            <select id="select-currency" bind:value={form.defaultCurrency} on:change={(e) => {
              const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
              form.currencySymbol = symbols[e.target.value] || '₹';
            }}>
              <option value="INR">₹ (INR - Indian Rupee)</option>
              <option value="USD">$ (USD - US Dollar)</option>
              <option value="EUR">€ (EUR - Euro)</option>
              <option value="GBP">£ (GBP - British Pound)</option>
            </select>
          </div>
          <div>
            <label id="lbl-defaultTax" for="input-defaultTax">Default Tax Rate (%)</label>
            <input id="input-defaultTax" type="number" bind:value={form.defaultTaxRate} />
          </div>
        </div>
      </div>

      <!-- Section 4: Signature -->
      <div class="form-section">
        <h4 class="section-title"><FileCheck size={14} /> Default Issuer Signature</h4>
        <div class="sig-type-toggle">
          <button class="tab-btn" class:active={form.issuerSignatureType === 'text'} on:click={() => form.issuerSignatureType = 'text'}>Font Signature</button>
          <button class="tab-btn" class:active={form.issuerSignatureType === 'image'} on:click={() => form.issuerSignatureType = 'image'}>Upload Signature Image</button>
          <button class="tab-btn" class:active={form.issuerSignatureType === 'none'} on:click={() => form.issuerSignatureType = 'none'}>None / Leave Blank</button>
        </div>

        {#if form.issuerSignatureType === 'text'}
          <div>
            <label>Signature Text (Rendered in Cursive Font)</label>
            <input type="text" bind:value={form.issuerSignatureText} placeholder={form.ownerName || 'Raj Kumar'} />
            <div class="font-preview" style="font-family: 'Caveat', cursive; font-size: 28px;">
              {form.issuerSignatureText || form.ownerName || 'Signature Preview'}
            </div>
          </div>
        {:else if form.issuerSignatureType === 'image'}
          <div class="logo-row">
            <div class="logo-preview">
              {#if form.issuerSignatureImage}
                <img src={form.issuerSignatureImage} alt="Signature" />
              {:else}
                <span class="no-logo">No Signature Image</span>
              {/if}
            </div>
            <label class="btn btn-secondary upload-btn">
              <Upload size={14} /> Upload Image
              <input type="file" accept="image/*" on:change={handleSignatureUpload} hidden />
            </label>
          </div>
        {/if}

        {#if form.issuerSignatureType !== 'none'}
          <div class="grid-2" style="margin-top: 12px;">
            <div>
              <label id="lbl-ownerName" for="input-ownerName">Signatory Name</label>
              <input id="input-ownerName" type="text" bind:value={form.ownerName} placeholder="e.g. Raj Kumar" />
            </div>
            <div>
              <label id="lbl-ownerTitle" for="input-ownerTitle">Designation / Title</label>
              <input id="input-ownerTitle" type="text" bind:value={form.ownerTitle} placeholder="e.g. Founder / Developer" />
            </div>
          </div>
        {/if}
      </div>

    </div>

    <div class="modal-footer flex-between">
      <div class="btn-group">
        <button class="btn btn-secondary" on:click={handleExportGlobals} title="Backup global company settings to JSON file">
          <Download size={14} /> Export Globals JSON
        </button>
        <label class="btn btn-secondary upload-btn" title="Restore global company settings from JSON backup">
          <Upload size={14} /> Import Globals JSON
          <input type="file" accept=".json" on:change={handleImportGlobals} hidden />
        </label>
      </div>

      <div class="btn-group">
        <button class="btn btn-secondary" on:click={onClose}>Cancel</button>
        <button class="btn btn-primary" on:click={handleSave}>
          <Save size={14} /> Save Globals
        </button>
      </div>
    </div>
  </div>
</div>
{/if}

<style>
  .title-with-icon {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
  }

  .form-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
  }

  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
  }

  label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  input, textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 10px;
    outline: none;
  }

  input:focus, textarea:focus {
    border-color: var(--primary);
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .logo-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
  }

  .logo-preview {
    width: 120px;
    height: 60px;
    border: 1px dashed var(--border);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    overflow: hidden;
  }

  .logo-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .no-logo {
    font-size: 10px;
    color: var(--text-muted);
  }

  .upload-btn {
    position: relative;
    cursor: pointer;
  }

  .btn-danger-text {
    background: none;
    border: none;
    color: #ef4444;
    font-size: 12px;
    cursor: pointer;
  }

  .sig-type-toggle {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .tab-btn {
    flex: 1;
    padding: 6px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid var(--border);
    background: #fafafa;
    border-radius: 6px;
    cursor: pointer;
  }

  .tab-btn.active {
    background: var(--primary-light);
    border-color: var(--primary);
    color: var(--primary);
  }

  .font-preview {
    padding: 8px;
    background: #fafafa;
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-top: 4px;
  }
</style>
