'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Users } from 'lucide-react';
import { CustomerListTable } from '../components/customer-list';
import { useCustomers } from '@/modules/shop/hooks/use-customers';
import { useExportCustomers } from '@/modules/shop/hooks/use-export-customers';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { Button } from '@/shared/components/ui/button';
import { CustomerFilterParams, CustomerStatus } from '@/modules/shop/types/customer.type';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_ID = 'created';

export function CustomerListPage() {
  useDocumentTitle('Customers - Shop');

  // Filters, pagination and sorting live in the URL so they survive opening a
  // customer and navigating back.
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<CustomerFilterParams>(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || DEFAULT_PAGE_SIZE,
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as CustomerStatus | null) || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [searchParams],
  );

  const sortId = searchParams.get('sort') || DEFAULT_SORT_ID;
  const sortDesc = searchParams.get('desc') !== 'false'; // default true

  const { data, isLoading, error } = useCustomers(filters);
  const { exportCustomers, isExporting } = useExportCustomers();

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

  const handleLimitChange = (limit: number) => {
    updateParams({ limit: String(limit), page: null });
  };

  const handleSearchChange = (search: string) => {
    updateParams({ search: search || null, page: null });
  };

  const handleStatusFilterChange = (status: CustomerStatus | undefined) => {
    updateParams({ status: status ?? null, page: null });
  };

  const handleSortChange = (id: string, desc: boolean) => {
    updateParams({ sort: id, desc: String(desc) });
  };

  const totalCustomers = data?.meta?.total || 0;
  const activeCustomers = data?.data?.filter((c) => c.status === 'ACTIVE').length || 0;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users className="size-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Customers</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading customers...'
              : error
                ? `Error loading customers: ${error.message}`
                : `${totalCustomers} customers found. ${activeCustomers} active.`}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={() => exportCustomers(filters)}
          disabled={isExporting || totalCustomers === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting…' : 'Export'}
        </Button>
      </div>

      <CustomerListTable
        customers={data?.data}
        meta={data?.meta}
        isLoading={isLoading}
        error={error?.message || null}
        page={filters.page}
        pageSize={filters.limit}
        search={filters.search}
        status={filters.status}
        sortId={sortId}
        sortDesc={sortDesc}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
