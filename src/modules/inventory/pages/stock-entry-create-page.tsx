import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
// Import components
import { StockEntryHeader } from '../components/stock-entry-header';
import { StockEntryInformationCard } from '../components/stock-entry-information-card';
import { StockEntrySummaryCard } from '../components/stock-entry-summary-card';
import { StockEntryTable } from '../components/stock-entry-table';
import { useCreateStockEntry } from '../hooks/use-stock-entry';
import { useStockVariants } from '../hooks/use-stock-variants';
import { useWarehouses } from '../hooks/use-warehouses';
import {
  getStockEntrySchema,
  StockEntrySchemaType,
} from '../schemas/stock-entry-schema';
import { stockEntryService } from '../services/stock-entry.service';
import { CreateStockEntryDto, EntryType } from '../types/stock-entry.types';

export function StockEntryCreatePage() {
  useDocumentTitle('Create Stock Entry');
  const navigate = useNavigate();
  const createMutation = useCreateStockEntry();
  const { data: warehouses, isLoading: loadingWarehouses } = useWarehouses();
  const { data: variantsResponse, isLoading: loadingVariants } =
    useStockVariants({ limit: 100 });

  const [entryNumber, setEntryNumber] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
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

  const handleAddProduct = (variantId: string) => {
    const variant = variantsResponse?.data.find(
      (v) => v.productVariantId === variantId,
    );
    const newId = `temp-${Date.now()}`;

    if (variant) {
      const costPerUnit = variant.cost || 0;
      const quantity = 1;
      append({
        id: newId,
        productVariantId: variantId,
        productName: variant.productName,
        sku: variant.sku,
        quantity,
        costPerUnit,
        totalCost: quantity * costPerUnit,
      });
    }
  };

  const handleProductChange = (index: number, variantId: string) => {
    const variant = variantsResponse?.data.find(
      (v) => v.productVariantId === variantId,
    );
    if (variant) {
      const costPerUnit = variant.cost || 0;
      const quantity = watch(`details.${index}.quantity`) || 0;
      setValue(`details.${index}.productVariantId`, variantId);
      setValue(`details.${index}.productName`, variant.productName);
      setValue(`details.${index}.sku`, variant.sku);
      setValue(`details.${index}.costPerUnit`, costPerUnit);
      setValue(`details.${index}.totalCost`, quantity * costPerUnit);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const costPerUnit = watch(`details.${index}.costPerUnit`) || 0;
    setValue(`details.${index}.quantity`, quantity);
    setValue(`details.${index}.totalCost`, quantity * costPerUnit);
  };

  const handleCostChange = (index: number, cost: number) => {
    const quantity = watch(`details.${index}.quantity`) || 0;
    setValue(`details.${index}.costPerUnit`, cost);
    setValue(`details.${index}.totalCost`, quantity * cost);
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
        createdBy: 'current-user-id', // TODO: Get from auth context
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
      navigate('/inventory');
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Submit error:', error);
    }
  };

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

            {/* Products Table */}
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
            variants={variantsResponse?.data}
            loadingVariants={loadingVariants}
            onAddProduct={handleAddProduct}
            onRemove={remove}
            onProductChange={handleProductChange}
            onQuantityChange={handleQuantityChange}
            onCostChange={handleCostChange}
          />
        </div>
      </div>
    </form>
  );
}
