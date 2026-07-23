<script>
  import { X, Download, Upload, FileSpreadsheet, Plus, Users, Eye, ArrowRight, Check, Archive, Loader2 } from '@lucide/svelte';
  import { exportInvoicesCSV, parseCSVFile, downloadSampleInvoiceItemsCSV } from '../csvUtils.js';
  import { db } from '../db.js';

  export let isOpen = false;
  export let onClose;
  export let invoices = [];
  export let clients = [];
  export let settings = {};
  export let onLoadInvoice;

  let selectedClientId = '';
  let importedInvoicesList = [];
  let importSuccessCount = 0;
  let isGeneratingZip = false;
  let zipProgressText = '';

  async function handleDownloadAllZip() {
    if (importedInvoicesList.length === 0) return;
    isGeneratingZip = true;
    zipProgressText = 'Preparing PDFs...';

    try {
      const JSZip = (await import('jszip')).default;
      const html2pdf = (await import('html2pdf.js')).default;
      const zip = new JSZip();

      for (let i = 0; i < importedInvoicesList.length; i++) {
        const inv = importedInvoicesList[i];
        zipProgressText = `Generating PDF ${i + 1} of ${importedInvoicesList.length}...`;

        // Temporarily load invoice onto active preview component
        onLoadInvoice(inv);
        await new Promise(r => setTimeout(r, 200));

        const element = document.querySelector('.vanilla-theme') || document.querySelector('.page') || document.body;
        const opt = {
          margin:       0,
          filename:     `Invoice_${inv.invoiceNumber}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const pdfBlob = await html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
          const totalPages = pdf.internal.getNumberOfPages();
          if (totalPages > 1) {
            pdf.deletePage(totalPages);
          }
          return pdf.output('blob');
        });

        zip.file(`Invoice_${inv.invoiceNumber}.pdf`, pdfBlob);
      }

      zipProgressText = 'Zipping files...';
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `Invoices_Batch_${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Bulk ZIP generation error:', err);
      alert('Error bundling bulk PDFs: ' + err.message);
    } finally {
      isGeneratingZip = false;
      zipProgressText = '';
    }
  }

  async function handleImportCSV(e) {
    const file = e.target.files[0];
    if (file) {
      const rows = await parseCSVFile(file);
      if (rows.length === 0) return;

      const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));

      // Group rows by Invoice No.
      const groups = {};
      rows.forEach(r => {
        const invNo = r['Invoice No.'] || r['Invoice Number'] || r['invoiceNumber'] || ('INV-' + Math.floor(1000 + Math.random() * 9000));
        if (!groups[invNo]) {
          groups[invNo] = {
            invoiceNumber: invNo,
            date: r['Issue Date'] || r['Date'] || r['date'] || new Date().toISOString().slice(0, 10),
            dueDate: r['Due Date'] || r['dueDate'] || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
            status: (r['Payment Status'] || r['Status'] || r['status'] || 'UNPAID').toUpperCase(),
            clientName: selectedClient ? selectedClient.name : (r['Client Name'] || ''),
            clientCompany: selectedClient ? selectedClient.company : (r['Company'] || ''),
            clientEmail: selectedClient ? selectedClient.email : (r['Email'] || ''),
            clientAddress: selectedClient ? selectedClient.address : (r['Address'] || ''),
            clientTaxId: selectedClient ? selectedClient.taxId : (r['Tax ID / GST'] || ''),
            currencySymbol: '₹',
            taxRate: 0,
            items: [],
            notes: 'Payment due within 15 days of invoice date.'
          };
        }

        groups[invNo].items.push({
          description: r['Description'] || r['Item'] || r['description'] || 'Service Line Item',
          subText: r['Details'] || r['Subtext'] || r['subText'] || '',
          quantity: parseFloat(r['Qty'] || r['Quantity'] || r['quantity'] || 1),
          rate: parseFloat(r['Rate'] || r['Price'] || r['rate'] || 0)
        });
      });

      const newInvoices = Object.values(groups).map(inv => {
        const subtotal = inv.items.reduce((sum, i) => sum + (i.quantity * i.rate), 0);
        return {
          ...inv,
          subtotal,
          taxAmount: 0,
          totalAmount: subtotal,
          updatedAt: new Date().toISOString()
        };
      });

      // Bulk save all parsed invoices to IndexedDB
      for (const inv of newInvoices) {
        await db.invoices.put(inv);
      }

      importedInvoicesList = newInvoices;
      importSuccessCount = newInvoices.length;
    }
  }
</script>

{#if isOpen}
<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-card">
    <div class="modal-header">
      <div class="title-with-icon">
        <FileSpreadsheet size={18} color="#059669" />
        <h3>Bulk CSV Operations</h3>
      </div>
      <button class="icon-btn" on:click={onClose}><X size={18} /></button>
    </div>

    <div class="modal-body">
      <div class="csv-option-card">
        <h4>Bulk CSV Invoice Import</h4>
        <p>Import spreadsheets containing multiple invoices. Each distinct Invoice No. generates an independent invoice saved to your database.</p>

        <!-- Client Selector inside Bulk CSV modal -->
        <div class="client-select-box">
          <label id="lbl-bulkClient" for="select-bulkClient"><Users size={13} /> Target Client Override (Optional)</label>
          <select id="select-bulkClient" bind:value={selectedClientId}>
            <option value="">-- Use Client Info from CSV or Select Client --</option>
            {#each clients as c}
              <option value={c.id}>{c.company || c.name}</option>
            {/each}
          </select>
        </div>

        <div class="btn-group" style="margin-top: 14px;">
          <button class="btn btn-secondary" on:click={downloadSampleInvoiceItemsCSV}>
            <FileSpreadsheet size={14} /> Download Sample CSV
          </button>
          <label class="btn btn-primary">
            <Upload size={14} /> Import CSV
            <input type="file" accept=".csv" on:change={handleImportCSV} hidden />
          </label>
        </div>
      </div>

      {#if importedInvoicesList.length > 0}
        <div class="import-results-card">
          <div class="results-header flex-between">
            <div class="title-with-icon">
              <Check size={16} color="#059669" />
              <h4>Successfully Imported {importSuccessCount} Invoice{importSuccessCount > 1 ? 's' : ''} to DB</h4>
            </div>
            <button class="btn btn-primary btn-sm" on:click={handleDownloadAllZip} disabled={isGeneratingZip}>
              {#if isGeneratingZip}
                <Loader2 size={13} class="spin" /> {zipProgressText}
              {:else}
                <Archive size={13} /> Download All PDFs (.ZIP)
              {/if}
            </button>
          </div>
          <div class="imported-rows-list">
            {#each importedInvoicesList as inv}
              <div class="imported-row flex-between">
                <div class="row-meta">
                  <strong>#{inv.invoiceNumber}</strong>
                  <span class="badge-status {inv.status.toLowerCase()}">{inv.status}</span>
                  <span class="sub-meta">{inv.items.length} Item(s) • ₹{inv.totalAmount.toFixed(2)}</span>
                  {#if inv.clientName || inv.clientCompany}
                    <div class="client-sub">{inv.clientCompany || inv.clientName}</div>
                  {/if}
                </div>
                <div class="row-actions">
                  <button class="btn btn-secondary btn-sm" on:click={() => { onLoadInvoice(inv); onClose(); }}>
                    <Eye size={13} /> Load to Editor & Preview
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

    </div>
  </div>
</div>
{/if}

<style>
  .title-with-icon { display: flex; align-items: center; gap: 8px; }
  .icon-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); }
  .csv-option-card { border: 1px solid var(--border); padding: 16px; border-radius: 8px; background: #fafafa; }
  .csv-option-card h4 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .csv-option-card p { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
  .client-select-box { margin-top: 10px; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid var(--border); }
  .client-select-box label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }

  .import-results-card { margin-top: 16px; border: 1px solid #a7f3d0; background: #ecfdf5; border-radius: 8px; padding: 14px; }
  .results-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
  .results-header h4 { font-size: 13px; font-weight: 700; color: #065f46; }
  .imported-rows-list { display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; }
  .imported-row { background: #ffffff; border: 1px solid #d1d5db; padding: 10px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
  .row-meta strong { font-size: 13px; color: #111827; }
  .sub-meta { font-size: 11px; color: #6b7280; margin-left: 6px; }
  .client-sub { font-size: 11px; color: #4b5563; margin-top: 2px; }
  .badge-status { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 6px; text-transform: uppercase; }
  .badge-status.paid { background: #d1fae5; color: #047857; }
  .badge-status.unpaid { background: #fef3c7; color: #b45309; }
  .badge-status.none { background: #f3f4f6; color: #6b7280; }
  .flex-between { display: flex; justify-content: space-between; align-items: center; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
</style>
