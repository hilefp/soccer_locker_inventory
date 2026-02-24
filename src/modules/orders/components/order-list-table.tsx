'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  EllipsisVertical,
  Filter,
  Info,
  Search,
  Eye,
  Printer,
  Truck,
  X,
  Package,
  User,
  Calendar,
  Download,
  FileText,
  CalendarDays,
  Building2,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Calendar as CalendarUI } from '@/shared/components/ui/calendar';
import { Order, OrderStatus, OrderListMeta, ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, DocumentType } from '@/modules/orders/types';
import { OrderStatusBadge } from './order-status-badge';
import { useUpdateOrderStatus } from '@/modules/orders/hooks/use-orders';
import { ordersService } from '@/modules/orders/services/orders.service';
import { useClubs } from '@/modules/clubs/hooks/use-clubs';

export interface IOrderData {
  id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email?: string;
  };
  status: OrderStatus;
  itemCount: number;
  total: number;
  currency: string;
  club?: string;
  shippingCity?: string;
  carrier?: string;
  trackingNumber?: string;
  created: string;
}

interface OrderListTableProps {
  orders?: Order[];
  meta?: OrderListMeta;
  isLoading?: boolean;
  error?: string | null;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  onStatusFilterChange?: (status: OrderStatus | undefined) => void;
  onClubFilterChange?: (clubId: string | undefined) => void;
  onDateRangeChange?: (startDate: string | undefined, endDate: string | undefined) => void;
}

const convertOrderToIData = (order: Order): IOrderData => {
  const name = order.shippingName || order.customerUser?.email || 'N/A';
  const itemCount = order._count?.items || order.items?.length || 0;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerInfo: {
      name,
      email: order.customerUser?.email,
    },
    status: order.status,
    itemCount,
    total: Number(order.total) || 0,
    currency: order.currency,
    club: order.club?.name,
    shippingCity: order.shippingCity || undefined,
    carrier: order.carrier || undefined,
    trackingNumber: order.trackingNumber || undefined,
    created: order.createdAt,
  };
};

