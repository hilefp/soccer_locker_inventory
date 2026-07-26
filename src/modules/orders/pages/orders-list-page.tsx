'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { OrderListTable, ExportOrdersDialog } from '@/modules/orders/components';
import { useOrders } from '@/modules/orders/hooks/use-orders';
import { useExportOrders } from '@/modules/orders/hooks/use-export-orders';
import { OrderFilterParams, OrderStatus } from '@/modules/orders/types';

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_SORT_ID = 'created';

export function OrdersListPage() {
  useDocumentTitle('Orders');

  // Filters, pagination and sorting live in the URL so they survive opening an
  // order and navigating back.
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<OrderFilterParams>(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || DEFAULT_PAGE_SIZE,
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as OrderStatus | null) || undefined,
      clubId: searchParams.get('clubId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [searchParams],
  );

  const sortId = searchParams.get('sort') || DEFAULT_SORT_ID;
  const sortDesc = searchParams.get('desc') !== 'false'; // default true

  const { data, isLoading, error } = useOrders(filters);
  const { exportOrders, isExporting } = useExportOrders();

  // Updates the URL in place so filter changes don't pile up in the history stack.
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === '') {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          }
          // Drop defaults to keep the URL tidy
          if (next.get('page') === '1') next.delete('page');
          if (next.get('limit') === String(DEFAULT_PAGE_SIZE)) next.delete('limit');
          if (next.get('sort') === DEFAULT_SORT_ID && next.get('desc') !== 'false') {
            next.delete('sort');
            next.delete('desc');
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  const handlePageSizeChange = (limit: number) => {
    updateParams({ limit: String(limit), page: null });
  };

  const handleSearchChange = (search: string) => {
    updateParams({ search: search || null, page: null });
  };

  const handleStatusFilterChange = (status: OrderStatus | undefined) => {
    updateParams({ status: status ?? null, page: null });
  };

  const handleClubFilterChange = (clubId: string | undefined) => {
    updateParams({ clubId: clubId ?? null, page: null });
  };

  const handleDateRangeChange = (startDate: string | undefined, endDate: string | undefined) => {
    updateParams({ startDate: startDate ?? null, endDate: endDate ?? null, page: null });
  };

  const handleSortChange = (id: string, desc: boolean) => {
    updateParams({ sort: id, desc: String(desc) });
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
        page={filters.page}
        pageSize={filters.limit}
        search={filters.search}
        status={filters.status}
        clubId={filters.clubId}
        startDate={filters.startDate}
        endDate={filters.endDate}
        sortId={sortId}
        sortDesc={sortDesc}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onClubFilterChange={handleClubFilterChange}
        onDateRangeChange={handleDateRangeChange}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
