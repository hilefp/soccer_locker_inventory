import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Control,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  UseFieldArrayRemove,
  FieldErrors,
} from 'react-hook-form';
import { Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardTable,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Package, Plus, Trash2 } from 'lucide-react';
import { StockEntrySchemaType } from '../schemas/stock-entry-schema';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import { CodeScannerButton } from '@/shared/components/scanner/code-scanner-button';
import { DataGrid } from '@/shared/components/ui/data-grid';
import { DataGridTable } from '@/shared/components/ui/data-grid-table';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
];

// Memoized input cell to prevent focus loss while typing. The local value
// re-syncs when the form value changes externally (e.g. a barcode scan
// incrementing the quantity of an existing row).
interface QuantityInputProps {
  index: number;
  value: number;
  error?: string;
  onChangeValue: (index: number, value: number) => void;
}

const QuantityInput = memo(
  function QuantityInput({
    index,
    value,
    error,
    onChangeValue,
  }: QuantityInputProps) {
    const [localValue, setLocalValue] = useState(() => value.toString());

    useEffect(() => {
      // Sync external updates without clobbering in-progress typing
      if ((parseInt(localValue) || 0) !== value) {
        setLocalValue(value.toString());
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
      <div className="space-y-1 min-w-[100px]">
        <Input
          type="text"
          className="h-8"
          value={localValue}
          onChange={(e) => {
            setLocalValue(() => e.target.value);
            const quantity = parseInt(e.target.value) || 0;
            onChangeValue(index, quantity);
          }}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Re-render only when the index, error, or externally-set value changes
    return (
      prevProps.index === nextProps.index &&
      prevProps.error === nextProps.error &&
      prevProps.value === nextProps.value
    );
  },
);

interface StockEntryTableProps {
  fields: Array<{ id: string }>;
  register: UseFormRegister<StockEntrySchemaType>;
  control: Control<StockEntrySchemaType>;
  watch: UseFormWatch<StockEntrySchemaType>;
  setValue: UseFormSetValue<StockEntrySchemaType>;
  errors: FieldErrors<StockEntrySchemaType>;
  onOpenAddProducts: () => void;
  onScan: (decoded: string) => void;
  onRemove: UseFieldArrayRemove;
  onQuantityChange: (index: number, quantity: number) => void;
}

interface ITableData {
  id: string;
  index: number;
  productVariantId: string;
  productInfo: {
    name: string;
    sku: string;
  };
  quantity: number;
}

export function StockEntryTable({
  fields,
  watch,
  setValue,
  errors,
  onOpenAddProducts,
  onScan,
  onRemove,
  onQuantityChange,
}: StockEntryTableProps) {
  // Build static data for the table - only recompute when the field array
  // structurally changes (append/remove/update)
  const data = useMemo<ITableData[]>(() => {
    return fields.map((field, index) => {
      return {
        id: field.id,
        index,
        productVariantId: watch(`details.${index}.productVariantId`),
        productInfo: {
          name: watch(`details.${index}.productName`) || 'Unknown Product',
          sku: watch(`details.${index}.sku`) || 'N/A',
        },
        quantity: watch(`details.${index}.quantity`) || 0,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  // Stable callback for the quantity input
  const handleQuantityInputChange = useCallback(
    (index: number, quantity: number) => {
      setValue(`details.${index}.quantity`, quantity);
      onQuantityChange(index, quantity);
    },
    [setValue, onQuantityChange],
  );

  const columns = useMemo<ColumnDef<ITableData>[]>(
    () => [
      {
        id: 'productInfo',
        accessorFn: (row) => row.productInfo,
        header: () => <span className="font-medium">Product</span>,
        cell: (info) => {
          const index = info.row.original.index;
          const productInfo = info.row.original.productInfo;

          return (
            <div className="flex flex-col min-w-[200px]">
              <span className="font-medium text-sm">{productInfo.name}</span>
              <span className="text-xs text-muted-foreground">
                SKU: {productInfo.sku}
              </span>
              {errors.details?.[index]?.productVariantId && (
                <p className="text-xs text-destructive mt-1">
                  {errors.details[index]?.productVariantId?.message}
                </p>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 400,
      },
      {
        id: 'quantity',
        accessorFn: (row) => row.quantity,
        header: () => <span className="font-medium">Quantity *</span>,
        cell: (info) => {
          const index = info.row.original.index;
          // Read via watch so external updates (scan increments) reach the cell
          const quantity = watch(`details.${index}.quantity`) || 0;
          return (
            <QuantityInput
              key={`qty-${info.row.original.id}`}
              index={index}
              value={quantity}
              error={errors.details?.[index]?.quantity?.message}
              onChangeValue={handleQuantityInputChange}
            />
          );
        },
        enableSorting: false,
        size: 140,
      },
      {
        id: 'actions',
        header: () => <span className="font-medium text-center block">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const index = row.original.index;
          return (
            <div className="flex items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onRemove(index)}
                title="Remove product"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        size: 80,
      },
    ],
    [errors, handleQuantityInputChange, onRemove, watch],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
    getRowId: (row) => row.id,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">Products</CardTitle>
          <CardDescription>
            Add products by search or barcode scan
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <CodeScannerButton
            onScan={onScan}
            label="Scan Barcode"
            title="Scan Product Barcode"
            helperText="Point the camera at the product barcode"
            formats={BARCODE_FORMATS}
            scannerId="stock-entry-barcode-scanner"
          />
          <Button type="button" variant="mono" onClick={onOpenAddProducts}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Products
          </Button>
        </div>
      </CardHeader>

      <CardTable>
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No products added
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Use the Add Products button or scan a barcode to add products
            </p>
          </div>
        ) : (
          <>
            <DataGrid
              table={table}
              recordCount={data.length}
              tableLayout={{
                cellBorder: true,
                rowBorder: true,
                headerSticky: false,
                width: 'auto',
              }}
            >
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </DataGrid>

            {errors.details?.root && (
              <div className="px-4 pb-4">
                <p className="text-sm text-destructive">{errors.details.root.message}</p>
              </div>
            )}
          </>
        )}
      </CardTable>
    </Card>
  );
}