export function OrderListTable({
  orders,
  meta,
  isLoading,
  error,
  onPageChange,
  onSearchChange,
  onStatusFilterChange,
  onClubFilterChange,
  onDateRangeChange,
}: OrderListTableProps) {
  const navigate = useNavigate();
  const data = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    return orders.map(convertOrderToIData);
  }, [orders]);

  const updateStatusMutation = useUpdateOrderStatus();
  const { data: clubs } = useClubs();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('NEW');
  const [clubFilter, setClubFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
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
  const [isBulkPrinting, setIsBulkPrinting] = useState(false);

  const handleViewDetails = (order: IOrderData) => {
    navigate(`/orders/${order.id}`);
  };

  const handleUpdateStatus = (order: IOrderData, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({
      id: order.id,
      status: newStatus,
    });
  };

  const handleBulkPrint = async (documentType: DocumentType) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;

    // Early exit guards (Vercel best practice: js-early-exit)
    if (selectedRows.length === 0) {
      toast.error('No orders selected');
      return;
    }

    // Dynamically import print utilities to access MAX_BULK_PRINT constant (Vercel best practice: bundle-dynamic-imports)
    const { generateBulkPrintDocument, openPrintWindow, MAX_BULK_PRINT } = await import('@/modules/orders/lib/print-utils');

    if (selectedRows.length > MAX_BULK_PRINT) {
      toast.error(`Maximum ${MAX_BULK_PRINT} orders per bulk print. You selected ${selectedRows.length}.`);
      return;
    }

    const orderIds = selectedRows.map((row) => row.original.id);

    setIsBulkPrinting(true);
    try {
      // Fetch full order details with graceful partial failure handling (Vercel best practice: async-parallel)
      const { orders: fullOrders, failedCount } = await ordersService.getOrdersByIds(orderIds);

      if (fullOrders.length === 0) {
        toast.error('Failed to fetch order details. Please try again.');
        return;
      }

      if (failedCount > 0) {
        toast.warning(`${failedCount} order(s) could not be loaded and will be skipped.`);
      }

      // Generate print document with all successfully fetched orders
      const htmlContent = generateBulkPrintDocument(fullOrders, documentType);

      // Open print window
      const success = openPrintWindow(htmlContent);

      if (!success) {
        toast.error('Please allow popups to print');
        return;
      }

      toast.success(
        `Ready to print ${fullOrders.length} ${
          documentType === 'PACKING_SLIP' ? 'packing slip(s)' : 'invoice(s)'
        }`
      );

      // Clear selection after successful print
      setRowSelection({});
    } catch (error) {
      console.error('Bulk print error:', error);
      toast.error('Failed to generate documents. Please try again.');
    } finally {
      setIsBulkPrinting(false);
    }
  };

  const columns = useMemo<ColumnDef<IOrderData>[]>(
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
      },
      {
        id: 'orderNumber',
        accessorFn: (row) => row.orderNumber,
        header: ({ column }) => (
          <DataGridColumnHeader title="Order #" column={column} />
        ),
        cell: (info) => {
          const orderNumber = info.row.original.orderNumber;
          return (
            <span
              className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleViewDetails(info.row.original)}
            >
              {orderNumber}
            </span>
          );
        },
        enableSorting: true,
        size: 140,
      },
      {
        id: 'customerInfo',
        accessorFn: (row) => row.customerInfo,
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer" column={column} />
        ),
        cell: (info) => {
          const customerInfo = info.row.original.customerInfo;
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-accent/50 h-8 w-8 shrink-0">
                <User className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground leading-tight">
                  {customerInfo.name}
                </span>
                {customerInfo.email && customerInfo.email !== customerInfo.name && (
                  <span className="text-xs text-muted-foreground">{customerInfo.email}</span>
                )}
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 200,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: (info) => <OrderStatusBadge status={info.row.original.status} />,
        enableSorting: true,
        size: 120,
      },
      // {
      //   id: 'itemCount',
      //   accessorFn: (row) => row.itemCount,
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Items" column={column} />
      //   ),
      //   cell: (info) => {
      //     const count = info.row.original.itemCount;
      //     return (
      //       <div className="flex items-center gap-1.5">
      //         <Package className="size-4 text-muted-foreground" />
      //         <span className="text-sm">{count}</span>
      //       </div>
      //     );
      //   },
      //   enableSorting: true,
      //   size: 80,
      // },
      {
        id: 'total',
        accessorFn: (row) => row.total,
        header: ({ column }) => (
          <DataGridColumnHeader title="Total" column={column} />
        ),
        cell: (info) => {
          const order = info.row.original;
          return (
            <span className="text-sm font-medium">
              ${order.total?.toFixed(2)} {order.currency || 'USD'}
            </span>
          );
        },
        enableSorting: true,
        size: 120,
      },
      {
        id: 'club',
        accessorFn: (row) => row.club,
        header: ({ column }) => (
          <DataGridColumnHeader title="Club" column={column} />
        ),
        cell: (info) => {
          const club = info.row.original.club;
          return club ? (
            <Badge variant="info" appearance="light" size="sm" className="rounded-full">
              {club}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
        enableSorting: true,
        size: 120,
      },
      // {
      //   id: 'shippingCity',
      //   accessorFn: (row) => row.shippingCity,
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="City" column={column} />
      //   ),
      //   cell: (info) => {
      //     const city = info.row.original.shippingCity;
      //     return <span className="text-sm">{city || '-'}</span>;
      //   },
      //   enableSorting: true,
      //   size: 120,
      // },
      {
        id: 'tracking',
        accessorFn: (row) => row.trackingNumber,
        header: ({ column }) => (
          <DataGridColumnHeader title="Tracking" column={column} />
        ),
        cell: (info) => {
          const order = info.row.original;
          if (!order.trackingNumber) {
            return <span className="text-muted-foreground text-sm">-</span>;
          }
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Truck className="size-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[100px]">
                      {order.trackingNumber}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {order.carrier && <div>Carrier: {order.carrier}</div>}
                  <div>Tracking: {order.trackingNumber}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        enableSorting: false,
        size: 140,
      },
      {
        id: 'created',
        accessorFn: (row) => row.created,
        header: ({ column }) => (
          <DataGridColumnHeader title="Created" column={column} />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(new Date(info.row.original.created))}</span>
            </div>
          );
        },
        enableSorting: true,
        size: 140,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const order = row.original;
          const validTransitions = ORDER_STATUS_FLOW[order.status];

          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" mode="icon" size="sm">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom">
                  <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                    <Eye className="size-4" />
                    View Details
                  </DropdownMenuItem>
                  {validTransitions.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {validTransitions.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleUpdateStatus(order, status)}
                        >
                          Move to {ORDER_STATUS_LABELS[status]}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 80,
      },
    ],
    []
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
            <AlertTitle>Selected {selectedRowIds.length} order(s)</AlertTitle>
          </Alert>
        ),
        { duration: 5000 }
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
    setStatusFilter(value as OrderStatus | 'all');
    if (onStatusFilterChange) {
      onStatusFilterChange(value === 'all' ? undefined : (value as OrderStatus));
    }
  };

  const handleClubChange = (value: string) => {
    setClubFilter(value);
    if (onClubFilterChange) {
      onClubFilterChange(value === 'all' ? undefined : value);
    }
  };

  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    setDateRange(range || {});
    if (onDateRangeChange) {
      const startDate = range?.from?.toISOString().split('T')[0];
      const endDate = range?.to?.toISOString().split('T')[0];
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleClearDateRange = () => {
    setDateRange({});
    if (onDateRangeChange) {
      onDateRangeChange(undefined, undefined);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="py-3 flex-nowrap">
          <CardToolbar className="flex items-center gap-2">
            {/* Search */}
            <div className="w-full max-w-[300px]">
              <InputWrapper>
                <Search />
                <Input
                  placeholder="Search orders..."
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
                {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Club Filter */}
            <Select value={clubFilter} onValueChange={handleClubChange}>
              <SelectTrigger className="w-[150px]">
                <Building2 className="size-3.5" />
                <SelectValue placeholder="All Clubs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clubs</SelectItem>
                {clubs?.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px] justify-start">
                  <CalendarDays className="size-3.5" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                      </>
                    ) : (
                      formatDate(dateRange.from)
                    )
                  ) : (
                    'Pick date range'
                  )}
                  {dateRange.from && (
                    <X
                      className="size-3.5 ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearDateRange();
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarUI
                  mode="range"
                  selected={dateRange.from && dateRange.to ? dateRange as any : undefined}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Bulk Print - Only show when rows are selected */}
            {Object.keys(rowSelection).length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="primary"
                    disabled={isBulkPrinting}
                  >
                    <Printer className="size-3.5" />
                    Print ({Object.keys(rowSelection).length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleBulkPrint('PACKING_SLIP')}
                    disabled={isBulkPrinting}
                  >
                    <FileText className="size-4" />
                    Packing Slips
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkPrint('INVOICE')}
                    disabled={isBulkPrinting}
                  >
                    <Download className="size-4" />
                    Invoices
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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
