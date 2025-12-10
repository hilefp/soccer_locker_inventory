/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useMemo, useState } from 'react';
import { Warehouse, WarehouseType } from '../types/warehouse.types';
import {
  useActivateWarehouse,
  useDeactivateWarehouse,
  useDeleteWarehouse,
} from '../hooks/use-warehouses';
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
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Eye, Search, SquarePen, Trash, X } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';

export interface IWarehouseData {
  id: string;
  warehouseInfo: {
    code: string;
    name: string;
    type: WarehouseType;
  };
  location: string;
  capacity?: number;
  status: {
    label: string;
    variant: string;
  };
  phone?: string;
  email?: string;
  created?: string;
  updated?: string;
}

interface WarehouseListTableProps {
  warehouses?: Warehouse[];
  isLoading?: boolean;
  error?: string | null;
  onEdit?: (warehouse: Warehouse) => void;
  onViewStatistics?: (warehouse: Warehouse) => void;
}

// Helper function to convert Warehouse to IWarehouseData format
const convertWarehouseToIData = (warehouse: Warehouse): IWarehouseData => {
  const locationParts = [warehouse.city, warehouse.state, warehouse.country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(', ') : '-';

  return {
    id: warehouse.id,
    warehouseInfo: {
      code: warehouse.code,
      name: warehouse.name,
      type: warehouse.warehouseType,
    },
    location,
    capacity: warehouse.capacity,
    status: {
      label: warehouse.isActive ? 'Active' : 'Inactive',
      variant: warehouse.isActive ? 'success' : 'destructive',
    },
    phone: warehouse.phone,
    email: warehouse.email,
    created: warehouse.createdAt,
    updated: warehouse.updatedAt,
  };
};

// Helper to get warehouse type badge color
const getWarehouseTypeBadgeColor = (type: WarehouseType): string => {
  const colorMap: Record<WarehouseType, string> = {
    [WarehouseType.MAIN]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [WarehouseType.SECONDARY]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [WarehouseType.STORE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [WarehouseType.VIRTUAL]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [WarehouseType.PRODUCTION]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    [WarehouseType.TRANSIT]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return colorMap[type] || '';
};

export function WarehouseListTable({
  warehouses,
  isLoading = false,
  error = null,
  onEdit,
  onViewStatistics,
}: WarehouseListTableProps) {
  const data = useMemo(() => {
    if (!warehouses || warehouses.length === 0) return [];
    return warehouses.map(convertWarehouseToIData);
  }, [warehouses]);

  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: false },
  ]);

  // React Query hooks for mutations
  const activateMutation = useActivateWarehouse();
  const deactivateMutation = useDeactivateWarehouse();
  const deleteMutation = useDeleteWarehouse();

  const handleActivate = useCallback(
    async (warehouseId: string) => {
      try {
        await activateMutation.mutateAsync(warehouseId);
      } catch (error) {
        console.error('Activate error:', error);
      }
    },
    [activateMutation]
  );

  const handleDeactivate = useCallback(
    async (warehouseId: string) => {
      try {
        await deactivateMutation.mutateAsync(warehouseId);
      } catch (error) {
        console.error('Deactivate error:', error);
      }
    },
    [deactivateMutation]
  );

  const handleDelete = useCallback(
    async (warehouseId: string) => {
      try {
        await deleteMutation.mutateAsync(warehouseId);
      } catch (error) {
        console.error('Delete error:', error);
      }
    },
    [deleteMutation]
  );

  const columns = useMemo<ColumnDef<IWarehouseData>[]>(
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
        id: 'warehouseInfo',
        accessorFn: (row) => row.warehouseInfo,
        header: ({ column }) => (
          <DataGridColumnHeader title="Warehouse" column={column} />
        ),
        cell: (info) => {
          const warehouseInfo = info.row.getValue(
            'warehouseInfo',
          ) as IWarehouseData['warehouseInfo'];

          return (
            <div className="flex flex-col gap-1">
              <Link
                to={`/inventory/warehouses/${info.row.getValue('id')}`}
                className="text-sm font-medium tracking-[-1%] cursor-pointer hover:text-primary"
              >
                {warehouseInfo.name}
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Code:{' '}
                  <span className="text-xs font-medium text-foreground">
                    {warehouseInfo.code}
                  </span>
                </span>
                <Badge variant="secondary" className={getWarehouseTypeBadgeColor(warehouseInfo.type)}>
                  {warehouseInfo.type}
                </Badge>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 180,
      },
      {
        id: 'location',
        accessorFn: (row) => row.location,
        header: ({ column }) => (
          <DataGridColumnHeader title="Location" column={column} />
        ),
        cell: (info) => info.getValue() as string,
        enableSorting: true,
        size: 150,
      },
      {
        id: 'capacity',
        accessorFn: (row) => row.capacity,
        header: ({ column }) => (
          <DataGridColumnHeader title="Capacity" column={column} />
        ),
        cell: (info) => {
          const capacity = info.getValue() as number | undefined;
          return capacity ? capacity.toLocaleString() : '-';
        },
        enableSorting: true,
        size: 80,
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
          const warehouseId = row.getValue('id') as string;
          const warehouse = warehouses?.find((w) => w.id === warehouseId);
          const isActive = row.original.status.label === 'Active';

          if (!warehouse) return null;

          const handleView = () => {
            onViewStatistics?.(warehouse);
          };

          const handleEditClick = () => {
            onEdit?.(warehouse);
          };

          const handleToggleStatus = () => {
            if (isActive) {
              handleDeactivate(warehouseId);
            } else {
              handleActivate(warehouseId);
            }
          };

          const handleDeleteClick = () => {
            handleDelete(warehouseId);
          };

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleView}
                title="View statistics"
              >
                <Eye />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleEditClick}
                title="Edit warehouse"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDeleteClick}
                title="Delete warehouse"
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [warehouses, onEdit, onViewStatistics, handleActivate, handleDeactivate, handleDelete]
  );

  // OPTIMIZED: Return data directly when no search query to avoid unnecessary array copying
  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return data;
    }
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      item.warehouseInfo.name.toLowerCase().includes(query) ||
      item.warehouseInfo.code.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
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
                Loading warehouses...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-destructive">
                Error loading warehouses
              </span>
              <span className="text-sm text-muted-foreground">{error}</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-muted-foreground">
                {searchQuery
                  ? 'No warehouses found matching your search'
                  : 'No warehouses yet'}
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
  );
}
