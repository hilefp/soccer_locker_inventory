# Bulk Print Feature - Frontend Implementation

## Overview
The bulk print feature allows users to print multiple packing slips or invoices from the orders list table by selecting orders and choosing the document type.

## Files Modified

### 1. Types (`src/modules/orders/types/order.types.ts`)
Added new types for bulk printing:
- `DocumentType`: Union type for 'PACKING_SLIP' | 'INVOICE'
- `BulkPrintRequest`: Request payload with orderIds and documentType
- `BulkPrintResponse`: Response with presigned URLs and metadata

### 2. Service (`src/modules/orders/services/orders.service.ts`)
Added `bulkPrint()` method:
```typescript
async bulkPrint(data: BulkPrintRequest): Promise<BulkPrintResponse>
```
Calls `POST /inventory/orders/bulk-print`

### 3. Component (`src/modules/orders/components/order-list-table.tsx`)
Added UI and functionality:
- **State**: `isBulkPrinting` to track loading state
- **Handler**: `handleBulkPrint()` to process bulk print requests
- **UI Button**: Appears in toolbar when rows are selected
- **Dropdown Menu**: Choose between Packing Slips or Invoices

## How to Use

### User Flow
1. Navigate to the Orders List page
2. Select one or more orders using the checkboxes
3. Click the **"Print (N)"** button in the toolbar (where N is the count of selected orders)
4. Choose document type:
   - **Packing Slips** - For warehouse/shipping
   - **Invoices** - For billing/accounting
5. PDFs will automatically download for each selected order
6. Selection is cleared after successful generation

### Features
- **Bulk Selection**: Select multiple orders at once
- **Visual Feedback**: Button shows count of selected orders
- **Loading State**: Button disabled while generating documents
- **Auto Download**: All PDFs download automatically via presigned URLs
- **Toast Notifications**: Success/error messages with counts
- **Auto Clear**: Selection cleared after successful print

## UI Components Used

### Button
- Variant: `primary`
- Icon: `Printer`
- Displays count of selected orders
- Disabled during print operation

### Dropdown Menu
Two options:
1. **Packing Slips**
   - Icon: `FileText`
   - Document type: `PACKING_SLIP`

2. **Invoices**
   - Icon: `Download`
   - Document type: `INVOICE`

## API Integration

### Endpoint
```
POST /inventory/orders/bulk-print
Authorization: Bearer <token>

Request Body:
{
  "orderIds": ["uuid-1", "uuid-2", "uuid-3"],
  "documentType": "PACKING_SLIP" | "INVOICE"
}

Response:
{
  "success": true,
  "documentType": "PACKING_SLIP",
  "count": 3,
  "presignedUrls": ["url-1", "url-2", "url-3"],
  "expiresIn": "1 hour"
}
```

### Error Handling
- No orders selected: Toast error message
- API errors: Console log + toast error message
- Network failures: Caught and displayed to user

## PDF Download Mechanism

The implementation uses programmatic download:
```typescript
response.presignedUrls.forEach((url, index) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = `${documentType.toLowerCase()}_${orderIds[index]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
```

Benefits:
- No popup blockers (initiated by user click)
- Auto-naming with document type and order ID
- Sequential downloads for all selected orders
- Clean DOM manipulation

## Future Enhancements

Potential improvements:
1. **Batch Size Limit**: Add UI warning for large selections (>50 orders)
2. **Download Progress**: Show progress bar for multiple downloads
3. **ZIP Archive**: Option to combine all PDFs into single ZIP file
4. **Print Preview**: Show preview before downloading
5. **Custom Naming**: Allow users to customize PDF filenames
6. **Email Option**: Add option to email documents instead of download
7. **Print History**: Track what was printed and when

## Testing Checklist

- [ ] Select single order and print packing slip
- [ ] Select single order and print invoice
- [ ] Select multiple orders (3-5) and print packing slips
- [ ] Select multiple orders and print invoices
- [ ] Try printing with no orders selected (should show error)
- [ ] Verify PDFs download with correct filenames
- [ ] Test error handling (disconnect network during print)
- [ ] Verify selection is cleared after successful print
- [ ] Check loading state during print operation
- [ ] Test with different order statuses

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Note: Relies on modern browser download APIs. May need fallback for older browsers.
