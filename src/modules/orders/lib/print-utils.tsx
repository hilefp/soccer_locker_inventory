import { Order } from '@/modules/orders/types';
import { formatDate } from '@/shared/lib/helpers';

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
    padding: 15mm;
    color: #000;
    font-size: 10pt;
    line-height: 1.4;
  }

  .page {
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
    page-break-after: always;
  }

  .page:last-child {
    page-break-after: auto;
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
    font-size: 24pt;
    font-weight: bold;
    margin: 15px 0;
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
    background-color: #000;
    color: #fff;
  }

  .product-table th {
    padding: 10px 8px;
    text-align: left;
    font-weight: bold;
    font-size: 11pt;
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
    width: 30px;
    height: 30px;
    border: 2px solid #000;
    display: inline-block;
    margin: 0 auto;
  }

  .footer {
    margin-top: 30px;
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
    body {
      padding: 10mm;
    }

    @page {
      margin: 0;
      size: letter portrait;
    }

    .page {
      page-break-after: always;
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
    order.shippingAddress1,
    order.shippingAddress2,
    order.shippingCity && order.shippingState
      ? `${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode || ''}`
      : null,
  ]
    .filter(Boolean)
    .join('<br/>');

  const itemsHTML = order.items
    ?.map(
      (item) => `
    <tr>
      <td>
        <div class="product-name">${item.name || item.productVariant?.product?.name || 'Unknown Product'}</div>
        ${item.sku ? `<div class="product-meta"><strong>SKU:</strong> ${item.sku}</div>` : ''}
      </td>
      <td class="right">${item.quantity}</td>
      <td class="right">$${Number(item.unitPrice).toFixed(2)}</td>
    </tr>
  `
    )
    .join('') || '<tr><td colspan="3">No items</td></tr>';

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

    <h2 class="title">INVOICE</h2>

    <div class="info-grid">
      <div class="info-section">
        <div><strong>${order.shippingName || 'N/A'}</strong></div>
        <div>${order.shippingAddress1 || ''}</div>
        ${order.shippingAddress2 ? `<div>${order.shippingAddress2}</div>` : ''}
        <div>${order.shippingCity || ''}, ${order.shippingState || ''} ${order.shippingPostalCode || ''}</div>
        <div>${order.customerUser?.email || ''}</div>
        ${order.shippingPhone ? `<div>${order.shippingPhone}</div>` : ''}
      </div>

      <div class="info-section">
        <div class="info-label">Ship To:</div>
        <div><strong>${order.shippingName || 'N/A'}</strong></div>
        ${shippingAddress ? `<div>${shippingAddress}</div>` : '<div>No shipping address</div>'}
      </div>
    </div>

    <div class="info-grid" style="margin-top: 15px;">
      <div class="info-section">
        <div><strong>Invoice Date:</strong> ${formatDate(new Date(order.createdAt))}</div>
        <div><strong>Order Number:</strong> ${order.orderNumber}</div>
      </div>

      <div class="info-section">
        <div><strong>Order Date:</strong> ${formatDate(new Date(order.createdAt))}</div>
        <div><strong>Payment Method:</strong> ${order.currency === 'USD' ? 'Credit Card' : order.currency}</div>
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
          <span>Shipping ${order.carrier ? `via ${order.carrier}` : ''}</span>
          <span>$${Number(order.shippingTotal || 0).toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ddd;">
          <span>FL Tax</span>
          <span>$${Number(order.taxTotal || 0).toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 12pt; border-top: 2px solid #000; margin-top: 5px;">
          <span>Total</span>
          <span>$${Number(order.total || 0).toFixed(2)}</span>
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
export const generatePackingSlipHTML = (order: Order): string => {
  const shippingAddress = [
    order.shippingAddress1,
    order.shippingAddress2,
    order.shippingCity && order.shippingState
      ? `${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode || ''}`
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
                  ? `<img src="${imageUrl}" alt="${item.name || 'Product'}" class="product-image" />`
                  : '<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 4px; margin-right: 8px;"></div>'
              }
              <div style="flex: 1;">
                <div class="product-name">${item.name || item.productVariant?.product?.name || 'Unknown Product'}</div>
                ${item.sku ? `<div class="product-meta"><strong>SKU:</strong> ${item.sku}</div>` : ''}
                ${attributes.size ? `<div class="product-meta"><strong>Size:</strong> ${attributes.size}</div>` : ''}
                ${attributes.parkLocation || attributes['Park Location'] ? `<div class="product-meta"><strong>Park Location (Choose one):</strong> ${attributes.parkLocation || attributes['Park Location']}</div>` : ''}
                ${attributes.birthYear || attributes['Birth Year'] ? `<div class="product-meta"><strong>Birth Year:</strong> ${attributes.birthYear || attributes['Birth Year']}</div>` : ''}
                ${attributes.notes || order.notes ? `<div class="product-meta"><strong>Notes:</strong> ${attributes.notes || order.notes || ''}</div>` : ''}
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

    <h2 class="title">PACKING SLIP</h2>

    <div class="info-grid" style="margin: 15px 0;">
      <div class="info-section">
        <div><strong>${order.shippingName || 'N/A'}</strong></div>
        <div>${order.shippingAddress1 || ''}</div>
        ${order.shippingAddress2 ? `<div>${order.shippingAddress2}</div>` : ''}
        <div>${order.shippingCity || ''}, ${order.shippingState || ''} ${order.shippingPostalCode || ''}</div>
        <div>${order.customerUser?.email || ''}</div>
        ${order.shippingPhone ? `<div>${order.shippingPhone}</div>` : ''}
      </div>

      <div class="info-section">
        <div><strong>Order Date:</strong> ${formatDate(new Date(order.createdAt))}</div>
        <div><strong>Shipping Method:</strong> ${order.carrier || 'Standard Shipping'}</div>
      </div>
    </div>

    <h3 class="order-number-header">Order Number: ${order.orderNumber}</h3>

    <table class="product-table">
      <thead>
        <tr>
          <th>Product</th>
          <th class="center">Quantity</th>
          <th class="center">✓</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="footer">
      <div class="footer-hours">Team Warehouse Hours: ${COMPANY_INFO.warehouseHours}</div>
      <div class="footer-note">Once your order has been processed/shipped you will receive a shipping confirmation email with a tracking number.</div>
      <div style="margin-top: 5px;">${COMPANY_INFO.website}</div>
    </div>
  `;
};

/**
 * Generate complete print document with multiple orders
 * Uses Promise.all for parallel order processing (Vercel best practice: async-parallel)
 */
export const generateBulkPrintDocument = async (
  orders: Order[],
  documentType: 'INVOICE' | 'PACKING_SLIP'
): Promise<string> => {
  // Generate all documents in parallel for performance
  const documentHTMLs = orders.map((order) =>
    documentType === 'INVOICE'
      ? generateInvoiceHTML(order)
      : generatePackingSlipHTML(order)
  );

  const pagesHTML = documentHTMLs
    .map((html) => `<div class="page">${html}</div>`)
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
          window.onload = function() {
            // Small delay to ensure images load
            setTimeout(() => {
              window.print();
            }, 500);

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
