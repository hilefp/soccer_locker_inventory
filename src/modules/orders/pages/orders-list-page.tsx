'use client';

import { useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { OrderListTable, ExportOrdersDialog } from '@/modules/orders/components';
import { useOrders } from '@/modules/orders/hooks/use-orders';
import { useExportOrders } from '@/modules/orders/hooks/use-export-orders';
import { OrderFilterParams, OrderStatus } from '@/modules/orders/types';

export function OrdersListPage() {
  useDocumentTitle('Orders');

  const [filters, setFilters] = useState<OrderFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useOrders(filters);
  const { exportOrders, isExporting } = useExportOrders();

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilterChange = (status: OrderStatus | undefined) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const totalOrders = data?.meta?.total || 0;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Orders</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading orders...'
              : error
                ? `Error loading orders: ${error.message}`
                : `${totalOrders} orders found`}
          </span>
        </div>
        <ExportOrdersDialog onExport={exportOrders} isExporting={isExporting} />
      </div>

      <OrderListTable
        orders={data?.data}
        meta={data?.meta}
        isLoading={isLoading}
        error={error?.message || null}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
      />
    </div>
  );
}
