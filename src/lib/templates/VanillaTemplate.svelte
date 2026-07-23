<script>
  export let invoice;
  export let settings;

  $: curKey = invoice.currencyKey || 'INR';
  $: curSymbol = invoice.currencySymbol || settings.currencySymbol || '₹';

  // Format currency
  function fmtVal(num) {
    const val = Number(num) || 0;
    return curSymbol + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Format date helper (e.g., 23 July 2026)
  function fmtDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Format period range (DD/MM/YY - DD/MM/YY)
  function fmtPeriod(fromStr, toStr) {
    if (!fromStr && !toStr) return '';
    const formatDDMMYY = (str) => {
      if (!str) return '';
      const d = new Date(str + 'T00:00:00');
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(-2);
      return `${dd}/${mm}/${yy}`;
    };
    if (fromStr && toStr) return `${formatDDMMYY(fromStr)} - ${formatDDMMYY(toStr)}`;
    if (fromStr) return `From ${formatDDMMYY(fromStr)}`;
    if (toStr) return `Until ${formatDDMMYY(toStr)}`;
    return '';
  }

  $: periodText = fmtPeriod(invoice.periodFrom, invoice.periodTo);
  $: hasTaxId = Boolean(settings.taxId || invoice.bizTaxId);
  $: effectiveTaxRate = hasTaxId ? (invoice.taxRate || 0) : 0;
  $: subtotal = (invoice.items || []).reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.rate) || 0)), 0);
  $: taxAmount = (subtotal * effectiveTaxRate) / 100;
  $: grandTotal = subtotal + taxAmount;

  // UPI QR Code URL Generator
  $: upiQrUrl = (() => {
    const upiId = settings.upiId || invoice.upiId || '';
    if (!upiId) return '';
    let upiUrl = `upi://pay?pa=${encodeURIComponent(upiId.trim())}`;
    const name = settings.beneficiaryName || settings.companyName || settings.ownerName || '';
    if (name) {
      upiUrl += `&pn=${encodeURIComponent(name.trim())}`;
    }
    if (grandTotal > 0) {
      upiUrl += `&am=${grandTotal.toFixed(2)}&cu=INR`;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;
  })();
</script>

<div class="page vanilla-theme">
  <div class="accent-bar"></div>

  <!-- Doc Header -->
  <div class="doc-header">
    <div class="doc-logo-wrap">
      {#if settings.logoUrl}
        <img src={settings.logoUrl} alt={settings.companyName} />
      {:else}
        <div class="doc-logo-text">
          {settings.companyName || 'Nexus Systems LLC'}
        </div>
      {/if}
    </div>
    <div class="company-right">
      <div class="name">{settings.companyName || 'Nexus Systems LLC'}</div>
      {#if settings.companyTagline}
        <div class="tagline">{settings.companyTagline}</div>
      {/if}
      <p>
        {#if settings.address}{settings.address}, {settings.cityStateZip}<br />{/if}
        {settings.email || ''}
        {#if settings.taxId}<br />Tax / GST ID: {settings.taxId}{/if}
      </p>
    </div>
  </div>

  <!-- Meta Badges -->
  <div class="invoice-badges">
    <div class="badge"><div class="bl">Invoice No.</div><div class="bv">{invoice.invoiceNumber}</div></div>
    <div class="badge"><div class="bl">Issue Date</div><div class="bv">{fmtDate(invoice.date)}</div></div>
    <div class="badge"><div class="bl">Due Date</div><div class="bv">{fmtDate(invoice.dueDate)}</div></div>
    {#if periodText}
      <div class="badge"><div class="bl">Billing Period</div><div class="bv">{periodText}</div></div>
    {/if}
    {#if invoice.status === 'PAID'}
      <div class="badge badge-paid"><div class="bl">Payment Status</div><div class="bv">PAID ✓</div></div>
    {:else if invoice.status === 'UNPAID'}
      <div class="badge badge-unpaid"><div class="bl">Payment Status</div><div class="bv">UNPAID / DUE</div></div>
    {/if}
  </div>

  <!-- Client Card -->
  <div class="info-card">
    <div class="info-card-title">Invoiced To (Client)</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Contact Person</span>
        <span class="info-value">{invoice.clientName || '—'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Organization</span>
        <span class="info-value">{invoice.clientCompany || '—'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Address</span>
        <span class="info-value">{invoice.clientAddress || '—'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email</span>
        <span class="info-value">{invoice.clientEmail || '—'}</span>
      </div>
      {#if invoice.clientPhone}
        <div class="info-item">
          <span class="info-label">Phone No.</span>
          <span class="info-value">{invoice.clientPhone}</span>
        </div>
      {/if}
      {#if invoice.clientTaxId}
        <div class="info-item">
          <span class="info-label">Tax ID / GSTIN</span>
          <span class="info-value">{invoice.clientTaxId}</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Line Items Table -->
  <div class="price-table-wrap">
    <table class="price-table">
      <thead>
        <tr>
          <th>Scope / Description</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {#each invoice.items as item}
          <tr>
            <td>
              <strong>{item.description}</strong>
              {#if item.subText}
                <br /><span class="subtext">{item.subText}</span>
              {/if}
            </td>
            <td class="text-right">{fmtVal(item.quantity * item.rate)}</td>
          </tr>
        {/each}

        <tr class="total-row">
          <td>Subtotal</td>
          <td class="text-right">{fmtVal(subtotal)}</td>
        </tr>
        {#if effectiveTaxRate > 0}
          <tr class="total-row">
            <td>Tax ({effectiveTaxRate}%)</td>
            <td class="text-right">{fmtVal(taxAmount)}</td>
          </tr>
        {/if}
        <tr class="total-row grand-total">
          <td><strong>Grand Total Due</strong></td>
          <td class="text-right"><strong>{fmtVal(grandTotal)}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- GST Disclaimer if no Tax ID present -->
  {#if !hasTaxId}
    <div class="gst-disclaimer">
      <strong>Disclaimer:</strong> {settings.companyName || 'Nexus Systems LLC'} is currently not registered under GST as we do not meet the government-mandated turnover threshold required for registration. Consequently, no GST / Tax is imposed on this invoice.
    </div>
  {/if}

  <!-- Payment & Wire Instructions + UPI QR Code -->
  {#if settings.bankName || settings.accountNumber || settings.upiId}
    <div class="payment-instructions">
      <div class="payment-title">Payment Bank Details / Wire Transfer Instructions</div>
      <div class="payment-flex">
        <div class="payment-grid">
          {#if settings.beneficiaryName || settings.companyName || settings.ownerName}
            <div class="payment-item">
              <span class="payment-label">Beneficiary Name</span>
              <span class="payment-val">{settings.beneficiaryName || settings.companyName || settings.ownerName}</span>
            </div>
          {/if}
          {#if settings.bankName}
            <div class="payment-item">
              <span class="payment-label">Bank Name</span>
              <span class="payment-val">{settings.bankName}</span>
            </div>
          {/if}
          {#if settings.accountNumber}
            <div class="payment-item">
              <span class="payment-label">Account Number</span>
              <span class="payment-val">{settings.accountNumber}</span>
            </div>
          {/if}
          {#if settings.ifscCode}
            <div class="payment-item">
              <span class="payment-label">IFSC / BIC / SWIFT</span>
              <span class="payment-val">{settings.ifscCode}</span>
            </div>
          {/if}
          {#if settings.upiId}
            <div class="payment-item span-2">
              <span class="payment-label">UPI ID</span>
              <span class="payment-val">{settings.upiId}</span>
            </div>
          {/if}
        </div>

        {#if upiQrUrl}
          <div class="upi-qr-box">
            <img src={upiQrUrl} alt="Scan to Pay via UPI" class="qr-img" />
            <span class="qr-label">Scan to Pay via UPI</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Signatures Row -->
  <div class="signatures-row">
    <!-- Developer / Issuer Signature -->
    <div class="signature-display-box">
      <div class="signature-rendered-wrap">
        {#if settings.issuerSignatureType === 'image' && settings.issuerSignatureImage}
          <img src={settings.issuerSignatureImage} alt="Developer Signature" />
        {:else if settings.issuerSignatureType === 'text'}
          <span class="signature-typed-text">{settings.issuerSignatureText || settings.ownerName || 'Raj Kumar'}</span>
        {:else}
          <!-- Blank area for third-party e-signing -->
        {/if}
      </div>
      <div class="signature-line"></div>
      <div class="signature-name">{settings.ownerName || 'Raj Kumar'}</div>
      <div class="signature-role">{settings.ownerTitle || 'Founder / Developer'}</div>
    </div>

    <!-- Client Signature -->
    <div class="signature-display-box">
      <div class="signature-rendered-wrap">
        {#if invoice.clientSignatureType === 'image' && invoice.clientSignatureImage}
          <img src={invoice.clientSignatureImage} alt="Client Signature" />
        {:else if invoice.clientSignatureType === 'text'}
          <span class="signature-typed-text">{invoice.clientSignatureText || invoice.clientName}</span>
        {:else}
          <!-- Blank area for physical or third-party e-signing -->
        {/if}
      </div>
      <div class="signature-line"></div>
      <div class="signature-name">{invoice.clientSignatureName || invoice.clientSignatureText || invoice.clientName || 'Client Signatory'}</div>
      {#if invoice.clientSignatureDesignation}
        <div class="signature-role">{invoice.clientSignatureDesignation}</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .vanilla-theme {
    width: 210mm;
    max-height: 297mm;
    box-sizing: border-box;
    padding: 16mm 16mm;
    margin: 0 auto;
    background: white;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
    position: relative;
    display: flex;
    flex-direction: column;
    color: #1c1c24;
    font-family: 'Inter', sans-serif;
  }

  .accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #059669, #34d399);
  }

  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #e4e4eb;
    padding-bottom: 14px;
    margin-bottom: 18px;
  }

  .doc-logo-wrap img {
    max-height: 76px;
    width: auto;
    object-fit: contain;
  }

  .doc-logo-text {
    font-size: 22px;
    font-weight: 700;
    color: #1c1c24;
    letter-spacing: -0.5px;
  }

  .company-right {
    text-align: right;
  }

  .company-right .name {
    font-size: 14px;
    font-weight: 700;
    color: #1c1c24;
  }

  .company-right .tagline {
    font-size: 11px;
    color: #059669;
    font-weight: 600;
    margin-top: 1px;
  }

  .company-right p {
    font-size: 10.5px;
    color: #666675;
    line-height: 1.45;
    margin-top: 3px;
  }

  .invoice-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .badge {
    background: #f3f4f6;
    border: 1px solid #e4e4eb;
    border-radius: 6px;
    padding: 7px 12px;
  }

  .badge .bl {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #666675;
    margin-bottom: 2px;
  }

  .badge .bv {
    font-size: 12px;
    font-weight: 600;
    color: #1c1c24;
  }

  .badge-paid {
    background: #d1fae5;
    border-color: #a7f3d0;
  }
  .badge-paid .bl { color: #065f46; }
  .badge-paid .bv { color: #047857; }

  .badge-unpaid {
    background: #fef3c7;
    border-color: #fde68a;
  }
  .badge-unpaid .bl { color: #92400e; }
  .badge-unpaid .bv { color: #b45309; }

  .info-card {
    border: 1px solid #e4e4eb;
    border-radius: 8px;
    padding: 13px 16px;
    margin-bottom: 18px;
  }

  .info-card-title {
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666675;
    border-bottom: 1px solid #e4e4eb;
    padding-bottom: 6px;
    margin-bottom: 11px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
  }

  .span-3 {
    grid-column: span 3;
    margin-top: 4px;
  }

  .info-label {
    font-size: 9px;
    color: #666675;
    text-transform: uppercase;
    margin-bottom: 3px;
    letter-spacing: 0.3px;
  }

  .info-value {
    font-size: 12px;
    font-weight: 500;
    color: #1c1c24;
  }

  .price-table-wrap {
    border: 1px solid #e4e4eb;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 18px;
  }

  .price-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  .price-table th {
    background: #f8f9fa;
    padding: 9px 14px;
    text-align: left;
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #666675;
    border-bottom: 1px solid #e4e4eb;
    font-weight: 600;
  }

  .price-table td {
    padding: 9px 14px;
    border-bottom: 1px solid #e4e4eb;
    color: #333342;
  }

  .subtext {
    font-size: 10.5px;
    color: #666675;
    line-height: 1.45;
  }

  .text-right {
    text-align: right;
  }

  .total-row td {
    font-weight: 600;
    background: #fafafa;
  }

  .grand-total td {
    font-weight: 700;
    color: #059669;
    background: #ecfdf5;
  }

  .gst-disclaimer {
    margin-bottom: 15px;
    padding: 10px 14px;
    border-radius: 6px;
    border: 1px dashed #d1d5db;
    background-color: #f9fafb;
    font-size: 11px;
    color: #666675;
    line-height: 1.5;
  }

  .payment-instructions {
    border: 1px solid #e4e4eb;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 18px;
    background: #fcfcfc;
  }

  .payment-title {
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666675;
    margin-bottom: 8px;
  }

  .payment-flex {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .payment-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    flex: 1;
  }

  .payment-item {
    display: flex;
    flex-direction: column;
  }

  .span-2 {
    grid-column: span 2;
  }

  .payment-label {
    font-size: 8.5px;
    color: #666675;
    text-transform: uppercase;
  }

  .payment-val {
    font-size: 11.5px;
    font-weight: 500;
    color: #1c1c24;
    margin-top: 1px;
  }

  .upi-qr-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-left: 14px;
    border-left: 1px solid #e4e4eb;
    flex-shrink: 0;
  }

  .qr-img {
    width: 85px;
    height: 85px;
    border-radius: 6px;
    border: 1px solid #e4e4eb;
    padding: 3px;
    background: #ffffff;
  }

  .qr-label {
    font-size: 8px;
    font-weight: 700;
    color: #666675;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .signatures-row {
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid #e4e4eb;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }

  .signature-display-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .signature-rendered-wrap {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  .signature-rendered-wrap img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }

  .signature-typed-text {
    font-family: 'Caveat', cursive;
    font-size: 32px;
    color: #0c4a6e;
  }

  .signature-line {
    width: 100%;
    border-top: 1px solid #1c1c24;
    padding-top: 6px;
  }

  .signature-name {
    font-weight: 700;
    font-size: 12px;
    color: #1c1c24;
  }

  .signature-role {
    font-size: 10.5px;
    color: #666675;
    margin-top: 2px;
  }
</style>
