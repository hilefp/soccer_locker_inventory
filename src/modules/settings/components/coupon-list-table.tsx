'use client';

import { useCallback, useMemo, useState } from 'react';
import { CouponFormSheet } from './coupon-form-sheet';
import { useDeleteCoupon } from '../hooks/use-coupons';
import { Coupon } from '../types';
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
import { Search, SquarePen, Trash, X } from 'lucide-react';

interface CouponListTableProps {
  coupons?: Coupon[];
  isLoading?: boolean;
  error?: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
}

export function CouponListTable({
  coupons = [],
  isLoading = false,
  error = null,
}: CouponListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'code', desc: false },
  ]);

  const deleteMutation = useDeleteCoupon();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | undefined>(
    undefined,
  );

  const handleEdit = useCallback((coupon: Coupon) => {
    setSelectedCouponId(coupon.id);
    setIsEditOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<Coupon>[]>(
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
      },
      {
        id: 'code',
        accessorFn: (row) => row.code,
        header: ({ column }) => (
          <DataGridColumnHeader title="Code" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium font-mono">
            {row.original.code}
          </span>
        ),
        enableSorting: true,
        size: 150,
      },
      {
        id: 'description',
        accessorFn: (row) => row.description || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm">{info.getValue() as string}</span>
        ),
        enableSorting: true,
        size: 200,
      },
      {
        id: 'type',
        accessorFn: (row) => row.type,
        header: ({ column }) => (
          <DataGridColumnHeader title="Type" column={column} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" appearance="light">
            {row.original.type.replace('_', ' ')}
          </Badge>
        ),
        enableSorting: true,
        size: 130,
      },
      {
        id: 'status',
        accessorFn: (row) => row.isActive,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => (
          <Badge
            variant={row.original.isActive ? 'success' : 'secondary'}
            appearance="light"
          >
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
        enableSorting: true,
        size: 90,
      },
      {
        id: 'uses',
        accessorFn: (row) => row.currentUses,
        header: ({ column }) => (
          <DataGridColumnHeader title="Uses" column={column} />
        ),
        cell: ({ row }) => {
          const { currentUses, maxUses } = row.original;
          return (
            <span className="text-sm">
              {currentUses}{maxUses != null ? ` / ${maxUses}` : ''}
            </span>
          );
        },
        enableSorting: true,
        size: 80,
      },
      {
        id: 'validFrom',
        accessorFn: (row) => row.validFrom,
        header: ({ column }) => (
          <DataGridColumnHeader title="Valid From" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {formatDate(row.original.validFrom)}
          </span>
        ),
        enableSorting: true,
        size: 110,
      },
      {
        id: 'validTo',
        accessorFn: (row) => row.validTo,
        header: ({ column }) => (
          <DataGridColumnHeader title="Valid To" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {formatDate(row.original.validTo)}
          </span>
        ),
        enableSorting: true,
        size: 110,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const coupon = row.original;

          const handleDelete = async () => {
            if (!coupon.id) return;
            if (!confirm('Are you sure you want to delete this coupon?')) return;

            try {
              await deleteMutation.mutateAsync(coupon.id);
            } catch (error) {
              console.error('Delete error:', error);
            }
          };

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={() => handleEdit(coupon)}
                title="Edit coupon"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDelete}
                title="Delete coupon"
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [handleEdit, deleteMutation.mutateAsync],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) return coupons;
    const query = searchQuery.toLowerCase();
    return coupons.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(query) ||
        coupon.description?.toLowerCase().includes(query),
    );
  }, [coupons, searchQuery]);

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
              <InputWrapper className="w-full lg:w-[250px]">
                <Search />
                <Input
                  placeholder="Search coupons..."
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
                <span className="text-muted-foreground">
                  Loading coupons...
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-destructive">Error loading coupons</span>
                <span className="text-sm text-muted-foreground">{error}</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">
                  {searchQuery
                    ? 'No coupons found matching your search'
                    : 'No coupons yet'}
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

      <CouponFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        couponId={selectedCouponId}
      />
    </>
  );
}
