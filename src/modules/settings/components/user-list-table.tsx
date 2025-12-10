/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useMemo, useState } from 'react';
import { UserFormSheet } from './user-form-sheet';
import { UserDetailsSheet } from './user-details-sheet';
import { useDeleteInventoryUser } from '../hooks/use-inventory-users';
import { InventoryUser, UserStatus } from '../types';
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
import { Eye, Search, SquarePen, Trash, X, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserListTableProps {
  users?: InventoryUser[];
  isLoading?: boolean;
  error?: string | null;
}

const getStatusVariant = (status: UserStatus): 'primary' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' => {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'success';
    case UserStatus.INACTIVE:
      return 'secondary';
    case UserStatus.PENDING:
      return 'warning';
    case UserStatus.SUSPENDED:
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function UserListTable({
  users = [],
  isLoading = false,
  error = null,
}: UserListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'firstName', desc: false },
  ]);

  // React Query hook for delete mutation
  const deleteMutation = useDeleteInventoryUser();

  // Modal state
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    undefined,
  );

  const handleUserClick = useCallback((user: InventoryUser) => {
    setSelectedUserId(user.id);
    setIsUserDetailsOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<InventoryUser>[]>(
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
        id: 'userInfo',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        header: ({ column }) => (
          <DataGridColumnHeader title="User" column={column} />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-full bg-accent/50 h-[40px] w-[40px] shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    className="rounded-full h-[40px] w-[40px] object-cover"
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                ) : (
                  <UserCircle className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Link
                  to="#"
                  onClick={() => handleUserClick(user)}
                  className="text-sm font-medium tracking-[-1%] cursor-pointer hover:text-primary"
                >
                  {user.firstName} {user.lastName}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 200,
      },
      {
        id: 'position',
        accessorFn: (row) => row.position || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Position" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm">{info.getValue() as string}</span>
        ),
        enableSorting: true,
        size: 120,
      },
      {
        id: 'department',
        accessorFn: (row) => row.department || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Department" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm">{info.getValue() as string}</span>
        ),
        enableSorting: true,
        size: 120,
      },
      {
        id: 'employeeId',
        accessorFn: (row) => row.employeeId || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Employee ID" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm font-medium">{info.getValue() as string}</span>
        ),
        enableSorting: true,
        size: 100,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const variant = getStatusVariant(status);
          return (
            <Badge variant={variant} appearance="light">
              {status}
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
          const user = row.original;

          const handleView = () => {
            setSelectedUserId(user.id);
            setIsUserDetailsOpen(true);
          };

          const handleEdit = () => {
            setSelectedUserId(user.id);
            setIsEditUserOpen(true);
          };

          const handleDelete = async () => {
            if (!user.id) return;

            try {
              await deleteMutation.mutateAsync(user.id);
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
                title="View user"
              >
                <Eye />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleEdit}
                title="Edit user"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDelete}
                title="Delete user"
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [handleUserClick, deleteMutation.mutateAsync],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return users;
    }
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user?.firstName?.toLowerCase().includes(query) ||
        user?.lastName?.toLowerCase().includes(query) ||
        user?.email?.toLowerCase().includes(query) ||
        (user?.employeeId && user.employeeId.toLowerCase().includes(query)),
    );
  }, [users, searchQuery]);

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
                  placeholder="Search users..."
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
                <span className="text-muted-foreground">Loading users...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-destructive">Error loading users</span>
                <span className="text-sm text-muted-foreground">{error}</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">
                  {searchQuery
                    ? 'No users found matching your search'
                    : 'No users yet'}
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

      {/* User Details Sheet */}
      <UserDetailsSheet
        open={isUserDetailsOpen}
        onOpenChange={setIsUserDetailsOpen}
        userId={selectedUserId}
      />

      {/* Edit User Sheet */}
      <UserFormSheet
        mode="edit"
        open={isEditUserOpen}
        onOpenChange={setIsEditUserOpen}
        userId={selectedUserId}
      />

      {/* Create User Sheet */}
      <UserFormSheet
        mode="new"
        open={isCreateUserOpen}
        onOpenChange={setIsCreateUserOpen}
      />
    </>
  );
}
