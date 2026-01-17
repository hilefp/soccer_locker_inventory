'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Eye,
  UserCheck,
  UserX,
  Ban,
  X,
  User,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/shared/lib/helpers';
import { Alert, AlertIcon, AlertTitle } from '@/shared/components/ui/alert';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Customer, CustomerStatus, CustomerListMeta } from '@/modules/shop/types/customer.type';
import {
  useActivateCustomer,
  useDeactivateCustomer,
  useSuspendCustomer,
} from '@/modules/shop/hooks/use-customers';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export interface ICustomerData {
  id: string;
  customerInfo: {
    avatarUrl?: string;
    fullName: string;
    email: string;
  };
  status: CustomerStatus;
  emailVerified: boolean;
  location: string;
  phone?: string;
  newsletter: boolean;
  lastLogin?: string;
  created: string;
}

interface CustomerListProps {
  customers?: Customer[];
  meta?: CustomerListMeta;
  isLoading?: boolean;
  error?: string | null;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  onStatusFilterChange?: (status: CustomerStatus | undefined) => void;
}

const convertCustomerToIData = (customer: Customer): ICustomerData => {
  const profile = customer.customerProfile;
  const fullName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : 'N/A';

  const locationParts = [
    profile?.city,
    profile?.state,
    profile?.country,
  ].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(', ') : 'N/A';

  return {
    id: customer.id,
    customerInfo: {
      avatarUrl: customer.avatarUrl,
      fullName: fullName || 'N/A',
      email: customer.email,
    },
    status: customer.status,
    emailVerified: customer.emailVerified,
    location,
    phone: profile?.phone,
    newsletter: profile?.newsletter || false,
    lastLogin: customer.lastLoginAt,
    created: customer.createdAt,
  };
};

const getStatusBadgeVariant = (status: CustomerStatus): 'success' | 'warning' | 'destructive' | 'secondary' => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'secondary';
    case 'SUSPENDED':
      return 'destructive';
    case 'PENDING_VERIFICATION':
      return 'warning';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: CustomerStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'INACTIVE':
      return 'Inactive';
    case 'SUSPENDED':
      return 'Suspended';
    case 'PENDING_VERIFICATION':
      return 'Pending';
    default:
      return status;
  }
};

