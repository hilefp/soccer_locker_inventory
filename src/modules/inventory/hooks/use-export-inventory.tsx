import { useState } from 'react';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { stockVariantService } from '../services/stock-variant.service';
import { StockStatus } from '../types/stock-variant.types';
import { toast } from 'sonner';

const STATUS_LABEL: Record<StockStatus, string> = {
  [StockStatus.IN_STOCK]: 'In Stock',
  [StockStatus.LOW_STOCK]: 'Low Stock',
  [StockStatus.OUT_OF_STOCK]: 'Out of Stock',
};

export function useExportInventory() {
  const [isExporting, setIsExporting] = useState(false);

  const exportInventory = async (productIds?: string[]) => {
    try {
      setIsExporting(true);

      const hasFilter = productIds && productIds.length > 0;

      const allVariants = hasFilter
        ? await Promise.all(
            productIds.map((productId) =>
              stockVariantService.getAll({
                limit: 10000,
                productId,
                sortBy: 'productName',
                sortOrder: 'asc',
              })
            )
          ).then((responses) => {
            const seen = new Set<string>();
            return responses
              .flatMap((r) => r.data)
              .filter((v) => {
                if (seen.has(v.productVariantId)) return false;
                seen.add(v.productVariantId);
                return true;
              });
          })
        : await stockVariantService
            .getAll({ limit: 10000, sortBy: 'productName', sortOrder: 'asc' })
            .then((r) => r.data);

      if (!allVariants || allVariants.length === 0) {
        toast.info('No stock variants found for the selected filter');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inventory');

      worksheet.columns = [
        { header: 'SKU', key: 'sku', width: 20 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Variant', key: 'variantName', width: 20 },
        { header: 'Category', key: 'categoryName', width: 18 },
        { header: 'Total Qty', key: 'totalQuantity', width: 12 },
        { header: 'Reserved', key: 'totalReserved', width: 12 },
        { header: 'Available', key: 'totalAvailable', width: 12 },
        { header: 'Warehouses', key: 'warehouseCount', width: 12 },
        { header: 'Cost', key: 'cost', width: 14 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Last Movement', key: 'lastMovement', width: 18 },
      ];

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
      });

      allVariants.forEach((variant) => {
        const row = worksheet.addRow({
          sku: variant.sku,
          productName: variant.productName,
          variantName: variant.variantName,
          categoryName: variant.categoryName ?? '',
          totalQuantity: variant.totalQuantity,
          totalReserved: variant.totalReserved,
          totalAvailable: variant.totalAvailable,
          warehouseCount: variant.warehouseCount,
          cost: variant.cost != null ? Number(variant.cost) : '',
          status: STATUS_LABEL[variant.status],
          lastMovement: variant.lastMovement
            ? format(new Date(variant.lastMovement), 'MM/dd/yyyy')
            : '',
        });

        if (variant.cost != null) {
          row.getCell('cost').numFmt = '"$"#,##0.00';
        }
      });

      const today = format(new Date(), 'yyyy-MM-dd');
      const filename = hasFilter
        ? `inventory_product_${today}.xlsx`
        : `inventory_${today}.xlsx`;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(
        `Successfully exported ${allVariants.length} variant${allVariants.length !== 1 ? 's' : ''}`,
      );
    } catch (error) {
      console.error('Error exporting inventory:', error);
      toast.error('Failed to export inventory. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return { exportInventory, isExporting };
}
