<script>
  import { Settings, Users, FileText, Download, Printer, Plus, Trash2, FileDown, Home, Menu, X, ArrowLeft, Eye, Edit3 } from '@lucide/svelte';

  export let onOpenSettings;
  export let onOpenClients;
  export let onResetDb;
  export let mobileView = 'editor';
  export let onSwitchView = () => {};

  let isMenuOpen = false;
  let isGeneratingPdf = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }

  async function handleDownloadPdf() {
    closeMenu();
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

  function handlePrint() {
    closeMenu();
    window.print();
  }
</script>

<!-- Backdrop for mobile menu -->
{#if isMenuOpen}
  <div class="menu-backdrop" on:click={closeMenu} role="presentation"></div>
{/if}

<header class="navbar no-print">
  <div class="brand-group">
    <!-- Mobile: back button when in preview mode, home button in editor mode -->
    {#if mobileView === 'preview'}
      <button class="icon-btn-back mobile-only" on:click={() => onSwitchView('editor')} title="Back to Editor" aria-label="Back to editor">
        <ArrowLeft size={18} />
      </button>
    {:else}
      <a href="/index.html" class="icon-btn-home" title="Return to Workflare Home Landing Page">
        <Home size={20} color="#475569" />
      </a>
    {/if}

    <div class="logo-icon">
      <img src="/logo.svg" alt="Workflare Logo" class="logo-img" />
    </div>
    <div class="brand-text">
      <h1>Workflare <span>Invoicing</span></h1>
      <p class="brand-sub">{mobileView === 'preview' ? 'Invoice Preview' : 'Offline Invoicing & Retainer Suite'}</p>
    </div>
  </div>

  <!-- Desktop nav controls -->
  <div class="nav-controls desktop-only">
    <button class="btn btn-secondary" on:click={() => { closeMenu(); onOpenClients(); }}>
      <Users size={15} />
      Clients DB
    </button>

    <button class="btn btn-secondary" on:click={() => { closeMenu(); onOpenSettings(); }}>
      <Settings size={15} />
      Globals & Logo
    </button>

    <button class="btn btn-danger-outline" on:click={() => { closeMenu(); onResetDb(); }} title="Clear and reset local IndexedDB database">
      <Trash2 size={15} />
      Reset DB
    </button>

    <button class="btn btn-secondary" on:click={handlePrint} title="Print document or save via browser print dialog">
      <Printer size={15} />
      Print
    </button>

    <button class="btn btn-primary" on:click={handleDownloadPdf} disabled={isGeneratingPdf} title="Download A4 PDF File">
      <FileDown size={15} />
      {isGeneratingPdf ? 'Exporting...' : 'Download PDF'}
    </button>
  </div>

  <!-- Mobile: Preview action buttons (shown when in preview view) -->
  {#if mobileView === 'preview'}
    <div class="mobile-preview-actions mobile-only">
      <button class="btn btn-secondary btn-icon-sm" on:click={handlePrint} title="Print">
        <Printer size={16} />
      </button>
      <button class="btn btn-primary btn-icon-sm" on:click={handleDownloadPdf} disabled={isGeneratingPdf} title="Download PDF">
        <FileDown size={16} />
      </button>
    </div>
  {/if}

  <!-- Hamburger button (mobile only) -->
  <button 
    class="hamburger mobile-only" 
    on:click={toggleMenu} 
    aria-label="Toggle menu"
    aria-expanded={isMenuOpen}
  >
    {#if isMenuOpen}
      <X size={22} />
    {:else}
      <Menu size={22} />
    {/if}
  </button>
</header>

<!-- Mobile slide-down menu -->
<div class="mobile-menu mobile-only" class:open={isMenuOpen} role="navigation" aria-label="Mobile navigation">
  <div class="mobile-menu-inner">
    <!-- View switcher -->
    <div class="mobile-view-toggle">
      <button 
        class="view-tab" 
        class:active={mobileView === 'editor'}
        on:click={() => { onSwitchView('editor'); closeMenu(); }}
      >
        <Edit3 size={14} />
        Invoice Editor
      </button>
      <button 
        class="view-tab" 
        class:active={mobileView === 'preview'}
        on:click={() => { onSwitchView('preview'); closeMenu(); }}
      >
        <Eye size={14} />
        Preview
      </button>
    </div>

    <div class="mobile-menu-divider"></div>

    <button class="mobile-menu-item" on:click={() => { onOpenClients(); closeMenu(); }}>
      <Users size={16} />
      Clients DB
    </button>

    <button class="mobile-menu-item" on:click={() => { onOpenSettings(); closeMenu(); }}>
      <Settings size={16} />
      Globals & Logo
    </button>

    <div class="mobile-menu-divider"></div>

    <button class="mobile-menu-item" on:click={handlePrint}>
      <Printer size={16} />
      Print Invoice
    </button>

    <button class="mobile-menu-item primary-item" on:click={handleDownloadPdf} disabled={isGeneratingPdf}>
      <FileDown size={16} />
      {isGeneratingPdf ? 'Exporting PDF...' : 'Download PDF'}
    </button>

    <div class="mobile-menu-divider"></div>

    <button class="mobile-menu-item danger-item" on:click={() => { onResetDb(); closeMenu(); }}>
      <Trash2 size={16} />
      Reset Database
    </button>
  </div>
</div>

<style>
  .navbar {
    height: 56px;
    background: #ffffff;
    border-bottom: 1px solid var(--border);
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 200;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1;
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
    flex-shrink: 0;
  }

  .icon-btn-home:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .icon-btn-back {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border);
    transition: all 0.2s ease;
    cursor: pointer;
    color: var(--text-main);
    flex-shrink: 0;
  }

  .icon-btn-back:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .logo-img {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: contain;
  }

  .brand-text {
    min-width: 0;
    flex: 1;
  }

  .brand-text h1 {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .brand-text h1 span {
    color: var(--primary);
  }

  .brand-sub {
    font-size: 10px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Desktop nav controls */
  .nav-controls {
    display: flex;
    align-items: center;
    gap: 8px;
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

  /* Hamburger button */
  .hamburger {
    width: 38px;
    height: 38px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-main);
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .hamburger:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  /* Mobile preview actions (quick buttons) */
  .mobile-preview-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-right: 8px;
  }

  .btn-icon-sm {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 8px;
  }

  /* Mobile slide-down menu */
  .menu-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 190;
    backdrop-filter: blur(2px);
  }

  .mobile-menu {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    background: #ffffff;
    border-bottom: 1px solid var(--border);
    z-index: 195;
    transform: translateY(-110%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    border-radius: 0 0 16px 16px;
  }

  .mobile-menu.open {
    transform: translateY(0);
  }

  .mobile-menu-inner {
    padding: 12px 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mobile-view-toggle {
    display: flex;
    gap: 8px;
    padding: 4px 0 8px;
  }

  .view-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: #f8fafc;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .view-tab.active {
    background: var(--primary-light);
    border-color: var(--primary);
    color: var(--primary);
  }

  .mobile-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 14px;
    border: none;
    background: transparent;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-main);
    cursor: pointer;
    transition: background 0.15s ease;
    font-family: inherit;
    text-align: left;
  }

  .mobile-menu-item:hover {
    background: #f1f5f9;
  }

  .mobile-menu-item:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .mobile-menu-item.primary-item {
    color: var(--primary);
    font-weight: 600;
  }

  .mobile-menu-item.primary-item:hover {
    background: var(--primary-light);
  }

  .mobile-menu-item.danger-item {
    color: #ef4444;
  }

  .mobile-menu-item.danger-item:hover {
    background: #fef2f2;
  }

  .mobile-menu-divider {
    height: 1px;
    background: var(--border);
    margin: 4px 0;
  }

  /* Visibility helpers */
  .desktop-only {
    display: flex;
  }

  .mobile-only {
    display: none;
  }

  @media (max-width: 768px) {
    .navbar {
      padding: 0 14px;
      height: 56px;
    }

    .desktop-only {
      display: none !important;
    }

    .mobile-only {
      display: flex !important;
    }

    .brand-text h1 {
      font-size: 14px;
    }
  }
</style>
