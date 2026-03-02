import { useState } from 'react';
import { toast } from 'sonner';
import { salesReportsService } from '../services/sales-reports.service';
import { ClubSalesFilters } from '../types/sales-reports.types';

interface UseClubSalesExportResult {
  exporting: boolean;
  exportToExcel: () => Promise<void>;
}

export function useClubSalesExport(
  filters: ClubSalesFilters | null
): UseClubSalesExportResult {
  const [exporting, setExporting] = useState(false);

  const exportToExcel = async () => {
    if (!filters?.clubId) {
      toast.error('Debes seleccionar un club para exportar');
      return;
    }

    try {
      setExporting(true);
      const blob = await salesReportsService.exportClubSalesReport(filters);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const today = new Date().toISOString().split('T')[0];
      link.download = `club-sales-report-${today}-club-${filters.clubId}.xlsx`;

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
