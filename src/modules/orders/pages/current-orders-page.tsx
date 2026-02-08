'use client';

import { useState, useMemo } from 'react';
import { RefreshCw, LayoutGrid } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { OrderKanbanBoard, OrderSearchComplex } from '@/modules/orders/components';
import { useOrders, useOrderStatistics } from '@/modules/orders/hooks/use-orders';
import { OrderFilterParams, OrderStatus, KANBAN_STATUS_ORDER } from '@/modules/orders/types';
import { Badge } from '@/shared/components/ui/badge';

export function CurrentOrdersPage() {
  useDocumentTitle('Current Orders - Kanban');

  const [filters, setFilters] = useState<OrderFilterParams>({
    statuses: KANBAN_STATUS_ORDER,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 100, // Get more orders for kanban view
  });

  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch, isFetching } = useOrders(filters);
  const { data: statistics } = useOrderStatistics();

  // Filter orders by search query on client side for real-time search
  const filteredOrders = useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery) return data.data;

    const query = searchQuery.toLowerCase();
    return data.data.filter((order) => {
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.shippingName?.toLowerCase().includes(query) ||
        order.customerUser?.email?.toLowerCase().includes(query) ||
        order.trackingNumber?.toLowerCase().includes(query) ||
        order.club?.name?.toLowerCase().includes(query)
      );
    });
  }, [data?.data, searchQuery]);

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  const handleRefresh = () => {
    refetch();
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
