import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
// Import components
import { AddProductsToEntryDialog } from '../components/add-products-to-entry-dialog';
import { StockEntryHeader } from '../components/stock-entry-header';
import { StockEntryInformationCard } from '../components/stock-entry-information-card';
import { StockEntrySummaryCard } from '../components/stock-entry-summary-card';
import { StockEntryTable } from '../components/stock-entry-table';
import { useCreateStockEntry } from '../hooks/use-stock-entry';
import { useStockVariantByBarcode } from '../hooks/use-stock-variants';
import { useWarehouses } from '../hooks/use-warehouses';
import {
  getStockEntrySchema,
  StockEntrySchemaType,
} from '../schemas/stock-entry-schema';
import { stockEntryService } from '../services/stock-entry.service';
import { CreateStockEntryDto, EntryType } from '../types/stock-entry.types';
import { StockVariantItem } from '../types/stock-variant.types';
import { WarehouseType } from '../types/warehouse.types';

export function StockEntryCreatePage() {
  useDocumentTitle('Create Stock Entry');
  const navigate = useNavigate();
  const createMutation = useCreateStockEntry();
  const { data: warehouses, isLoading: loadingWarehouses } = useWarehouses();
  const lookupBarcode = useStockVariantByBarcode();

  const [entryNumber, setEntryNumber] = useState('');
  const [addProductsOpen, setAddProductsOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<StockEntrySchemaType>({
    resolver: zodResolver(getStockEntrySchema()),
    defaultValues: {
      entryNumber: '',
      warehouseId: '',
      entryType: EntryType.PURCHASE,
      entryDate: new Date(),
      details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  // Generate entry number on mount
  useEffect(() => {
    const generateNumber = async () => {
      const number = await stockEntryService.generateEntryNumber();
      setEntryNumber(number);
      setValue('entryNumber', number);
    };
    generateNumber();
  }, [setValue]);

  // Default the warehouse to the main one once warehouses load
  useEffect(() => {
    if (!warehouses || warehouses.length === 0) return;
    if (getValues('warehouseId')) return;

    const mainWarehouse =
      warehouses.find(
        (w) => w.warehouseType === WarehouseType.MAIN && w.isActive,
      ) || warehouses[0];
    setValue('warehouseId', mainWarehouse.id);
  }, [warehouses, getValues, setValue]);

  const details = watch('details');

  // Calculate totals
  const totalItems = details.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );
  const totalCost = details.reduce(
    (sum, item) => sum + (item.totalCost || 0),
    0,
  );

  /**
   * Append the given variants to the entry. Variants already in the table
   * get their quantity incremented instead of being duplicated.
   */
  const handleAddVariants = (variants: StockVariantItem[]) => {
    for (const variant of variants) {
      const currentDetails = getValues('details');
      const existingIndex = currentDetails.findIndex(
        (d) => d.productVariantId === variant.productVariantId,
      );

      if (existingIndex >= 0) {
        const current = currentDetails[existingIndex];
        const quantity = (current.quantity || 0) + 1;
        setValue(`details.${existingIndex}.quantity`, quantity);
        setValue(
          `details.${existingIndex}.totalCost`,
          quantity * (current.costPerUnit || 0),
        );
      } else {
        const costPerUnit = variant.cost || 0;
        append({
          id: `temp-${variant.productVariantId}`,
          productVariantId: variant.productVariantId,
          productName: variant.variantName
            ? `${variant.productName} (${variant.variantName})`
            : variant.productName,
          sku: variant.sku,
          quantity: 1,
          costPerUnit,
          totalCost: costPerUnit,
        });
      }
    }
  };

  const handleBarcodeScan = async (raw: string) => {
    const cleaned = raw.trim().replace(/\D/g, '');
    if (!cleaned) {
      toast.error('Invalid barcode');
      return;
    }

    try {
      const result = await lookupBarcode.mutateAsync(cleaned);
      const scanned = result.variants.data.find(
        (v) => v.productVariantId === result.variant.id,
      );
      if (!scanned) {
        toast.error('Scanned product not found in inventory');
        return;
      }
      handleAddVariants([scanned]);
      toast.success(`${scanned.productName} (${scanned.sku}) added`);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error('Barcode not registered to any product');
      } else {
        toast.error('Failed to look up barcode');
      }
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const costPerUnit = watch(`details.${index}.costPerUnit`) || 0;
    setValue(`details.${index}.quantity`, quantity);
    setValue(`details.${index}.totalCost`, quantity * costPerUnit);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const onSubmit = async (data: StockEntrySchemaType) => {
    try {
      // Transform form data to API format
      const payload: CreateStockEntryDto = {
        entryNumber: data.entryNumber,
        warehouseId: data.warehouseId,
        supplierId: data.supplierId || undefined,
        purchaseOrderId: data.purchaseOrderId || undefined,
        entryType: data.entryType,
        referenceDocument: data.referenceDocument || undefined,
        entryDate: data.entryDate.toISOString(),
        notes: data.notes || undefined,
        confirm: true,
        details: data.details.map((detail) => ({
          productVariantId: detail.productVariantId,
          quantity: detail.quantity,
          expectedQuantity: detail.expectedQuantity || undefined,
          costPerUnit: detail.costPerUnit,
          lotNumber: detail.lotNumber || undefined,
          expirationDate: detail.expirationDate || undefined,
          notes: detail.notes || undefined,
        })),
      };

      await createMutation.mutateAsync(payload);
      navigate('/inventory/stock-entries');
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Submit error:', error);
    }
  };

  const existingVariantIds = details.map((d) => d.productVariantId);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="container-fluid space-y-6">
        {/* Header */}
        <StockEntryHeader
          onBack={handleBack}
          onCancel={handleBack}
          isSubmitting={isSubmitting}
          hasProducts={fields.length > 0}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Entry Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Entry Information Card */}
            <StockEntryInformationCard
              register={register}
              control={control}
              errors={errors}
              warehouses={warehouses}
              loadingWarehouses={loadingWarehouses}
            />
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <StockEntrySummaryCard
              entryNumber={entryNumber}
              totalItems={totalItems}
              productsCount={fields.length}
              totalCost={totalCost}
            />
          </div>
        </div>

        <div>
          <StockEntryTable
            fields={fields}
            register={register}
            control={control}
            watch={watch}
            setValue={setValue}
            errors={errors}
            onOpenAddProducts={() => setAddProductsOpen(true)}
            onScan={handleBarcodeScan}
            onRemove={remove}
            onQuantityChange={handleQuantityChange}
          />
        </div>
      </div>

      <AddProductsToEntryDialog
        open={addProductsOpen}
        onOpenChange={setAddProductsOpen}
        existingVariantIds={existingVariantIds}
        onAdd={handleAddVariants}
      />
    </form>
  );
}
