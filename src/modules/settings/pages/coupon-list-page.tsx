'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { CouponListTable } from '../components/coupon-list-table';
import { CouponFormSheet } from '../components/coupon-form-sheet';
import { useCoupons } from '../hooks/use-coupons';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function CouponListPage() {
  useDocumentTitle('Coupon Codes');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: coupons = [], isLoading, error } = useCoupons();

  const activeCoupons = coupons.filter((c) => c.isActive);
  const totalCoupons = coupons.length;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">
            Coupon Codes
          </h3>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading coupons...'
              : error
                ? `Error loading coupons: ${error.message}`
                : `${totalCoupons} coupons found. ${activeCoupons.length} active.`}
          </span>
        </div>

        <Button variant="mono" onClick={() => setIsCreateOpen(true)}>
          <PlusIcon />
          Add Coupon
        </Button>
      </div>

      <CouponListTable
        coupons={coupons}
        isLoading={isLoading}
        error={error?.message || null}
      />

      <CouponFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
