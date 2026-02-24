import { Order } from '@/modules/orders/types';
import { formatDate } from '@/shared/lib/helpers';

/**
 * Escape HTML to prevent XSS in print documents
 */
const escapeHtml = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const COMPANY_INFO = {
  name: 'TEAM UNIFORM ORDER',
  address: '8810 SW 131st Street',
  city: 'Miami, FL 33176',
  email: 'teamorder@soccerlocker.com',
  warehouseHours: 'Monday-Friday 8:00am-5:00pm | Weekends closed',
  website: 'myuniformsoccerlocker.com',
} as const;

const LOGO_PATH = '/media/app/soccerlocker-team-logo.svg';

/**
 * Common styles used by both invoice and packing slip
 */
const getCommonStyles = () => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    color: #000;
    font-size: 10pt;
    line-height: 1.4;
  }

  .page {
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
    padding: 15mm;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .page:last-child {
    page-break-after: auto;
  }

  .page-content {
    flex: 1;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .logo {
    max-width: 180px;
    height: auto;
  }

  .company-info {
    text-align: right;
    font-size: 9pt;
    line-height: 1.5;
  }

  .company-name {
    font-weight: bold;
    font-size: 10pt;
    margin-bottom: 4px;
  }

  .title {
    font-size: 16pt;
    font-weight: bold;
    text-align: left;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin: 20px 0;
  }

  .info-section {
    padding: 0;
  }

  .info-label {
    font-weight: bold;
    font-size: 9pt;
    margin-bottom: 4px;
  }

  .info-value {
    font-size: 10pt;
  }

  .product-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }

  .product-table thead {
    background-color: #D3D3D3;
    color: #fff;
  }

  .product-table th {
    padding: 8px 5px;
    text-align: left;
    font-weight: bold;
    font-size: 10pt;
  }

  .product-table th.right {
    text-align: right;
  }

  .product-table th.center {
    text-align: center;
  }

  .product-table td {
    padding: 8px;
    border-bottom: 1px solid #ddd;
    font-size: 9pt;
    vertical-align: top;
  }

  .product-table td.right {
    text-align: right;
  }

  .product-table td.center {
    text-align: center;
  }

  .product-name {
    font-weight: bold;
    margin-bottom: 2px;
  }

  .product-meta {
    font-size: 8pt;
    color: #666;
    margin-top: 2px;
  }

  .product-image {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 8px;
  }

  .product-cell {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .red-line {
    height: 3px;
    background-color: #EC1C24;
    margin: 20px 0 15px 0;
  }

  .order-number-header {
    text-align: center;
    font-size: 16pt;
    font-weight: bold;
    margin: 20px 0;
    padding: 10px 0;
  }

  .checkbox-cell {
    width: 15px;
    height: 15px;
    border: 1px solid #000;
    display: inline-block;
    margin: 0 auto;
  }

  .qr-code-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }

  .qr-code-section img {
    width: 100px;
    height: 100px;
  }

  .footer {
    margin-top: auto;
    padding-top: 15px;
    border-top: 3px solid #EC1C24;
    font-size: 8pt;
    text-align: center;
    color: #000;
  }

  .footer-hours {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .footer-note {
    margin-top: 5px;
    font-style: italic;
  }

  @media print {
    @page {
      margin: 0;
      size: letter portrait;
    }

    .page {
      padding: 10mm;
      page-break-after: always;
      min-height: 100vh;
    }

    .page:last-child {
      page-break-after: auto;
    }
  }
`;

/**
 * Generate Invoice HTML for a single order
 */
export const generateInvoiceHTML = (order: Order): string => {
  const shippingAddress = [
    escapeHtml(order.shippingAddress1),
    escapeHtml(order.shippingAddress2),
    order.shippingCity && order.shippingState
      ? `${escapeHtml(order.shippingCity)}, ${escapeHtml(order.shippingState)} ${escapeHtml(order.shippingPostalCode)}`
      : null,
  ]
    .filter(Boolean)
    .join('<br/>');

  const itemsHTML = order.items
    ?.map(
      (item) => `
    <tr>
      <td>
        <div class="product-name">${escapeHtml(item.name) || escapeHtml(item.productVariant?.product?.name) || 'Unknown Product'}</div>
        ${item.sku ? `<div class="product-meta"><strong>SKU:</strong> ${escapeHtml(item.sku)}</div>` : ''}
      </td>
      <td class="right">${item.quantity}</td>
      <td class="right">$${Number(item.unitPrice).toFixed(2)}</td>
    </tr>
  `
    )
    .join('') || '<tr><td colspan="3">No items</td></tr>';

  return `
    <div class="page-content">
      <div class="header">
        <img src="${LOGO_PATH}" alt="Soccer Locker" class="logo" />
        <div class="company-info">
          <div class="company-name">${COMPANY_INFO.name}</div>
          <div>${COMPANY_INFO.address}</div>
          <div>${COMPANY_INFO.city}</div>
          <div>${COMPANY_INFO.email}</div>
        </div>
      </div>

      <h2 class="title">INVOICE</h2>

      <div class="info-grid" style="grid-template-columns: 1fr 1fr 1fr;">
        <div class="info-section">
          <div><strong>${escapeHtml(order.shippingName) || 'N/A'}</strong></div>
          <div>${escapeHtml(order.shippingAddress1)}</div>
          ${order.shippingAddress2 ? `<div>${escapeHtml(order.shippingAddress2)}</div>` : ''}
          <div>${escapeHtml(order.shippingCity)}, ${escapeHtml(order.shippingState)} ${escapeHtml(order.shippingPostalCode)}</div>
          <div>${escapeHtml(order.customerUser?.email)}</div>
          ${order.shippingPhone ? `<div>${escapeHtml(order.shippingPhone)}</div>` : ''}
        </div>

        <div class="info-section">
          <div class="info-label">Ship To:</div>
          <div><strong>${escapeHtml(order.shippingName) || 'N/A'}</strong></div>
          ${shippingAddress ? `<div>${shippingAddress}</div>` : '<div>No shipping address</div>'}
        </div>

        <div class="info-section">
          <div><strong>Order Date:</strong> ${formatDate(new Date(order.createdAt))}</div>
          <div><strong>Order Number:</strong> ${escapeHtml(order.orderNumber)}</div>
          <div><strong>Payment Method:</strong> ${order.currency === 'USD' ? 'Credit Card' : escapeHtml(order.currency)}</div>
        </div>
      </div>

      <table class="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th class="right">Quantity</th>
            <th class="right">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ddd;">
            <span>Subtotal</span>
            <span>$${Number(order.subtotal || 0).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ddd;">
            <span>Shipping ${order.carrier ? `via ${escapeHtml(order.carrier)}` : ''}</span>
            <span>$${Number(order.shippingTotal || 0).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <span>FL Tax</span>
            <span>$${Number(order.taxTotal || 0).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 12pt; border-top: 2px solid #000; margin-top: 5px;">
            <span>Total</span>
            <span>$${Number(order.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-hours">Team Warehouse Hours: ${COMPANY_INFO.warehouseHours}</div>
      <div class="footer-note">Once your order has been processed/shipped you will receive a shipping confirmation email with a tracking number.</div>
      <div style="margin-top: 5px;">${COMPANY_INFO.website}</div>
    </div>
  `;
};

/**
 * Generate Packing Slip HTML for a single order
 */
const getQRCodeUrl = (orderNumber: string): string => {
  const targetUrl = `${window.location.origin}/orders/current?search=${encodeURIComponent(orderNumber)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}`;
};

export const generatePackingSlipHTML = (order: Order): string => {
  const shippingAddress = [
    escapeHtml(order.shippingAddress1),
    escapeHtml(order.shippingAddress2),
    order.shippingCity && order.shippingState
      ? `${escapeHtml(order.shippingCity)}, ${escapeHtml(order.shippingState)} ${escapeHtml(order.shippingPostalCode)}`
      : null,
  ]
    .filter(Boolean)
    .join('<br/>');

  const itemsHTML = order.items
    ?.map((item) => {
      const imageUrl = item.productVariant?.product?.imageUrl;
      const attributes = item.attributes || {};

      return `
        <tr>
          <td>
            <div class="product-cell">
              ${
                imageUrl
                  ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.name) || 'Product'}" class="product-image" />`
                  : '<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 4px; margin-right: 8px;"></div>'
              }
              <div style="flex: 1;">
                <div class="product-name">${escapeHtml(item.name) || escapeHtml(item.productVariant?.product?.name) || 'Unknown Product'}</div>
                ${item.sku ? `<div class="product-meta"><strong>SKU:</strong> ${escapeHtml(item.sku)}</div>` : ''}
                ${attributes.size ? `<div class="product-meta"><strong>Size:</strong> ${escapeHtml(attributes.size)}</div>` : ''}
                ${attributes.parkLocation || attributes['Park Location'] ? `<div class="product-meta"><strong>Park Location (Choose one):</strong> ${escapeHtml(attributes.parkLocation || attributes['Park Location'])}</div>` : ''}
                ${attributes.birthYear || attributes['Birth Year'] ? `<div class="product-meta"><strong>Birth Year:</strong> ${escapeHtml(attributes.birthYear || attributes['Birth Year'])}</div>` : ''}
              </div>
            </div>
          </td>
          <td class="center">${item.quantity}</td>
          <td class="center"><div class="checkbox-cell"></div></td>
        </tr>
      `;
    })
    .join('') || '<tr><td colspan="2">No items</td></tr>';

  return `
    <div class="header">
      <img src="${LOGO_PATH}" alt="Soccer Locker" class="logo" />
      <div class="company-info">
        <div class="company-name">${COMPANY_INFO.name}</div>
        <div>${COMPANY_INFO.address}</div>
        <div>${COMPANY_INFO.city}</div>
        <div>${COMPANY_INFO.email}</div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div style="flex: 1;">
        <h3 class="title">PACKING SLIP</h3>
        <div style="display: flex; gap: 30px; margin-top: 15px;">
          <div class="info-section">
            <div><strong>${escapeHtml(order.shippingName) || 'N/A'}</strong></div>
            <div>${escapeHtml(order.shippingAddress1)}</div>
            ${order.shippingAddress2 ? `<div>${escapeHtml(order.shippingAddress2)}</div>` : ''}
            <div>${escapeHtml(order.shippingCity)}, ${escapeHtml(order.shippingState)} ${escapeHtml(order.shippingPostalCode)}</div>
            ${order.shippingPhone ? `<div>${escapeHtml(order.shippingPhone)}</div>` : ''}
          </div>
          <div class="info-section">
            <div><strong>Order Date:</strong> ${formatDate(new Date(order.createdAt))}</div>
            <div><strong>Shipping Method:</strong> ${escapeHtml(order.carrier) || 'Standard Shipping'}</div>
          </div>
        </div>
      </div>
      <div class="qr-code-section">
        <img src="${getQRCodeUrl(order.orderNumber)}" alt="QR Code for order ${escapeHtml(order.orderNumber)}" />
      </div>
    </div>

    <h3 class="order-number-header">#${escapeHtml(order.orderNumber)}</h3>

    <table class="product-table">
      <thead>
        <tr>
          <th>Product</th>
          <th class="center">Quantity</th>
          <th class="center">&#10003;</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    ${order.notes ? `
    <div style="margin-top: 15px;">
      <div style="font-weight: bold; font-size: 10pt; margin-bottom: 4px;">Customer Notes:</div>
      <div style="font-size: 9pt; padding: 8px;">${escapeHtml(order.notes)}</div>
    </div>
    ` : ''}
  `;
};

/** Maximum orders allowed per bulk print (Vercel best practice: js-early-exit) */
export const MAX_BULK_PRINT = 20;

/**
 * Generate complete print document with multiple orders
 * Synchronous — no async needed since HTML generators are pure functions
 * (Vercel best practice: js-combine-iterations)
 */
export const generateBulkPrintDocument = (
  orders: Order[],
  documentType: 'INVOICE' | 'PACKING_SLIP'
): string => {
  const generateFn = documentType === 'INVOICE' ? generateInvoiceHTML : generatePackingSlipHTML;

  const pagesHTML = orders
    .map((order) => `<div class="page">${generateFn(order)}</div>`)
    .join('\n');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${documentType === 'INVOICE' ? 'Invoices' : 'Packing Slips'} - Bulk Print</title>
        <style>
          ${getCommonStyles()}
        </style>
      </head>
      <body>
        ${pagesHTML}
        <script>
          // Wait for all images to load before printing (avoids race condition with fixed timeout)
          window.onload = function() {
            var images = Array.from(document.images);
            var loadPromises = images.map(function(img) {
              if (img.complete) return Promise.resolve();
              return new Promise(function(resolve) {
                img.onload = resolve;
                img.onerror = resolve;
              });
            });

            Promise.all(loadPromises).then(function() {
              window.print();
            });

            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `;
};

/**
 * Open print window with generated document
 * Uses early return pattern (Vercel best practice: js-early-exit)
 */
export const openPrintWindow = (htmlContent: string): boolean => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) {
    return false;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  return true;
};
