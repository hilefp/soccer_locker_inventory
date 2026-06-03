'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, LayoutGrid } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { OrderKanbanBoard, OrderSearchComplex, QrScannerButton } from '@/modules/orders/components';
import { useOrders, useOrderStatistics } from '@/modules/orders/hooks/use-orders';
import { OrderFilterParams, OrderStatus, KANBAN_STATUS_ORDER } from '@/modules/orders/types';
import { Badge } from '@/shared/components/ui/badge';

// Active (non-delivered) statuses are loaded in full; delivered is capped since
// it grows unbounded over time and we only need the most recent ones on the board.
const ACTIVE_STATUSES: OrderStatus[] = KANBAN_STATUS_ORDER.filter((s) => s !== 'DELIVERED');
const ALL_ACTIVE_LIMIT = 1000; // high cap to effectively load all active orders
const DELIVERED_LIMIT = 500;

export function CurrentOrdersPage() {
  useDocumentTitle('Current Orders - Kanban');

  const [searchParams, setSearchParams] = useSearchParams();

  // Two fetches so each column shows ALL its orders: one for every active status
  // (uncapped in practice), and a separate, capped fetch for the Delivered column.
  const activeFilters = useMemo<OrderFilterParams>(
    () => ({
      statuses: ACTIVE_STATUSES,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: ALL_ACTIVE_LIMIT,
    }),
    []
  );

  const deliveredFilters = useMemo<OrderFilterParams>(
    () => ({
      statuses: ['DELIVERED'],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: DELIVERED_LIMIT,
    }),
    []
  );

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const activeQuery = useOrders(activeFilters);
  const deliveredQuery = useOrders(deliveredFilters);
  const { data: statistics } = useOrderStatistics();

  const isLoading = activeQuery.isLoading || deliveredQuery.isLoading;
  const isFetching = activeQuery.isFetching || deliveredQuery.isFetching;
  const error = activeQuery.error || deliveredQuery.error;

  const allOrders = useMemo(
    () => [...(activeQuery.data?.data ?? []), ...(deliveredQuery.data?.data ?? [])],
    [activeQuery.data?.data, deliveredQuery.data?.data]
  );

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
    activeQuery.refetch();
    deliveredQuery.refetch();
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
