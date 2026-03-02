import { useState } from 'react';
import { toast } from 'sonner';
import { salesReportsService } from '../services/sales-reports.service';
import { SalesReportFilters } from '../types/sales-reports.types';

interface UseGeneralSalesExportResult {
  exporting: boolean;
  exportToExcel: () => Promise<void>;
}

export function useGeneralSalesExport(
  filters?: SalesReportFilters
): UseGeneralSalesExportResult {
  const [exporting, setExporting] = useState(false);

  const exportToExcel = async () => {
    try {
      setExporting(true);
      const blob = await salesReportsService.exportGeneralSalesReport(filters);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const today = new Date().toISOString().split('T')[0];
      link.download = `general-sales-report-${today}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Reporte exportado exitosamente');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Error al exportar el reporte';
      toast.error(typeof message === 'string' ? message : 'Error al exportar el reporte');
    } finally {
      setExporting(false);
    }
  };

  return { exporting, exportToExcel };
}
