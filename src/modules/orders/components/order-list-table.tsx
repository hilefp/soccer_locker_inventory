'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { Order, OrderStatus, OrderStatusFilter, OrderListMeta, ORDER_STATUS_LABELS, DocumentType } from '@/modules/orders/types';
import { OrderStatusBadge } from './order-status-badge';
import { useUpdateOrderStatus, orderKeys } from '@/modules/orders/hooks/use-orders';
import { ordersService } from '@/modules/orders/services/orders.service';
import { useQueryClient } from '@tanstack/react-query';
import { useClubs } from '@/modules/clubs/hooks/use-clubs';

export interface IOrderData {
  id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email?: string;
  };
  status: OrderStatus;
  isRushOrder: boolean;
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
  /** Current filter/pagination state, owned by the page (persisted in the URL). */
  page?: number;
  pageSize?: number;
  search?: string;
  status?: OrderStatusFilter;
  clubId?: string;
  startDate?: string;
  endDate?: string;
  sortId?: string;
  sortDesc?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange?: (search: string) => void;
  onStatusFilterChange?: (status: OrderStatusFilter | undefined) => void;
  onClubFilterChange?: (clubId: string | undefined) => void;
  onDateRangeChange?: (startDate: string | undefined, endDate: string | undefined) => void;
  onSortChange?: (id: string, desc: boolean) => void;
}

/**
 * Parses a `YYYY-MM-DD` (optionally `...THH:mm:ss`) filter value as a local date,
 * avoiding the UTC shift `new Date('2026-07-26')` would introduce.
 */
const parseFilterDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const [y, m, d] = value.split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};

