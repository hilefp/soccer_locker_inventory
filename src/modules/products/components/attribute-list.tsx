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
import { Eye, Info, Search, SquarePen, Trash, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
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
import { Checkbox } from '@/shared/components/ui/checkbox';
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
import { AttributeFormSheet } from '@/modules/products/components/attribute-form-sheet';
import { ProductAttribute } from '@/modules/products/types/product-attribute.type';
import { useDeleteProductAttribute } from '@/modules/products/hooks/use-product-attributes';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export interface IData {
  id: string;
  attributeInfo: {
    name: string;
    type: string;
  };
  description: string;
  valuesCount: number;
  values: string[];
  isRequired: boolean;
  created?: string;
  updated?: string;
}

interface AttributeListProps {
  attributes?: ProductAttribute[];
  isLoading?: boolean;
  error?: string | null;
}

// Helper function to convert ProductAttribute to IData format
const convertAttributeToIData = (attribute: ProductAttribute): IData => {
  return {
    id: attribute.id || '',
    attributeInfo: {
      name: attribute.name,
      type: attribute.type,
    },
    description: attribute.description || '',
    valuesCount: attribute.values?.length || 0,
    values: attribute.values || [],
    isRequired: attribute.isRequired,
    created: attribute.createdAt?.toString(),
    updated: attribute.updatedAt?.toString(),
  };
};

export function AttributeListTable({
  attributes,
  isLoading = false,
  error = null,
}: AttributeListProps) {
  // Memoize data conversion to prevent infinite re-renders
  const data = useMemo(() => {
    if (!attributes || attributes.length === 0) return [];
    return attributes.map(convertAttributeToIData);
  }, [attributes]);

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
  const deleteMutation = useDeleteProductAttribute();

  // Sheet state
  const [isEditAttributeOpen, setIsEditAttributeOpen] = useState(false);
  const [isCreateAttributeOpen, setIsCreateAttributeOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | undefined>(undefined);

  const handleRequiredChange = useCallback((id: string, checked: boolean) => {
    // This would typically update the attribute via API
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
            Attribute marked as {checked ? 'required' : 'optional'} successfully.
          </AlertTitle>
        </Alert>
      ),
      {
        duration: 5000,
      },
    );
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
        id: 'attributeInfo',
        accessorFn: (row) => row.attributeInfo,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Attribute"
            column={column}
          />
        ),
        cell: (info) => {
          const attributeInfo = info.row.getValue(
            'attributeInfo',
          ) as IData['attributeInfo'];
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium tracking-[-1%]">
                {attributeInfo.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Type: {' '}
                <span className="text-xs font-medium text-foreground">
                  {attributeInfo.type}
                </span>
              </span>
            </div>
          );
        },
        enableSorting: true,
        size: 150,
      },
      {
        id: 'description',
        accessorFn: (row) => row.description,
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        cell: (info) => {
          const description = info.getValue() as string;
          return (
            <span className="text-sm text-muted-foreground line-clamp-2">
              {description || 'No description'}
            </span>
          );
        },
        enableSorting: false,
        size: 200,
      },
      {
        id: 'valuesCount',
        accessorFn: (row) => row.valuesCount,
        header: ({ column }) => (
          <DataGridColumnHeader title="Values" column={column} />
        ),
        cell: (info) => {
          const count = info.getValue() as number;
          const values = info.row.original.values;
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{count} value{count !== 1 ? 's' : ''}</span>
              {values.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {values.slice(0, 3).map((value, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {value}
                    </Badge>
                  ))}
                  {values.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{values.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        },
        enableSorting: true,
        size: 180,
      },
      {
        id: 'isRequired',
        accessorFn: (row) => row.isRequired,
        header: ({ column }) => (
          <DataGridColumnHeader title="Required" column={column} />
        ),
        cell: (info) => {
          const isRequired = info.getValue() as boolean;
          return (
            <Badge variant={isRequired ? 'success' : 'secondary'} appearance="light">
              {isRequired ? 'Required' : 'Optional'}
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
          const attributeId = row.getValue('id') as string;

          const handleEdit = () => {
            setSelectedAttributeId(attributeId);
            setIsEditAttributeOpen(true);
          };

          const handleDelete = async () => {
            if (!attributeId) return;

            try {
              await deleteMutation.mutateAsync(attributeId);
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
                title="Edit attribute"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDelete}
                title="Delete attribute"
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [deleteMutation.mutateAsync],
  );

  // Return data directly when no search query to avoid unnecessary array copying
  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return data;
    }
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      item.attributeInfo.name.toLowerCase().includes(query) ||
      item.attributeInfo.type.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
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
      {/* Attribute List Table */}
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
              <Search/>
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
                  {searchQuery && <X/>}
                </Button>
              )}
            </InputWrapper>
          </CardToolbar>
        </CardHeader>
        <CardTable>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-muted-foreground">Loading attributes...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-destructive">Error loading attributes</span>
              <span className="text-sm text-muted-foreground">{error}</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-muted-foreground">
                {searchQuery ? 'No attributes found matching your search' : 'No attributes yet'}
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

      {/* Edit Attribute Sheet */}
      <AttributeFormSheet
        mode="edit"
        open={isEditAttributeOpen}
        onOpenChange={setIsEditAttributeOpen}
        attributeId={selectedAttributeId}
      />

      {/* Create Attribute Sheet */}
      <AttributeFormSheet
        mode="new"
        open={isCreateAttributeOpen}
        onOpenChange={setIsCreateAttributeOpen}
      />
    </>
  );
}
