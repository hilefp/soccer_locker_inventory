import { useMemo, useState } from 'react';
import { Role } from '../types';
import { useDeleteRole } from '../hooks/use-roles';
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
import { Eye, Search, SquarePen, Trash, X, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface RolesListTableProps {
  roles?: Role[];
  isLoading?: boolean;
  error?: string | null;
  onViewRole?: (role: Role) => void;
  onEditRole?: (role: Role) => void;
}

export function RolesListTable({
  roles = [],
  isLoading = false,
  error = null,
  onViewRole,
  onEditRole,
}: RolesListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);

  const deleteMutation = useDeleteRole();

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Role" column={column} />
        ),
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-full bg-accent/50 h-[36px] w-[36px] shrink-0">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{role.name}</span>
                {role.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {role.description}
                  </span>
                )}
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 250,
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
        size: 100,
      },
      {
        id: 'createdAt',
        accessorFn: (row) => row.createdAt,
        header: ({ column }) => (
          <DataGridColumnHeader title="Created" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
        enableSorting: true,
        size: 120,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const role = row.original;

          const handleView = () => onViewRole?.(role);
          const handleEdit = () => onEditRole?.(role);
          const handleDelete = async () => {
            if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;
            try {
              await deleteMutation.mutateAsync(role.id);
              toast.success('Role deleted successfully');
            } catch {
              toast.error('Failed to delete role');
            }
          };

          return (
            <div className="flex items-center gap-1">
              <Button variant="dim" mode="icon" size="sm" onClick={handleView} title="View role">
                <Eye />
              </Button>
              <Button variant="dim" mode="icon" size="sm" onClick={handleEdit} title="Edit role">
                <SquarePen />
              </Button>
              <Button variant="dim" mode="icon" size="sm" onClick={handleDelete} title="Delete role">
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [onViewRole, onEditRole, deleteMutation],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) return roles;
    const query = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query),
    );
  }, [roles, searchQuery]);

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
                placeholder="Search roles..."
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
              <span className="text-muted-foreground">Loading roles...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-destructive">Error loading roles</span>
              <span className="text-sm text-muted-foreground">{error}</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-muted-foreground">
                {searchQuery ? 'No roles found matching your search' : 'No roles yet'}
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
