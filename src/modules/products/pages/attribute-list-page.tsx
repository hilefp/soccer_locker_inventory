'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { AttributeListTable } from '@/modules/products/components/attribute-list';
import { AttributeFormSheet } from '@/modules/products/components/attribute-form-sheet';
import { useState } from 'react';
import { ProductNavigationTabs } from '@/modules/products/components/product-navigation-tabs';
import { useProductAttributes } from '@/modules/products/hooks/use-product-attributes';

export function AttributeList() {
  const [isCreateAttributeOpen, setIsCreateAttributeOpen] = useState(false);

  // Use React Query hook for data fetching
  const { data: attributes = [], isLoading, error } = useProductAttributes();

  const requiredAttributes = attributes.filter(attr => attr.isRequired);
  const totalAttributes = attributes.length;
  const requiredPercentage = totalAttributes > 0
    ? Math.round((requiredAttributes.length / totalAttributes) * 100)
    : 0;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
        <ProductNavigationTabs />
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">
            Attributes
          </h3>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading attributes...'
              : error
                ? `Error loading attributes: ${error.message}`
                : `${totalAttributes} attributes found. ${requiredPercentage}% are required.`
            }
          </span>
        </div>

        <Button variant="mono" onClick={() => setIsCreateAttributeOpen(true)}>
          <PlusIcon />
          Add Attribute
        </Button>
      </div>
      <AttributeListTable
        attributes={attributes}
        isLoading={isLoading}
        error={error?.message || null}
      />
      <AttributeFormSheet
        mode="new"
        open={isCreateAttributeOpen}
        onOpenChange={setIsCreateAttributeOpen}
      />
    </div>
  );
}
