'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  Star,
  Trash,
  X,
  Layers,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/shared/lib/helpers';
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
import { ProductFormSheet } from './product-form-sheet';
import { ProductDetailsAnalyticsSheet } from './product-details-analytics-sheet';
import { ManageVariantsSheet } from '../../../pages/components/manage-variants';
import { cn } from '@/shared/lib/utils';
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
  onRowClick?: (productId: string) => void;
  displaySheet?: "productDetails" | "createProduct" | "editProduct" | "manageVariants";
}

// Helper function to convert Product to IData format
const convertProductToIData = (product: Product): IData => {
  // Calculate price from variants if available
  let priceDisplay = 'N/A';
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants.map(v => v.price).filter(p => p !== undefined);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        priceDisplay = `$${minPrice.toFixed(2)}`;
      } else {
        priceDisplay = `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
      }
    }
  } else if (product.minPrice) {
    priceDisplay = `$${product.minPrice.toFixed(2)}`;
  }

  return {
    id: product.id || '',
    productInfo: {
      image: product.imageUrl || '', // Empty string instead of hardcoded fallback
      title: product.name,
      label: product.slug,
      tooltip: product.model || product.name,
    },
    category: product.category?.name || 'Uncategorized',
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
  isLoading = false,
  error = null,
  onRowClick,
  displaySheet,
}: ProductListProps) {
  // CRITICAL FIX: Memoize data conversion to prevent infinite re-renders
  const data = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.map(convertProductToIData);
  }, [products]);

  // React Query hook for delete mutation
  const deleteMutation = useDeleteProduct();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Search input state
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created', desc: true },
  ]);
  const [selectedLastMoved] = useState<string[]>([]);

  // Modal state
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isManageVariantsOpen, setIsManageVariantsOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

  // Auto-open sheet based on displaySheet prop
  useEffect(() => {
    if (displaySheet) {
      switch (displaySheet) {
        case 'productDetails':
          setIsProductDetailsOpen(true);
          break;
        case 'createProduct':
          setIsCreateProductOpen(true);
          break;
        case 'editProduct':
          setIsEditProductOpen(true);
          break;
        case 'manageVariants':
          setIsManageVariantsOpen(true);
          break;
      }
    }
  }, [displaySheet]);

  const handleEditProduct = (product: IData) => {
    console.log('Editing product:', product);
    setSelectedProductId(product.id);
    setIsEditProductOpen(true);
  };

  const handleManageVariants = (product: IData) => {
    console.log('Managing variants for product:', product);
    setSelectedProductId(product.id);
    setIsManageVariantsOpen(true);
  };

  const handleViewDetails = (product: IData) => {
    console.log('Viewing details for product:', product);
    setSelectedProductId(product.id);
    setIsProductDetailsOpen(true);
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
                          onClick={() => setIsProductDetailsOpen(true)}
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
                    onClick={() => setIsProductDetailsOpen(true)}
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
          const variant = status.variant as keyof BadgeProps['variant'];
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
        id: 'rating',
        accessorFn: () => {},
        header: ({ column }) => (
          <DataGridColumnHeader title="Rating" column={column} />
        ),
        cell: () => {
          return (
            <Badge
              size="sm"
              variant="warning"
              appearance="outline"
              className="rounded-full"
            >
              <Star className="text-[#FEC524]" fill="#FEC524" />
              5.0
            </Badge>
          );
        },
        enableSorting: true,
        size: 85,
        meta: {
          cellClassName: 'text-center',
        },
      },
      {
        id: 'created',
        accessorFn: (row) => row.created,
        header: ({ column }) => (
          <DataGridColumnHeader title="Created" column={column} />
        ),
        cell: (info) => {
          return info.row.original.created;
        },
        enableSorting: true,
        size: 120,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'updated',
        accessorFn: (row) => row.updated,
        header: ({ column }) => (
          <DataGridColumnHeader title="Updated" column={column} />
        ),
        cell: (info) => {
          return info.row.original.updated;
        },
        enableSorting: true,
        size: 120,
        meta: {
          cellClassName: '',
        },
      },
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
                  <DropdownMenuItem onClick={() => handleManageVariants(row.original)}>
                    <Layers className="size-4" />
                    Manage Variants
                  </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
                      <Info className="size-4" />
                      View Details
                    </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive">
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

    // Apply search filter - only search in product title
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.productInfo.title.toLowerCase().includes(query),
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

  // Reset pagination when filters change
  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, selectedLastMoved, activeTab]);

  // Reset to first page when filters change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [activeTab, searchQuery, selectedLastMoved]);

  // Sync inputValue with searchQuery when searchQuery changes externally
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

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

 // const tabs = [];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Reset to first page when changing tabs
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

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
                onRowClick={
                  onRowClick ? (row: IData) => onRowClick(row.id) : undefined
                }
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

      {/* Product Details Modal */}
      <ProductDetailsAnalyticsSheet
        open={isProductDetailsOpen}
        onOpenChange={setIsProductDetailsOpen}
        productId={selectedProductId}
      />

      {/* Edit Product Modal */}
      <ProductFormSheet
        mode="edit"
        open={isEditProductOpen}
        onOpenChange={setIsEditProductOpen}
        productId={selectedProductId}
      />

      {/* Create Product Modal */}
      <ProductFormSheet
        mode="new"  
        open={isCreateProductOpen}
        onOpenChange={setIsCreateProductOpen}
      />

      {/* Manage Variants Modal */}
      <ManageVariantsSheet
        open={isManageVariantsOpen}
        onOpenChange={setIsManageVariantsOpen}
      />
    </div>
  );
}