export function CustomerListTable({
  customers,
  meta,
  onPageChange,
  onSearchChange,
  onStatusFilterChange,
}: CustomerListProps) {
  const navigate = useNavigate();
  const data = useMemo(() => {
    if (!customers || customers.length === 0) return [];
    return customers.map(convertCustomerToIData);
  }, [customers]);

  const activateMutation = useActivateCustomer();
  const deactivateMutation = useDeactivateCustomer();
  const suspendMutation = useSuspendCustomer();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
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

  const handleViewDetails = (customer: ICustomerData) => {
    navigate(`/shop/customers/${customer.id}`);
  };

  const handleActivate = (customer: ICustomerData) => {
    activateMutation.mutate(customer.id);
  };

  const handleDeactivate = (customer: ICustomerData) => {
    deactivateMutation.mutate(customer.id);
  };

  const handleSuspend = (customer: ICustomerData) => {
    suspendMutation.mutate(customer.id);
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

  const columns = useMemo<ColumnDef<ICustomerData>[]>(
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
        id: 'customerInfo',
        accessorFn: (row) => row.customerInfo,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Customer"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        cell: (info) => {
          const customerInfo = info.row.getValue('customerInfo') as ICustomerData['customerInfo'];

          return (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-full bg-accent/50 h-[40px] w-[40px] shrink-0">
                {customerInfo.avatarUrl ? (
                  <img
                    src={customerInfo.avatarUrl}
                    className="h-[40px] w-[40px] rounded-full object-cover"
                    alt={customerInfo.fullName}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<User class="size-5 text-muted-foreground" />';
                    }}
                  />
                ) : (
                  <User className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  className="text-sm font-medium text-foreground leading-tight cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleViewDetails(info.row.original)}
                >
                  {customerInfo.fullName}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="size-3" />
                  {customerInfo.email}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 280,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: (info) => {
          const status = info.row.original.status;
          return (
            <Badge
              variant={getStatusBadgeVariant(status)}
              appearance="light"
              className="rounded-full"
            >
              {getStatusLabel(status)}
            </Badge>
          );
        },
        enableSorting: true,
        size: 120,
      },
      {
        id: 'emailVerified',
        accessorFn: (row) => row.emailVerified,
        header: ({ column }) => (
          <DataGridColumnHeader title="Verified" column={column} />
        ),
        cell: (info) => {
          const verified = info.row.original.emailVerified;
          return (
            <div className="flex items-center justify-center">
              {verified ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <CheckCircle className="size-5 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent>Email verified</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <XCircle className="size-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Email not verified</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
        enableSorting: true,
        size: 90,
      },
      {
        id: 'location',
        accessorFn: (row) => row.location,
        header: ({ column }) => (
          <DataGridColumnHeader title="Location" column={column} />
        ),
        cell: (info) => {
          const location = info.row.original.location;
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm truncate max-w-[150px] block">
                    {location}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{location}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        enableSorting: true,
        size: 150,
      },
      {
        id: 'newsletter',
        accessorFn: (row) => row.newsletter,
        header: ({ column }) => (
          <DataGridColumnHeader title="Newsletter" column={column} />
        ),
        cell: (info) => {
          const subscribed = info.row.original.newsletter;
          return (
            <Badge
              variant={subscribed ? 'success' : 'secondary'}
              appearance="outline"
              size="sm"
              className="rounded-full"
            >
              {subscribed ? 'Subscribed' : 'Not subscribed'}
            </Badge>
          );
        },
        enableSorting: true,
        size: 120,
      },
      {
        id: 'lastLogin',
        accessorFn: (row) => row.lastLogin,
        header: ({ column }) => (
          <DataGridColumnHeader title="Last Login" column={column} />
        ),
        cell: (info) => {
          const lastLogin = info.row.original.lastLogin;
          return lastLogin ? formatDate(new Date(lastLogin)) : 'Never';
        },
        enableSorting: true,
        size: 120,
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
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" mode="icon" size="sm">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom">
                  <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                    <Eye className="size-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {customer.status !== 'ACTIVE' && (
                    <DropdownMenuItem onClick={() => handleActivate(customer)}>
                      <UserCheck className="size-4" />
                      Activate
                    </DropdownMenuItem>
                  )}
                  {customer.status !== 'INACTIVE' && (
                    <DropdownMenuItem onClick={() => handleDeactivate(customer)}>
                      <UserX className="size-4" />
                      Deactivate
                    </DropdownMenuItem>
                  )}
                  {customer.status !== 'SUSPENDED' && (
                    <DropdownMenuItem variant="destructive" onClick={() => handleSuspend(customer)}>
                      <Ban className="size-4" />
                      Suspend
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 80,
      },
    ],
    [],
  );

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
              Selected {selectedRowIds.length} customer(s)
            </AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    }
  }, [rowSelection]);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: meta?.limit || 10,
      },
      sorting,
      rowSelection,
    },
    pageCount: meta?.totalPages || 1,
    manualPagination: true,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater(pagination);
        setPagination(newState);
        if (onPageChange) {
          onPageChange(newState.pageIndex + 1);
        }
      }
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleClearInput = () => {
    setInputValue('');
    setSearchQuery('');
    if (onSearchChange) {
      onSearchChange('');
    }
    inputRef.current?.focus();
  };

  const handleSearchSubmit = () => {
    setSearchQuery(inputValue);
    if (onSearchChange) {
      onSearchChange(inputValue);
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as CustomerStatus | 'all');
    if (onStatusFilterChange) {
      onStatusFilterChange(value === 'all' ? undefined : (value as CustomerStatus));
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="py-3 flex-nowrap">
          <CardToolbar className="flex items-center gap-2">
            {/* Search */}
            <div className="w-full max-w-[250px]">
              <InputWrapper>
                <Search />
                <Input
                  placeholder="Search customers..."
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit();
                    }
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
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

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="PENDING_VERIFICATION">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Column Visibility */}
            <DataGridColumnVisibility
              table={table}
              trigger={
                <Button variant="outline">
                  <Filter className="size-3.5" />
                  Columns
                </Button>
              }
            />
          </CardToolbar>
        </CardHeader>

        <DataGrid
          table={table}
          recordCount={meta?.total || data.length}
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
