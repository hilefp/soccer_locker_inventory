/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Column,
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Eye, Search, SquarePen, Trash, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/shared/lib/helpers';
import { Badge, BadgeProps } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardToolbar,
} from '@/shared/components/ui/card';
import { DataGrid } from '@/shared/components/ui/data-grid';
import { DataGridColumnHeader } from '@/shared/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/shared/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/shared/components/ui/data-grid-table';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import { BrandFormSheet } from '@/modules/products/components/brand-form-sheet';
import { ProductBrand } from '@/modules/products/types/product-brand.type';
import { useDeleteProductBrand } from '@/modules/products/hooks/use-product-brands';

export interface IBrandData {
  id: string;
  brandInfo: {
    image: string;
    name: string;
    code: string;
  };
  websiteUrl?: string;
  status: {
    label: string;
    variant: string;
  };
  created?: string;
  updated?: string;
}

interface BrandListProps {
  brands?: ProductBrand[];
  isLoading?: boolean;
  error?: string | null;
}

// Helper function to convert ProductBrand to IBrandData format
const convertBrandToIBrandData = (brand: ProductBrand): IBrandData => {
  return {
    id: brand.id || '',
    brandInfo: {
      image: brand.imageUrl || 'running-shoes.svg',
      name: brand.name,
      code: brand.code,
    },
    websiteUrl: brand.websiteUrl,
    status: {
      label: brand.isActive ? 'Active' : 'Inactive',
      variant: brand.isActive ? 'success' : 'destructive',
    },
    created: brand.createdAt,
    updated: brand.updatedAt,
  };
};

export function BrandListTable({
  brands,
  isLoading = false,
  error = null,
}: BrandListProps) {
  // CRITICAL FIX: Memoize data conversion to prevent infinite re-renders
  const data = useMemo(() => {
    if (!brands || brands.length === 0) return [];
    return brands.map(convertBrandToIBrandData);
  }, [brands]);

  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: false },
  ]);

  // React Query hook for delete mutation
  const deleteMutation = useDeleteProductBrand();

  // Sheet state
  const [isEditBrandOpen, setIsEditBrandOpen] = useState(false);
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>(undefined);

  const columns = useMemo<ColumnDef<IBrandData>[]>(
    () => [
      {
        accessorKey: 'id',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 23,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'brandInfo',
        accessorFn: (row) => row.brandInfo,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Brand"
            column={column}
          />
        ),
        cell: (info) => {
          const brandInfo = info.row.getValue('brandInfo') as IBrandData['brandInfo'];

          // Check if image is an icon file (contains /icons/ or is just a filename)
          const isIconFile = brandInfo.image.includes('/icons/') ||
                            (!brandInfo.image.startsWith('http') && !brandInfo.image.startsWith('/'));
          const iconFileName = isIconFile ? brandInfo.image.split('/').pop() : null;

          return (
            <div className="flex items-center gap-2.5">
              <Card className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shadow-none shrink-0">
                {isIconFile && iconFileName ? (
                  <>
                    <img
                      src={toAbsoluteUrl(
                        `/media/store/client/icons/light/${iconFileName}`,
                      )}
                      className="cursor-pointer h-[30px] object-contain dark:hidden"
                      alt="brand"
                    />
                    <img
                      src={toAbsoluteUrl(
                        `/media/store/client/icons/dark/${iconFileName}`,
                      )}
                      className="cursor-pointer h-[30px] object-contain light:hidden"
                      alt="brand"
                    />
                  </>
                ) : (
                  <img
                    src={brandInfo.image}
                    className="cursor-pointer h-[30px] w-full object-contain"
                    alt="brand"
                  />
                )}
              </Card>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium tracking-[-1%]">
                  {brandInfo.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  Code:{' '}
                  <span className="text-xs font-medium text-foreground">
                    {brandInfo.code}
                  </span>
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 200,
      },
      {
        id: 'websiteUrl',
        accessorFn: (row) => row.websiteUrl,
        header: ({ column }) => (
          <DataGridColumnHeader title="Website" column={column} />
        ),
        cell: (info) => {
          const url = info.getValue() as string | undefined;
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Visit <ExternalLink className="size-3" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
        enableSorting: false,
        size: 100,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: (info) => {
          const status = info.row.original.status;
          const variant = status.variant as keyof BadgeProps['variant'];
          return (
            <Badge variant={variant} appearance="light">
              {status.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 80,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const brandId = row.getValue('id') as string;

          const handleEdit = () => {
            setSelectedBrandId(brandId);
            setIsEditBrandOpen(true);
          };

          const handleDelete = async () => {
            if (!brandId) return;

            try {
              await deleteMutation.mutateAsync(brandId);
            } catch (error) {
              // Error handling is done in the mutation hook
              console.error('Delete error:', error);
            }
          };

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleEdit}
                title="Edit brand"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDelete}
                title="Delete brand"
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [],
  );

  // OPTIMIZED: Return data directly when no search query
  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return data;
    }
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      item.brandInfo.name.toLowerCase().includes(query) ||
      item.brandInfo.code.toLowerCase().includes(query),
    );
  }, [data, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      {/* Brand List Table */}
      <DataGrid
        table={table}
        recordCount={filteredData?.length || 0}
        tableLayout={{
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
          cellBorder: true,
        }}
      >
        <Card>
          <CardHeader className="py-3.5">
            <CardToolbar className="flex items-center gap-2">
              <InputWrapper className="w-full lg:w-[200px]">
                <Search />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="dim"
                    size="sm"
                    className="-me-3.5"
                    onClick={() => setSearchQuery('')}
                  >
                    {searchQuery && <X />}
                  </Button>
                )}
              </InputWrapper>
            </CardToolbar>
          </CardHeader>
          <CardTable>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">Loading brands...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-destructive">Error loading brands</span>
                <span className="text-sm text-muted-foreground">{error}</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">
                  {searchQuery ? 'No brands found matching your search' : 'No brands yet'}
                </span>
              </div>
            ) : (
              <ScrollArea>
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      {/* Edit Brand Sheet */}
      <BrandFormSheet
        mode="edit"
        open={isEditBrandOpen}
        onOpenChange={setIsEditBrandOpen}
        brandId={selectedBrandId}
      />

      {/* Create Brand Sheet */}
      <BrandFormSheet
        mode="new"
        open={isCreateBrandOpen}
        onOpenChange={setIsCreateBrandOpen}
      />
    </>
  );
}
