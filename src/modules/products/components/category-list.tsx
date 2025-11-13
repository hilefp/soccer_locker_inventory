/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CategoryFormSheet } from '@/modules/products/components/category-form-sheet';
import { useDeleteProductCategory } from '@/modules/products/hooks/use-product-categories';
import { ProductCategory } from '@/modules/products/types/product-category.type';
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
import { DataGridPagination } from '@/shared/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/shared/components/ui/data-grid-table';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import { toAbsoluteUrl } from '@/shared/lib/helpers';
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
import { Eye, Info, Search, SquarePen, Trash, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CategoryDetailsEditSheet } from '../../../pages/components/category-details-edit-sheet';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export interface IData {
  productsQty: string;
  id: string;
  productInfo: {
    image: string;
    title: string;
    label: string;
  };
  status: {
    label: string;
    variant: string;
  };
  created?: string;
  updated?: string;
}

interface CategoryListProps {
  displaySheet?: 'categoryDetails' | 'createCategory' | 'editCategory';
  categories?: ProductCategory[];
  isLoading?: boolean;
  error?: string | null;
}

// Helper function to convert ProductCategory to IData format
const convertCategoryToIData = (category: ProductCategory): IData => {
  return {
    id: category.id || '',
    productInfo: {
      image: category.imageUrl || 'running-shoes.svg',
      title: category.name,
      label: category.slug,
    },
    productsQty: '0',
    status: {
      label: category.isActive ? 'Active' : 'Inactive',
      variant: category.isActive ? 'success' : 'destructive',
    },
    created: category.createdAt,
    updated: category.updatedAt,
  };
};

export function CategoryListTable({
  displaySheet,
  categories,
  isLoading = false,
  error = null,
}: CategoryListProps) {
  const data = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.map(convertCategoryToIData);
  }, [categories]);

  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: false },
  ]);
  const [featuredState, setFeaturedState] = useState<Record<string, boolean>>(
    {},
  );

  // React Query hook for delete mutation
  const deleteMutation = useDeleteProductCategory();

  // Modal state
  const [isCategoryDetailsEditOpen, setIsCategoryDetailsEditOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IData | undefined>(
    undefined,
  );

  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (!displaySheet) {
      return;
    }

    switch (displaySheet) {
      case 'categoryDetails':
        setIsCategoryDetailsEditOpen(true);
        break;
      case 'createCategory':
        setIsCreateCategoryOpen(true);
        break;
      case 'editCategory':
        setIsEditCategoryOpen(true);
        break;
    }
  }, [displaySheet]);


  const handleFeaturedChange = useCallback((id: string, checked: boolean) => {
    setFeaturedState((prev) => ({ ...prev, [id]: checked }));
    if (checked) {
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
            <AlertTitle>Category marked as featured successfully.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    } else {
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
            <AlertTitle>Category removed from featured status.</AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    }
  }, []);
  const handleCategoryClick = useCallback((category: IData) => {
    setSelectedCategory(category);
    setIsCategoryDetailsEditOpen(true);
  }, []);

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
        size: 23,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'productInfo',
        accessorFn: (row) => row.productInfo,
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        cell: (info) => {
          const productInfo = info.row.getValue(
            'productInfo',
          ) as IData['productInfo'];
          return (
            <div className="flex items-center gap-2.5">
              <Card className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shadow-none shrink-0">
                <img
                  src={toAbsoluteUrl(
                    `/media/store/client/icons/light/${productInfo.image}`,
                  )}
                  className="cursor-pointer h-[30px] dark:hidden"
                  alt="image"
                />
                <img
                  src={toAbsoluteUrl(
                    `/media/store/client/icons/dark/${productInfo.image}`,
                  )}
                  className="cursor-pointer h-[30px] light:hidden"
                  alt="image"
                />
              </Card>
              <div className="flex flex-col gap-1">
                <Link
                  to="#"
                  onClick={() => handleCategoryClick(info.row.original)}
                  className="text-sm font-medium tracking-[-1%] cursor-pointer hover:text-primary"
                >
                  {productInfo.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  Category ID:{' '}
                  <span className="text-xs font-medium text-foreground">
                    {productInfo.label}
                  </span>
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 150,
      },
      {
        id: 'productsQty',
        accessorFn: (row) => row.productsQty,
        header: ({ column }) => (
          <DataGridColumnHeader title="Products QTY" column={column} />
        ),
        cell: (info) => info.getValue() as string,
        enableSorting: true,
        size: 65,
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
          const categoryId = row.getValue('id') as string;
          const categoryTitle = row.original.productInfo.title;

          const handleView = () => {
            setSelectedCategory(row.original);
            setIsCategoryDetailsEditOpen(true);
          };

          const handleEdit = () => {
            setSelectedCategory(row.original);
            setSelectedCategoryId(categoryId);
            setIsEditCategoryOpen(true);
          };

          const handleDelete = async () => {
            if (!categoryId) return;

            try {
              await deleteMutation.mutateAsync(categoryId);
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
                onClick={handleView}
                title="View category"
              >
                <Eye />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleEdit}
                title="Edit category"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDelete}
                title="Delete category"
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    // FIXED: Include only stable callbacks and mutation to prevent stale closures
    // handleFeaturedChange and handleCategoryClick are memoized with useCallback
    // deleteMutation.mutateAsync is stable from React Query
    [handleFeaturedChange, handleCategoryClick, deleteMutation.mutateAsync],
  );

  // OPTIMIZED: Return data directly when no search query to avoid unnecessary array copying
  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return data;
    }
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      item.productInfo.title.toLowerCase().includes(query),
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
      {/* Category List Table */}
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
                <span className="text-muted-foreground">
                  Loading categories...
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-destructive">
                  Error loading categories
                </span>
                <span className="text-sm text-muted-foreground">{error}</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">
                  {searchQuery
                    ? 'No categories found matching your search'
                    : 'No categories yet'}
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

      {/* Category Details Edit Sheet */}
      <CategoryDetailsEditSheet
        open={isCategoryDetailsEditOpen}
        onOpenChange={setIsCategoryDetailsEditOpen}
      />

      {/* Edit Category Sheet */}
      <CategoryFormSheet
        mode="edit"
        open={isEditCategoryOpen}
        onOpenChange={setIsEditCategoryOpen}
        categoryId={selectedCategoryId}
      />

      {/* Create Category Sheet */}
      <CategoryFormSheet
        mode="new"
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
      />
    </>
  );
}
