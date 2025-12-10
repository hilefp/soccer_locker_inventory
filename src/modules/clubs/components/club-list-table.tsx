/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useMemo, useState } from 'react';
import { ClubFormSheet } from './club-form-sheet';
import { ClubDetailsSheet } from './club-details-sheet';
import { useDeleteClub } from '../hooks/use-clubs';
import { Club } from '../types';
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
import { Eye, Search, SquarePen, Trash, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClubListTableProps {
  clubs?: Club[];
  isLoading?: boolean;
  error?: string | null;
}

export function ClubListTable({
  clubs = [],
  isLoading = false,
  error = null,
}: ClubListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);

  // React Query hook for delete mutation
  const deleteMutation = useDeleteClub();

  // Modal state
  const [isClubDetailsOpen, setIsClubDetailsOpen] = useState(false);
  const [isEditClubOpen, setIsEditClubOpen] = useState(false);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string | undefined>(
    undefined,
  );

  const handleClubClick = useCallback((club: Club) => {
    setSelectedClubId(club.id);
    setIsClubDetailsOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<Club>[]>(
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
        id: 'clubInfo',
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Club" column={column} />
        ),
        cell: ({ row }) => {
          const club = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shrink-0">
                {club.logoUrl ? (
                  <img
                    src={club.logoUrl}
                    className="h-[30px] w-full object-contain"
                    alt={club.name}
                  />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">
                    {club.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Link
                  to="#"
                  onClick={() => handleClubClick(club)}
                  className="text-sm font-medium tracking-[-1%] cursor-pointer hover:text-primary"
                >
                  {club.name}
                </Link>
                {club.city && club.country && (
                  <span className="text-xs text-muted-foreground">
                    {club.city}, {club.country}
                  </span>
                )}
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 200,
      },
      {
        id: 'description',
        accessorFn: (row) => row.description || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        cell: (info) => {
          const description = info.getValue() as string;
          return (
            <span className="text-sm line-clamp-2">
              {description.length > 60
                ? `${description.substring(0, 60)}...`
                : description}
            </span>
          );
        },
        enableSorting: false,
        size: 200,
      },
      {
        id: 'location',
        header: ({ column }) => (
          <DataGridColumnHeader title="Location" column={column} />
        ),
        cell: ({ row }) => {
          const club = row.original;
          const location = [club.city, club.state, club.country]
            .filter(Boolean)
            .join(', ');
          return (
            <span className="text-sm">
              {location || '-'}
            </span>
          );
        },
        enableSorting: false,
        size: 150,
      },
      {
        id: 'contact',
        header: () => 'Contact',
        cell: ({ row }) => {
          const club = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              {club.email && (
                <span className="text-xs text-muted-foreground">
                  {club.email}
                </span>
              )}
              {club.phone && (
                <span className="text-xs text-muted-foreground">
                  {club.phone}
                </span>
              )}
              {!club.email && !club.phone && (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 150,
      },
      {
        id: 'status',
        accessorFn: (row) => row.isActive,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          const variant: keyof BadgeProps['variant'] = isActive
            ? 'success'
            : 'secondary';
          return (
            <Badge variant={variant} appearance="light">
              {isActive ? 'Active' : 'Inactive'}
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
          const club = row.original;

          const handleView = () => {
            setSelectedClubId(club.id);
            setIsClubDetailsOpen(true);
          };

          const handleEdit = () => {
            setSelectedClubId(club.id);
            setIsEditClubOpen(true);
          };

          const handleDelete = async () => {
            if (!club.id) return;

            if (
              !confirm(
                `Are you sure you want to delete "${club.name}"? This action cannot be undone.`,
              )
            ) {
              return;
            }

            try {
              await deleteMutation.mutateAsync(club.id);
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
                onClick={handleView}
                title="View club"
              >
                <Eye />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleEdit}
                title="Edit club"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDelete}
                title="Delete club"
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [handleClubClick, deleteMutation.mutateAsync],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return clubs;
    }
    const query = searchQuery.toLowerCase();
    return clubs.filter(
      (club) =>
        club?.name?.toLowerCase().includes(query) ||
        club?.description?.toLowerCase().includes(query) ||
        club?.city?.toLowerCase().includes(query) ||
        club?.country?.toLowerCase().includes(query) ||
        club?.email?.toLowerCase().includes(query),
    );
  }, [clubs, searchQuery]);

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
                  placeholder="Search clubs..."
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
                <span className="text-muted-foreground">Loading clubs...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-destructive">Error loading clubs</span>
                <span className="text-sm text-muted-foreground">{error}</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">
                  {searchQuery
                    ? 'No clubs found matching your search'
                    : 'No clubs yet'}
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

      {/* Club Details Sheet */}
      <ClubDetailsSheet
        open={isClubDetailsOpen}
        onOpenChange={setIsClubDetailsOpen}
        clubId={selectedClubId}
      />

      {/* Edit Club Sheet */}
      <ClubFormSheet
        mode="edit"
        open={isEditClubOpen}
        onOpenChange={setIsEditClubOpen}
        clubId={selectedClubId}
      />

      {/* Create Club Sheet */}
      <ClubFormSheet
        mode="new"
        open={isCreateClubOpen}
        onOpenChange={setIsCreateClubOpen}
      />
    </>
  );
}
