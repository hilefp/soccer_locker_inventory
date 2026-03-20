'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import {
  EllipsisVertical,
  Filter,
  Info,
  Search,
  Settings,
  Trash,
  X,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, toAbsoluteUrl } from '@/shared/lib/helpers';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
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
import { DataGridColumnVisibility } from '@/shared/components/ui/data-grid-column-visibility';
import { DataGridPagination } from '@/shared/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/shared/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { Product } from '@/modules/products/types/product.type';
import { useDeleteProduct } from '@/modules/products/hooks/use-products';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export interface IData {
  id: string;
  productInfo: {
    image: string;
    title: string;
    label: string;
    tooltip: string;
  };
  category: string;
  brand: string;
  price: string;
  status: {
    label: string;
    variant: string;
  };
  created: string;
  updated: string;
}

interface ProductListProps {
  products?: Product[];
  isLoading?: boolean;
  error?: string | null;
}

// Helper function to convert Product to IData format
const convertProductToIData = (product: Product): IData => {
  // Calculate price from variants if available
  let priceDisplay = 'N/A';
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants
      .map(v => typeof v.price === 'number' ? v.price : parseFloat(String(v.price)))
      .filter(p => !isNaN(p));
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        priceDisplay = `$${minPrice.toFixed(2)}`;
      } else {
        priceDisplay = `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
      }
    }
  } else if (product.minPrice !== undefined && product.minPrice !== null) {
    const minPrice = typeof product.minPrice === 'number'
      ? product.minPrice
      : parseFloat(String(product.minPrice));
    if (!isNaN(minPrice)) {
      priceDisplay = `$${minPrice.toFixed(2)}`;
    }
  }

  return {
    id: product.id || '',
    productInfo: {
      image: product.imageUrl || '', // Empty string instead of hardcoded fallback
      title: product.name,
      label: product.defaultVariant?.sku || product.sku,
      tooltip: product.model || product.name,
    },
    category: product.category?.name || 'Uncategorized',
    brand: product.brand?.name || 'N/A',
    price: priceDisplay,
    status: {
      label: product.isActive ? 'Live' : 'Draft',
      variant: product.isActive ? 'success' : 'warning',
    },
    created: product.createdAt || '',
    updated: product.updatedAt || '',
  };
};


export function ProductListTable({
  products,
}: ProductListProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.map(convertProductToIData);
  }, [products]);

  // React Query hook for delete mutation
  const deleteMutation = useDeleteProduct();

  // Read initial state from URL search params
  const searchQuery = searchParams.get('q') || '';
  const activeTab = searchParams.get('tab') || 'all';
  const pageIndex = Number(searchParams.get('page') || '0');
  const sortId = searchParams.get('sort') || 'created';
  const sortDesc = searchParams.get('desc') !== 'false'; // default true

  // Helper to update search params without replacing history
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      // Clean up defaults to keep URL tidy
      if (next.get('tab') === 'all') next.delete('tab');
      if (next.get('page') === '0') next.delete('page');
      if (next.get('sort') === 'created' && next.get('desc') !== 'false') {
        next.delete('sort');
        next.delete('desc');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setSearchQuery = useCallback((q: string) => {
    updateParams({ q: q || null, page: null }); // reset page on search
  }, [updateParams]);

  const setActiveTab = useCallback((tab: string) => {
    updateParams({ tab, page: null }); // reset page on tab change
  }, [updateParams]);

  // Search input state
  const [inputValue, setInputValue] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: sortId, desc: sortDesc },
  ]);
  const [selectedLastMoved] = useState<string[]>([]);

  const handleEditProduct = (product: IData) => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleViewDetails = (product: IData) => {
    navigate(`/products/${product.id}`);
  };

  const handleDeleteProduct = (product: IData) => {
    console.log('Deleting product:', product);
    deleteMutation.mutate(product.id);
  };

  const ColumnInputFilter = <TData, TValue>({
    column,
  }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filter..."
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        variant="sm"
        className="w-40"
      />
    );
  };

  const columns = useMemo<ColumnDef<IData>[]>(
    () => [
      {
        accessorKey: 'id',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 40,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'productInfo',
        accessorFn: (row) => row.productInfo,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Product Info"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        cell: (info) => {
          const productInfo = info.row.getValue('productInfo') as {
            image: string;
            title: string;
            label: string;
            tooltip: string;
          };

          return (
            <div className="flex items-center gap-2.5">
              <Card className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shadow-none shrink-0">
                {productInfo.image ? (
                  <img
                    src={productInfo.image.startsWith('http')
                      ? productInfo.image
                      : toAbsoluteUrl(`/media/store/client/1200x1200/${productInfo.image}`)
                    }
                    className="cursor-pointer h-[40px] object-cover"
                    alt={productInfo.title}
                    onError={(e) => {
                      // Fallback to placeholder on error
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<Package class="size-5 text-muted-foreground" />';
                    }}
                  />
                ) : (
                  <Package className="size-5 text-muted-foreground" />
                )}
              </Card>
              <div className="flex flex-col gap-1">
                {productInfo.title.length > 20 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="text-sm font-medium text-foreground leading-3.5 truncate max-w-[180px] cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleViewDetails(info.row.original)}
                        >
                          {productInfo.title}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{productInfo.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span
                    className="text-sm font-medium text-foreground leading-3.5 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleViewDetails(info.row.original)}
                  >
                    {productInfo.title}
                  </span>
                )}
                <span className="text-xs text-muted-foreground uppercase">
                  sku:{' '}
                  <span className="text-xs font-medium text-secondary-foreground">
                    {productInfo.label}
                  </span>
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 260,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'category',
        accessorFn: (row) => row.category,
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        cell: (info) => {
          return (
            <div>{info.row.original.category}</div>
          );
        },
        enableSorting: true,
        size: 110,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'brand',
        accessorFn: (row) => row.brand,
        header: ({ column }) => (
          <DataGridColumnHeader title="Brand" column={column} />
        ),
        cell: (info) => {
          return (
            <div>{info.row.original.brand}</div>
          );
        },
        enableSorting: true,
        size: 110,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'price',
        accessorFn: (row) => row.price,
        header: ({ column }) => (
          <DataGridColumnHeader title="Price" column={column} />
        ),
        cell: (info) => {
          return <div className="text-center">{info.row.original.price}</div>;
        },
        enableSorting: true,
        size: 80,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: (info) => {
          const status = info.row.original.status;
          const variant = status.variant as 'primary' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'info';
          return (
            <Badge
              variant={variant}
              appearance="light"
              className="rounded-full"
            >
              {status.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 90,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'created',
        accessorFn: (row) => row.created,
        header: ({ column }) => (
          <DataGridColumnHeader title="Created" column={column} />
        ),
        cell: (info) => {
          return formatDate(new Date(info.row.original.created));
        },
        enableSorting: true,
        size: 120,
        meta: {
          cellClassName: '',
        },
      },
      // {
      //   id: 'updated',
      //   accessorFn: (row) => row.updated,
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Updated" column={column} />
      //   ),
      //   cell: (info) => {
      //     return formatDate(new Date(info.row.original.updated));
      //   },
      //   enableSorting: true,
      //   size: 120,
      //   meta: {
      //     cellClassName: '',
      //   },
      // },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" mode="icon" size="sm" className="">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom">
                  <DropdownMenuItem onClick={() => handleEditProduct(row.original)}>
                    <Settings className="size-4" />
                    Edit Product
                  </DropdownMenuItem>
                  
                    <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
                      <Info className="size-4" />
                      View Details
                    </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => handleDeleteProduct(row.original)}>
                    <Trash className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 80,
      },
    ],
    [], // Same columns for all tabs
  );

  // Apply search, tab, and last moved filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply tab filter based on tabs array ids
    if (activeTab === 'all') {
      result = result; // No filter, show all data
    } else if (activeTab === 'live') {
      result = result.filter((item) => item.status.label === 'Live');
    } else if (activeTab === 'draft') {
      result = result.filter((item) => item.status.label === 'Draft');
    } else if (activeTab === 'archived') {
      result = result.filter((item) => item.status.label === 'Archived');
    } else if (activeTab === 'actionNeeded') {
      result = result.filter((item) => item.created > '2023-01-01');
    }

    // Apply search filter - search in product title and SKU
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.productInfo.title?.toLowerCase()?.includes(query) ||
        item.productInfo.label?.toLowerCase()?.includes(query),
      );
    }

    return result;
  }, [data, activeTab, searchQuery]);

  useEffect(() => {
    const selectedRowIds = Object.keys(rowSelection);
    if (selectedRowIds.length > 0) {
      toast.custom(
        (t) => (
          <Alert
            variant="mono"
            icon="success"
            close={true}
            onClose={() => toast.dismiss(t)}
          >
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>
              Selected row IDs: {selectedRowIds.join(', ')}
            </AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    }
  }, [rowSelection]);

  // Sync pagination changes to URL
  useEffect(() => {
    updateParams({ page: pagination.pageIndex > 0 ? String(pagination.pageIndex) : null });
  }, [pagination.pageIndex]);

  // Sync sorting changes to URL
  useEffect(() => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      updateParams({
        sort: id,
        desc: desc ? null : 'false', // only store desc=false since true is default
      });
    }
  }, [sorting]);

  // Sync URL params back to local state when navigating back
  useEffect(() => {
    setInputValue(searchQuery);
    setPagination((prev) => prev.pageIndex !== pageIndex ? { ...prev, pageIndex } : prev);
    const urlSort = [{ id: sortId, desc: sortDesc }];
    setSorting((prev) =>
      prev[0]?.id !== sortId || prev[0]?.desc !== sortDesc ? urlSort : prev
    );
  }, [searchParams]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: 10, // Fixed 10 items per page
      },
      sorting,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  // Search input handlers
  const handleClearInput = () => {
    setInputValue('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <div>
      <Card>
        <CardHeader className="py-3 flex-nowrap">
          {/* <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="m-0 p-0 w-full"
          >
            <TabsList className="h-auto p-0 bg-transparent border-b-0 border-border rounded-none -ms-[3px] w-full">
              <div className="flex items-center gap-1 min-w-max">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "relative text-foreground px-2 hover:text-primary data-[state=active]:text-primary data-[state=active]:shadow-none", 
                      activeTab === tab.id ? 'font-medium' : 'font-normal')
                    }
                  >
                    <div className="flex items-center gap-2">
                      {tab.label}
                      <Badge
                        size="sm"
                        variant={activeTab === tab.id ? 'primary' : 'outline'}
                        appearance="outline"
                        className={cn("rounded-full", activeTab === tab.id ? '' : 'bg-muted/60')}
                      >
                        {tab.badge}
                      </Badge>
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-primary -mb-[14px]" />
                    )}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
          </Tabs> */}
          <CardToolbar className="flex items-center gap-2">
            {/* Search */}
            <div className="w-full max-w-[200px]">
              <InputWrapper>
                <Search />
                <Input
                  placeholder="Search..."
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <Button
                  onClick={handleClearInput}
                  variant="dim"
                  className="-me-4"
                  disabled={inputValue === ''}
                >
                  {inputValue !== '' && <X size={16} />}
                </Button>
              </InputWrapper>
            </div>

            {/* Filter */}
            <DataGridColumnVisibility
              table={table}
              trigger={
                <Button variant="outline">
                  <Filter className="size-3.5" />
                  Filters
                </Button>
              }
            />
          </CardToolbar>
        </CardHeader>

        {/* Tab Contents */}

      
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
                <CardTable>
                  <ScrollArea>
                    <DataGridTable />
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardTable>
                <CardFooter>
                  <DataGridPagination />
                </CardFooter>
              </DataGrid>


      </Card>
    </div>
  );
}
