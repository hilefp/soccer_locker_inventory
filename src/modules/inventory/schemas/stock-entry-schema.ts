import { z } from 'zod';
import { EntryType } from '../types/stock-entry.types';

export const getStockEntryDetailSchema = () => {
  return z.object({
    id: z.string(),
    productVariantId: z.string().min(1, 'Product variant is required'),
    productName: z.string().optional(),
    sku: z.string().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    expectedQuantity: z.number().min(1).optional(),
    costPerUnit: z.number().min(0, 'Cost must be 0 or greater'),
    totalCost: z.number(),
    lotNumber: z.string().optional(),
    expirationDate: z.string().optional(),
    notes: z.string().optional(),
  });
};

export const getStockEntrySchema = () => {
  return z.object({
    entryNumber: z.string().min(1, 'Entry number is required'),
    warehouseId: z.string().min(1, 'Warehouse is required'),
    supplierId: z.string().optional(),
    purchaseOrderId: z.string().optional(),
    entryType: z.nativeEnum(EntryType, {
      message: 'Entry type is required',
    }),
    referenceDocument: z.string().optional(),
    entryDate: z.date({
      message: 'Entry date is required',
    }),
    notes: z.string().optional(),
    details: z.array(getStockEntryDetailSchema()).min(1, 'At least one product is required'),
  });
};

export type StockEntrySchemaType = z.infer<ReturnType<typeof getStockEntrySchema>>;
export type StockEntryDetailSchemaType = z.infer<ReturnType<typeof getStockEntryDetailSchema>>;
