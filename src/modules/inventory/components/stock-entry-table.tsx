import { useCallback, useMemo, useState } from 'react';
import {
  Control,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  UseFieldArrayRemove,
  FieldErrors,
} from 'react-hook-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardTable,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Package, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { StockEntrySchemaType } from '../schemas/stock-entry-schema';
import { StockVariantItem } from '../types/stock-variant.types';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import { DataGrid } from '@/shared/components/ui/data-grid';
import { DataGridTable } from '@/shared/components/ui/data-grid-table';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface StockEntryTableProps {
  fields: Array<{ id: string }>;
  register: UseFormRegister<StockEntrySchemaType>;
  control: Control<StockEntrySchemaType>;
  watch: UseFormWatch<StockEntrySchemaType>;
  setValue: UseFormSetValue<StockEntrySchemaType>;
  errors: FieldErrors<StockEntrySchemaType>;
  variants?: StockVariantItem[];
  loadingVariants: boolean;
  onAddProduct: (variantId: string) => void;
  onRemove: UseFieldArrayRemove;
  onProductChange: (index: number, variantId: string) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onCostChange: (index: number, cost: number) => void;
}

interface ITableData {
  id: string;
  index: number;
  productVariantId: string;
  productInfo: {
    name: string;
    sku: string;
    variantName: string;
  };
  quantity: number;
  costPerUnit: number;
  totalCost: number;
}

