import { useState } from 'react';
import { format } from 'date-fns';
import { customerService } from '../services/customer.service';
import { CustomerFilterParams } from '@/modules/shop/types/customer.type';
import { toast } from 'sonner';

export function useExportCustomers() {
  const [isExporting, setIsExporting] = useState(false);

  // The backend builds the xlsx and returns it as a blob. We just trigger the
  // download. Filters are forwarded so the export mirrors the current view.
  const exportCustomers = async (filters?: CustomerFilterParams) => {
    try {
      setIsExporting(true);

      const blob = await customerService.exportCustomers(filters);

      const today = format(new Date(), 'yyyy-MM-dd');
      const filename = `customers_${today}.xlsx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Customers exported successfully');
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error('Failed to export customers. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCustomers, isExporting };
}