/** Formats a picked date as `YYYY-MM-DD` in local time (round-trips with parseFilterDate). */
const toDateParam = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

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
    isRushOrder: order.isRushOrder && Number(order.rushFee) > 0,
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
  page = 1,
  pageSize = 25,
  search = '',
  status,
  clubId,
  startDate,
  endDate,
  sortId = 'created',
  sortDesc = true,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onStatusFilterChange,
  onClubFilterChange,
  onDateRangeChange,
  onSortChange,
}: OrderListTableProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const data = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    return orders.map(convertOrderToIData);
  }, [orders]);

  const queryClient = useQueryClient();
  const updateStatusMutation = useUpdateOrderStatus();
  const { data: clubs } = useClubs();

  // Filter/pagination/sorting state is derived from props (the URL) rather than
  // held locally, so the toolbar reflects the current URL on mount and on back.
  const statusFilter = status ?? 'all';
  const clubFilter = clubId ?? 'all';
  const dateRange = useMemo(
    () => ({ from: parseFilterDate(startDate), to: parseFilterDate(endDate) }),
    [startDate, endDate],
  );
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: Math.max(page - 1, 0), pageSize }),
    [page, pageSize],
  );
  const sorting = useMemo<SortingState>(
    () => [{ id: sortId, desc: sortDesc }],
    [sortId, sortDesc],
  );

  const [inputValue, setInputValue] = useState(search);
  const inputRef = useRef<HTMLInputElement>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkPrinting, setIsBulkPrinting] = useState(false);

  // `columns` is memoized once, so the handlers below live in a first-render
  // closure — read the query string through a ref to avoid a stale value.
  const searchStringRef = useRef(location.search);
  searchStringRef.current = location.search;

  const handleViewDetails = (order: IOrderData) => {
    // Carry the current filters so "Back to Orders" can restore them.
    navigate(`/orders/${order.id}`, { state: { fromSearch: searchStringRef.current } });
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

      // Print oldest-to-newest regardless of the table's current sort order
      const sortedOrders = [...fullOrders].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Generate print document with all successfully fetched orders
      const htmlContent = generateBulkPrintDocument(sortedOrders, documentType);

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

      // Use backend bulk-print endpoint for status transitions + stock checking
      if (documentType === 'PACKING_SLIP') {
        const newOrders = fullOrders.filter((o) => o.status === 'NEW');
        if (newOrders.length > 0) {
          try {
            const bulkResult = await ordersService.bulkPrint({
              orderIds: newOrders.map((o) => o.id),
              documentType: 'PACKING_SLIP',
            });

            // Show stock alerts for orders diverted to MISSING status
            if (bulkResult.stockAlerts && bulkResult.stockAlerts.length > 0) {
              const alertCount = bulkResult.stockAlerts.length;
              const alertDetails = bulkResult.stockAlerts
                .map((alert) => {
                  const itemsList = alert.items
                    .map((item) => `${item.name || item.sku || 'Unknown'} (need ${item.orderedQuantity}, have ${item.availableQuantity})`)
                    .join(', ');
                  return `${alert.orderNumber}: ${itemsList}`;
                })
                .join('\n');

              toast.warning(
                `${alertCount} order(s) moved to Missing due to insufficient stock`,
                {
                  description: alertDetails,
                  duration: 10000,
                },
              );
            }

            const printedCount = newOrders.length - (bulkResult.stockAlerts?.length || 0);
            if (printedCount > 0) {
              toast.info(`${printedCount} order(s) moved to Print status`);
            }
          } catch (err) {
            console.error('Bulk print status transition error:', err);
            toast.error('Failed to update order statuses. Documents were printed but statuses may not be updated.');
          }
          queryClient.invalidateQueries({ queryKey: orderKeys.all });
        }
      }

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
        cell: (info) => (
          <div className="flex items-center gap-1.5">
            <OrderStatusBadge status={info.row.original.status} />
            {info.row.original.isRushOrder && (
              <Badge variant="warning" appearance="light" size="sm" className="rounded-full">
                Rush
              </Badge>
            )}
          </div>
        ),
        enableSorting: true,
        size: 150,
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
                    <span className="text-sm whitespace-nowrap">
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
        size: 200,
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
          const availableStatuses = (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).filter(
            (status) => status !== order.status
          );

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
                  {availableStatuses.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {availableStatuses.map((status) => (
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

  // Keep the search box in sync when the URL changes (back/forward, cleared filters).
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    pageCount: meta?.totalPages || 1,
    manualPagination: true,
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function' ? updater(pagination) : updater;
      if (newState.pageSize !== pagination.pageSize) {
        onPageSizeChange?.(newState.pageSize);
      }
      if (newState.pageIndex !== pagination.pageIndex) {
        onPageChange?.(newState.pageIndex + 1);
      }
    },
    onSortingChange: (updater) => {
      const newState = typeof updater === 'function' ? updater(sorting) : updater;
      const next = newState[0];
      onSortChange?.(next?.id ?? 'created', next?.desc ?? true);
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleClearInput = () => {
    setInputValue('');
    onSearchChange?.('');
    inputRef.current?.focus();
  };

  const handleSearchSubmit = () => {
    onSearchChange?.(inputValue);
  };

  const handleStatusChange = (value: string) => {
    onStatusFilterChange?.(value === 'all' ? undefined : (value as OrderStatusFilter));
  };

  const handleClubChange = (value: string) => {
    onClubFilterChange?.(value === 'all' ? undefined : value);
  };

  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (onDateRangeChange) {
      const from = range?.from ? toDateParam(range.from) : undefined;
      const to = range?.to ? `${toDateParam(range.to)}T23:59:59` : undefined;
      onDateRangeChange(from, to);
    }
  };

  const handleClearDateRange = () => {
    onDateRangeChange?.(undefined, undefined);
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
              <SelectTrigger className="w-auto whitespace-nowrap justify-start">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
                <SelectItem value="RUSH">Rush</SelectItem>
              </SelectContent>
            </Select>

            {/* Club Filter */}
            <Select value={clubFilter} onValueChange={handleClubChange}>
              <SelectTrigger className="w-auto whitespace-nowrap justify-start">
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
                <Button variant="outline" className="w-auto whitespace-nowrap justify-start">
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
            <DataGridPagination sizes={[25, 50, 100]} />
          </CardFooter>
        </DataGrid>
      </Card>
    </div>
  );
}
