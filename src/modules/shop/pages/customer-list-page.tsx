'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { CustomerListTable } from '../components/customer-list';
import { useCustomers } from '@/modules/shop/hooks/use-customers';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { CustomerFilterParams, CustomerStatus } from '@/modules/shop/types/customer.type';

export function CustomerListPage() {
  useDocumentTitle('Customers - Shop');

  const [filters, setFilters] = useState<CustomerFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useCustomers(filters);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilterChange = (status: CustomerStatus | undefined) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
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
      </div>

      <CustomerListTable
        customers={data?.data}
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
