'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, LayoutGrid } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { OrderKanbanBoard, OrderSearchComplex, QrScannerButton } from '@/modules/orders/components';
import { useAllOrders, useOrderStatistics } from '@/modules/orders/hooks/use-orders';
import { OrderFilterParams, OrderStatus, KANBAN_STATUS_ORDER } from '@/modules/orders/types';
import { Badge } from '@/shared/components/ui/badge';

// The board shows every order created in the last 5 months, with no cap: the date
// window is what bounds the result set, so Delivered can no longer grow unbounded
// and needs no separate capped fetch. Older orders live in the order list.
const HISTORY_WINDOW_MONTHS = 5;

// Full ISO string: the API validates startDate with @IsDateString(), so a bare
// date like "2026-02-26" is rejected.
function monthsAgoISO(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

export function CurrentOrdersPage() {
  useDocumentTitle('Current Orders - Kanban');

  const [searchParams, setSearchParams] = useSearchParams();

  // Computed once per mount so the filter objects stay referentially stable and
  // don't retrigger the queries on every render.
  const startDate = useMemo(() => monthsAgoISO(HISTORY_WINDOW_MONTHS), []);

  // One fetch for every kanban status inside the window. useAllOrders pages through
  // the API until the whole set is loaded, so no column is truncated.
  const filters = useMemo<OrderFilterParams>(
    () => ({
      statuses: KANBAN_STATUS_ORDER,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      startDate,
    }),
    [startDate]
  );

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const ordersQuery = useAllOrders(filters);
  const { data: statistics } = useOrderStatistics();

  const isLoading = ordersQuery.isLoading;
  const isFetching = ordersQuery.isFetching;
  const error = ordersQuery.error;

  const allOrders = useMemo(() => ordersQuery.data?.data ?? [], [ordersQuery.data?.data]);

  // Sync URL search params with state
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl && searchFromUrl !== searchQuery) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams, searchQuery]);

  // Filter orders by search query on client side for real-time search
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return allOrders;

    const query = searchQuery.toLowerCase();
    return allOrders.filter((order) => {
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.shippingName?.toLowerCase().includes(query) ||
        order.customerUser?.email?.toLowerCase().includes(query) ||
        order.trackingNumber?.toLowerCase().includes(query) ||
        order.club?.name?.toLowerCase().includes(query)
      );
    });
  }, [allOrders, searchQuery]);

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    if (search) {
      setSearchParams({ search });
    } else {
      setSearchParams({});
    }
  };

  const handleRefresh = () => {
    ordersQuery.refetch();
  };

  // Calculate statistics for displayed statuses
  const statusCounts = useMemo(() => {
    if (!statistics?.statusCounts) return {} as Record<OrderStatus, number>;
    return KANBAN_STATUS_ORDER.reduce(
      (acc, status) => {
        acc[status] = statistics.statusCounts[status] || 0;
        return acc;
      },
      {} as Record<OrderStatus, number>
    );
  }, [statistics?.statusCounts]);

  const totalDisplayedOrders = Object.values(statusCounts).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="container-fluid space-y-5 lg:space-y-7">
      {/* Header */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="size-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Current Orders</h1>
            <Badge variant="secondary" size="sm" className="rounded-full">
              {totalDisplayedOrders} active
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading orders...'
              : error
                ? `Error loading orders: ${error.message}`
                : 'Drag and drop orders to change their status'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <OrderSearchComplex
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          showStatusFilter={false}
          showDateFilter={false}
          placeholder="Search by order number, customer, tracking..."
        />
        <QrScannerButton onScan={handleSearchChange} />

        {/* Status Summary */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {KANBAN_STATUS_ORDER.map((status) => (
            <Badge key={status} variant="secondary" appearance="outline" size="sm">
              {status}: {statusCounts[status] ?? 0}
            </Badge>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <OrderKanbanBoard
        orders={filteredOrders}
        isLoading={isLoading}
        statuses={KANBAN_STATUS_ORDER}
      />
    </div>
  );
}
