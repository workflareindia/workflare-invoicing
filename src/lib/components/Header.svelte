<script>
  import { Settings, Users, FileText, Download, Printer, Plus, Trash2, FileDown, Home } from '@lucide/svelte';


  
  export let onOpenSettings;
  export let onOpenClients;
  export let onResetDb;

  let isGeneratingPdf = false;

  async function handleDownloadPdf() {
    isGeneratingPdf = true;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.querySelector('.vanilla-theme') || document.querySelector('.page') || document.body;
      const opt = {
        margin:       0,
        filename:     `Invoice_${new Date().toISOString().slice(0, 10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
        const totalPages = pdf.internal.getNumberOfPages();
        if (totalPages > 1) {
          pdf.deletePage(totalPages);
        }
      }).save();
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      isGeneratingPdf = false;
    }
  }
</script>

<header class="navbar no-print">
  <div class="brand-group">
    <a href="/index.html" class="icon-btn-home" title="Return to Workflare Home Landing Page">
      <Home size={20} color="#475569" />
    </a>
    <div class="logo-icon">
      <img src="/logo.svg" alt="Workflare Logo" class="logo-img" />
    </div>
    <div class="brand-text">
      <h1>Workflare <span>Invoicing</span></h1>
      <p>Offline Invoicing & Retainer Suite</p>
    </div>
  </div>

  <div class="nav-controls">
    <button class="btn btn-secondary" on:click={onOpenClients}>
      <Users size={15} />
      Clients DB
    </button>

    <button class="btn btn-secondary" on:click={onOpenSettings}>
      <Settings size={15} />
      Globals & Logo
    </button>

    <button class="btn btn-danger-outline" on:click={onResetDb} title="Clear and reset local IndexedDB database">
      <Trash2 size={15} />
      Reset DB
    </button>

    <button class="btn btn-secondary" on:click={() => window.print()} title="Print document or save via browser print dialog">
      <Printer size={15} />
      Print
    </button>

    <button class="btn btn-primary" on:click={handleDownloadPdf} disabled={isGeneratingPdf} title="Download A4 PDF File">
      <FileDown size={15} />
      {isGeneratingPdf ? 'Exporting...' : 'Download PDF'}
    </button>
  </div>
</header>

<style>
  .navbar {
    height: 60px;
    background: #ffffff;
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon-btn-home {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border);
    transition: all 0.2s ease;
    text-decoration: none;
    margin-right: 4px;
  }

  .icon-btn-home:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .logo-icon {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-img {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    object-fit: contain;
  }

  .brand-text h1 {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.1;
  }

  .brand-text h1 span {
    color: var(--primary);
  }

  .brand-text p {
    font-size: 11px;
    color: var(--text-muted);
  }

  .nav-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .btn-danger-outline {
    background: #fff;
    border: 1px solid #fee2e2;
    color: #ef4444;
  }

  .btn-danger-outline:hover {
    background: #fef2f2;
    border-color: #fca5a5;
  }

  .template-picker {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f8fafc;
    border: 1px solid var(--border);
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
  }

  .template-picker select {
    border: none;
    background: transparent;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-main);
    outline: none;
    cursor: pointer;
  }
</style>
