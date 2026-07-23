<script>
  import { X, Plus, Trash2, Download, Upload, Users, UserPlus, FileSpreadsheet } from '@lucide/svelte';
  import { db } from '../db.js';
  import { exportClientsCSV, parseCSVFile, downloadSampleClientsCSV } from '../csvUtils.js';

  export let isOpen = false;
  export let onClose;
  export let onSelectClient;

  let clients = [];
  let isAdding = false;
  let newClient = {
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    taxId: ''
  };

  $: if (isOpen) {
    loadClients();
  }

  async function loadClients() {
    clients = await db.clients.toArray();
  }

  async function handleAddClient() {
    if (!newClient.name && !newClient.company) return;
    await db.clients.add({ ...newClient });
    newClient = { name: '', company: '', email: '', phone: '', address: '', taxId: '' };
    isAdding = false;
    await loadClients();
  }

  async function handleDeleteClient(id) {
    if (confirm('Delete this client from database?')) {
      await db.clients.delete(id);
      await loadClients();
    }
  }

  async function handleImportCSV(e) {
    const file = e.target.files[0];
    if (file) {
      const data = await parseCSVFile(file);
      for (const item of data) {
        await db.clients.add({
          name: item['Client Name'] || item['name'] || '',
          company: item['Company'] || item['company'] || '',
          email: item['Email'] || item['email'] || '',
          phone: item['Phone'] || item['phone'] || '',
          address: item['Address'] || item['address'] || '',
          taxId: item['Tax ID / GST'] || item['taxId'] || ''
        });
      }
      await loadClients();
    }
  }
</script>

{#if isOpen}
<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-card">
    <div class="modal-header">
      <div class="title-with-icon">
        <Users size={18} color="#059669" />
        <h3>Client Database & Directories</h3>
      </div>
      <button class="icon-btn" on:click={onClose}><X size={18} /></button>
    </div>

    <div class="modal-body">
      <div class="action-bar">
        <button class="btn btn-primary" on:click={() => isAdding = !isAdding}>
          <UserPlus size={14} /> Add New Client
        </button>
        <div class="csv-buttons">
          <button class="btn btn-secondary" on:click={downloadSampleClientsCSV} title="Download sample CSV template for client import">
            <FileSpreadsheet size={14} /> Sample CSV
          </button>
          <label class="btn btn-secondary">
            <Upload size={14} /> Import CSV
            <input type="file" accept=".csv" on:change={handleImportCSV} hidden />
          </label>
          <button class="btn btn-secondary" on:click={() => exportClientsCSV(clients)}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {#if isAdding}
        <div class="add-box">
          <h4>New Client Entry</h4>
          <div class="grid-2">
            <input type="text" placeholder="Contact Name *" bind:value={newClient.name} />
            <input type="text" placeholder="Company Name *" bind:value={newClient.company} />
          </div>
          <div class="grid-2">
            <input type="email" placeholder="Email Address" bind:value={newClient.email} />
            <input type="text" placeholder="Phone Number" bind:value={newClient.phone} />
          </div>
          <input type="text" placeholder="Full Billing Address" bind:value={newClient.address} />
          <input type="text" placeholder="Tax ID / GSTIN" bind:value={newClient.taxId} />
          <div class="add-actions">
            <button class="btn btn-secondary" on:click={() => isAdding = false}>Cancel</button>
            <button class="btn btn-primary" on:click={handleAddClient}>Save Client</button>
          </div>
        </div>
      {/if}

      <div class="client-list">
        {#if clients.length === 0}
          <div class="empty-state">No clients in local database yet. Add one or import CSV.</div>
        {:else}
          {#each clients as client (client.id)}
            <div class="client-card">
              <div class="client-info">
                <h4>{client.company || client.name}</h4>
                <p><strong>Contact:</strong> {client.name} {client.email ? `• ${client.email}` : ''}</p>
                {#if client.address}<p class="sub">{client.address}</p>{/if}
              </div>
              <div class="client-actions">
                <button class="btn btn-secondary" on:click={() => { onSelectClient(client); onClose(); }}>
                  Select for Invoice
                </button>
                <button class="icon-btn-danger" on:click={() => handleDeleteClient(client.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>
{/if}

<style>
  .title-with-icon { display: flex; align-items: center; gap: 8px; }
  .icon-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); }
  .icon-btn-danger { background: none; border: none; cursor: pointer; color: #ef4444; padding: 6px; }
  .action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .csv-buttons { display: flex; gap: 8px; }
  .add-box { background: #f8fafc; border: 1px solid var(--border); padding: 16px; border-radius: 8px; margin-bottom: 16px; }
  .add-box h4 { margin-bottom: 12px; font-size: 14px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  input { width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; margin-bottom: 8px; }
  .add-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  .client-list { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; }
  .client-card { display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); padding: 12px 16px; border-radius: 8px; background: #ffffff; }
  .client-info h4 { font-size: 14px; font-weight: 600; }
  .client-info p { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .client-info p.sub { font-size: 11px; }
  .client-actions { display: flex; align-items: center; gap: 8px; }
  .empty-state { text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px; }
</style>
