import { useMemo, useState } from 'react';
import { Permission } from '../types';
import { Badge } from '@/shared/components/ui/badge';
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
import { DataGridTable } from '@/shared/components/ui/data-grid-table';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Search, X } from 'lucide-react';

interface PermissionsListTableProps {
  permissions?: Permission[];
  isLoading?: boolean;
  error?: string | null;
}

const getActionVariant = (
  action: string,
): 'primary' | 'destructive' | 'secondary' | 'success' | 'warning' | 'info' => {
  switch (action) {
    case 'read':
      return 'info';
    case 'write':
      return 'success';
    case 'delete':
      return 'destructive';
    case 'manage':
      return 'warning';
    default:
      return 'secondary';
  }
};

export function PermissionsListTable({
  permissions = [],
  isLoading = false,
  error = null,
}: PermissionsListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'section', desc: false },
  ]);

  const columns = useMemo<ColumnDef<Permission>[]>(
    () => [
      {
        id: 'section',
        accessorFn: (row) => row.section,
        header: ({ column }) => (
          <DataGridColumnHeader title="Section" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm font-medium capitalize">
            {(info.getValue() as string).replace(/_/g, ' ')}
          </span>
        ),
        enableSorting: true,
        size: 150,
      },
      {
        id: 'action',
        accessorFn: (row) => row.action,
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        cell: ({ row }) => {
          const action = row.original.action;
          return (
            <Badge variant={getActionVariant(action)} appearance="light">
              {action}
            </Badge>
          );
        },
        enableSorting: true,
        size: 100,
      },
      {
        id: 'description',
        accessorFn: (row) => row.description || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() as string}
          </span>
        ),
        enableSorting: false,
        size: 300,
      },
      {
        id: 'status',
        accessorFn: (row) => row.isActive,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <Badge
              variant={isActive ? 'success' : 'secondary'}
              appearance="light"
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
        enableSorting: true,
        size: 80,
      },
    ],
    [],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) return permissions;
    const query = searchQuery.toLowerCase();
    return permissions.filter(
      (p) =>
        p.section.toLowerCase().includes(query) ||
        p.action.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query),
    );
  }, [permissions, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={filteredData.length}
      tableLayout={{
        columnsPinnable: false,
        columnsMovable: false,
        columnsVisibility: false,
        cellBorder: true,
      }}
    >
      <Card>
        <CardHeader className="py-3.5">
          <CardToolbar className="flex items-center gap-2">
            <InputWrapper className="w-full lg:w-[250px]">
              <Search />
              <Input
                placeholder="Search permissions..."
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
                  <X />
                </Button>
              )}
            </InputWrapper>
          </CardToolbar>
        </CardHeader>
        <CardTable>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-muted-foreground">Loading permissions...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-destructive">Error loading permissions</span>
              <span className="text-sm text-muted-foreground">{error}</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-muted-foreground">
                {searchQuery
                  ? 'No permissions found matching your search'
                  : 'No permissions yet'}
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