export function StockEntryTable({
  fields,
  register,
  watch,
  setValue,
  errors,
  variants = [],
  loadingVariants,
  onAddProduct,
  onRemove,
  onQuantityChange,
  onCostChange,
}: StockEntryTableProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const selectedVariantIds = useMemo(() => {
    return fields.map((_, index) => watch(`details.${index}.productVariantId`));
  }, [fields, watch]);

  const availableVariants = useMemo(() => {
    return variants.filter((v) => !selectedVariantIds.includes(v.productVariantId));
  }, [variants, selectedVariantIds]);

  const handleSelectProduct = useCallback(
    (variantId: string) => {
      onAddProduct(variantId);
      setOpen(false);
      setSearchValue('');
    },
    [onAddProduct],
  );

  const getProductDetails = useCallback(
    (variantId: string) => {
      return variants.find((v) => v.productVariantId === variantId);
    },
    [variants],
  );

  const data = useMemo<ITableData[]>(() => {
    return fields.map((field, index) => {
      const variantId = watch(`details.${index}.productVariantId`);
      const product = getProductDetails(variantId);
      const quantity = watch(`details.${index}.quantity`) || 0;
      const costPerUnit = watch(`details.${index}.costPerUnit`) || 0;
      const totalCost = watch(`details.${index}.totalCost`) || 0;

      return {
        id: field.id,
        index,
        productVariantId: variantId,
        productInfo: {
          name: product?.productName || 'Unknown Product',
          sku: product?.sku || 'N/A',
          variantName: product?.variantName || 'N/A',
        },
        quantity,
        costPerUnit,
        totalCost,
      };
    });
  }, [fields, watch, getProductDetails]);

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
                SKU: {productInfo.sku} | {productInfo.variantName}
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
        size: 250,
      },
      {
        id: 'quantity',
        accessorFn: (row) => row.quantity,
        header: () => <span className="font-medium">Quantity *</span>,
        cell: (info) => {
          const index = info.row.original.index;
          return (
            <div className="space-y-1 min-w-[100px]">
              <Input
                type="text"
                className="h-8"
                {...register(`details.${index}.quantity`, {
                  onChange: (e) => {
                    // Remove non-numeric characters
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    e.target.value = value;
                    const quantity = parseInt(value) || 0;
                    setValue(`details.${index}.quantity`, quantity);
                    onQuantityChange(index, quantity);
                  },
                })}
                onKeyDown={(e) => {
                  // Prevent Enter from submitting form
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    return;
                  }
                  // Allow: backspace, delete, tab, escape, arrows
                  if (
                    e.key === 'Backspace' ||
                    e.key === 'Delete' ||
                    e.key === 'Tab' ||
                    e.key === 'Escape' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight'
                  ) {
                    return;
                  }
                  // Prevent if not a number
                  if (!/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.details?.[index]?.quantity && (
                <p className="text-xs text-destructive">
                  {errors.details[index]?.quantity?.message}
                </p>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 120,
      },
      {
        id: 'costPerUnit',
        accessorFn: (row) => row.costPerUnit,
        header: () => <span className="font-medium">Cost Per Unit *</span>,
        cell: (info) => {
          const index = info.row.original.index;
          return (
            <div className="space-y-1 min-w-[120px]">
              <Input
                type="text"
                className="h-8"
                {...register(`details.${index}.costPerUnit`, {
                  onChange: (e) => {
                    // Remove non-numeric characters except decimal point
                    let value = e.target.value.replace(/[^0-9.]/g, '');

                    // Only allow one decimal point
                    const parts = value.split('.');
                    if (parts.length > 2) {
                      value = parts[0] + '.' + parts.slice(1).join('');
                    }

                    // Limit to 2 decimal places
                    if (parts[1] && parts[1].length > 2) {
                      value = parts[0] + '.' + parts[1].substring(0, 2);
                    }

                    e.target.value = value;
                    const cost = parseFloat(value) || 0;
                    setValue(`details.${index}.costPerUnit`, cost);
                    onCostChange(index, cost);
                  },
                })}
                onKeyDown={(e) => {
                  // Prevent Enter from submitting form
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    return;
                  }
                  // Allow: backspace, delete, tab, escape, arrows
                  if (
                    e.key === 'Backspace' ||
                    e.key === 'Delete' ||
                    e.key === 'Tab' ||
                    e.key === 'Escape' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight'
                  ) {
                    return;
                  }

                  // Allow decimal point if not already present
                  if (e.key === '.' && !e.currentTarget.value.includes('.')) {
                    return;
                  }

                  // Prevent if not a number
                  if (!/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.details?.[index]?.costPerUnit && (
                <p className="text-xs text-destructive">
                  {errors.details[index]?.costPerUnit?.message}
                </p>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 140,
      },
      {
        id: 'totalCost',
        accessorFn: (row) => row.totalCost,
        header: () => <span className="font-medium">Total Cost</span>,
        cell: (info) => {
          const totalCost = info.row.original.totalCost;
          return (
            <div className="font-bold text-sm bg-accent px-3 py-1.5 rounded-md inline-block min-w-[100px]">
              ${totalCost.toFixed(2)}
            </div>
          );
        },
        enableSorting: false,
        size: 120,
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
    [register, errors, onQuantityChange, onCostChange, onRemove],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">Products</CardTitle>
          <CardDescription>Add products to this entry</CardDescription>
        </div>

        {/* Combobox for adding products */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[300px] justify-between"
              disabled={loadingVariants || availableVariants.length === 0}
            >
              {loadingVariants ? 'Loading...' : 'Select product to add...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput
                placeholder="Search products..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>No products found.</CommandEmpty>
                <CommandGroup>
                  {availableVariants.map((variant) => (
                    <CommandItem
                      key={variant.productVariantId}
                      value={`${variant.productName} ${variant.variantName} ${variant.sku}`}
                      onSelect={() => handleSelectProduct(variant.productVariantId)}
                    >
                      <div className="flex flex-col w-full">
                        <span className="font-medium">{variant.productName}</span>
                        <span className="text-xs text-muted-foreground">
                          SKU: {variant.sku} | {variant.variantName}
                        </span>
                      </div>
                      <Check className={cn('ml-auto h-4 w-4', 'opacity-0')} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardHeader>

      <CardTable>
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No products added
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Use the combobox above to search and add products
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
