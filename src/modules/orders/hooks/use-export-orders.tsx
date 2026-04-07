import { useState } from 'react';
import { format, endOfDay } from 'date-fns';
import ExcelJS from 'exceljs';
import { ordersService } from '@/modules/orders/services/orders.service';
import { toast } from 'sonner';

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

      // Define columns with bold headers
      worksheet.columns = [
        { header: 'Order Number', key: 'orderNumber', width: 18 },
        { header: 'Date', key: 'date', width: 14 },
        { header: 'Total', key: 'total', width: 14 },
        { header: 'Shipping', key: 'shipping', width: 14 },
      ];

      // Bold and center header row
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
      });

      // Add data rows
      response.data.forEach((order) => {
        const row = worksheet.addRow({
          orderNumber: Number(order.orderNumber),
          date: format(new Date(order.createdAt), 'MM/dd/yyyy'),
          total: Number((Number(order.subtotal) + Number(order.taxTotal) + Number(order.rushFee ?? 0)).toFixed(2)),
          shipping: Number(Number(order.shippingTotal).toFixed(2)),
        });

        // Apply currency format to Total and Shipping columns
        row.getCell('total').numFmt = '"$"#,##0.00';
        row.getCell('shipping').numFmt = '"$"#,##0.00';
        // Left-align date
        row.getCell('date').alignment = { horizontal: 'right' };
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
