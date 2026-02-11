import { useState } from 'react';
import { format, endOfDay } from 'date-fns';
import * as XLSX from 'xlsx';
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
        sortOrder: 'asc',
      });

      if (!response.data || response.data.length === 0) {
        toast.info('No orders found in the selected date range');
        return;
      }

      // Prepare data for Excel
      const excelData = response.data.map((order) => ({
        'Order Number': order.orderNumber,
        'Date': format(new Date(order.createdAt), 'MM/dd/yyyy'),
        'Total': `$${Number(order.total).toFixed(2)}`,
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 15 }, // Order Number
        { wch: 12 }, // Date
        { wch: 12 }, // Total
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      // Generate filename with date range
      const filename = `orders_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);

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
