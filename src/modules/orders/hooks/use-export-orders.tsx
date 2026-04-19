import { useState } from 'react';
import { format, endOfDay } from 'date-fns';
import ExcelJS from 'exceljs';
import { ordersService } from '@/modules/orders/services/orders.service';
import type { OrderStatus } from '@/modules/orders/types';
import { toast } from 'sonner';

const EXPORT_STATUSES: OrderStatus[] = [
  'NEW',
  'PRINT',
  'PICKING_UP',
  'PROCESSING',
  'DELIVERED',
  'MISSING',
  'REFUND',
];

export function useExportOrders() {
  const [isExporting, setIsExporting] = useState(false);

  const exportOrders = async (dateRange: { from: Date; to: Date }) => {
    try {
      setIsExporting(true);

      // Format dates for API (ISO format)
      // Set start date to beginning of day, end date to end of day to include full range
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(endOfDay(dateRange.to), "yyyy-MM-dd'T'HH:mm:ss");

      // Fetch all orders within the date range (no pagination limit)
      const response = await ordersService.getOrders({
        startDate,
        endDate,
        statuses: EXPORT_STATUSES,
        limit: 10000, // Large limit to get all orders
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (!response.data || response.data.length === 0) {
        toast.info('No orders found in the selected date range');
        return;
      }

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');

      // Set column widths
      worksheet.columns = [
        { key: 'orderNumber', width: 18 },
        { key: 'date', width: 14 },
        { key: 'total', width: 14 },
        { key: 'shipping', width: 14 },
      ];

      // Row 1: Date range label
      const dateRangeLabel = `${format(dateRange.from, 'LLL dd, yyyy')} - ${format(dateRange.to, 'LLL dd, yyyy')}`;
      worksheet.getCell('A1').value = dateRangeLabel;
      worksheet.getCell('A1').font = { bold: true };

      // Row 2: empty (spacer)

      // Row 3: Table headers
      const headerRow = worksheet.getRow(3);
      headerRow.values = ['Order Number', 'Date', 'Total', 'Shipping'];

      const thinBorder: Partial<ExcelJS.Borders> = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // Bold and center header row
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
        cell.border = thinBorder;
      });

      // Add data rows starting from row 4
      let dataRowCount = 0;
      response.data.forEach((order) => {
        const row = worksheet.addRow({
          orderNumber: Number(order.orderNumber),
          date: format(new Date(order.createdAt), 'MM/dd/yyyy'),
          total: Number((Number(order.subtotal) + Number(order.taxTotal) + Number(order.rushFee ?? 0)).toFixed(2)),
          shipping: Number(Number(order.shippingTotal).toFixed(2)),
        });
        dataRowCount++;

        // Apply currency format to Total and Shipping columns
        row.getCell('total').numFmt = '"$"#,##0.00';
        row.getCell('shipping').numFmt = '"$"#,##0.00';
        // Left-align date
        row.getCell('date').alignment = { horizontal: 'right' };
        // Apply borders to all cells
        row.eachCell((cell) => {
          cell.border = thinBorder;
        });
      });

      // Summary row with SUM formulas
      const firstDataRow = 4;
      const lastDataRow = firstDataRow + dataRowCount - 1;
      const summaryRow = worksheet.addRow({});
      summaryRow.getCell('date').value = 'Total';
      summaryRow.getCell('date').font = { bold: true };
      summaryRow.getCell('date').alignment = { horizontal: 'right' };
      summaryRow.getCell('total').value = { formula: `SUM(C${firstDataRow}:C${lastDataRow})` } as ExcelJS.CellFormulaValue;
      summaryRow.getCell('total').numFmt = '"$"#,##0.00';
      summaryRow.getCell('total').font = { bold: true };
      summaryRow.getCell('shipping').value = { formula: `SUM(D${firstDataRow}:D${lastDataRow})` } as ExcelJS.CellFormulaValue;
      summaryRow.getCell('shipping').numFmt = '"$"#,##0.00';
      summaryRow.getCell('shipping').font = { bold: true };
      summaryRow.eachCell((cell) => {
        cell.border = thinBorder;
      });

      // Generate filename with date range
      const filename = `orders_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.xlsx`;

      // Download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(
        `Successfully exported ${response.data.length} order${response.data.length !== 1 ? 's' : ''}`,
      );
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportOrders,
    isExporting,
  };
}
