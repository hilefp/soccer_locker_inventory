import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { useCatalogs } from '@/modules/catalogs/hooks/use-catalogs';
import { CatalogListTable } from '@/modules/catalogs/components/catalog-list-table';
import { CatalogFormSheet } from '@/modules/catalogs/components/catalog-form-sheet';

export function CatalogListPage() {
  useDocumentTitle('Catalogs');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: catalogs = [], isLoading, error } = useCatalogs(true);

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Catalogs</h1>
          <span className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : error ? 'Error loading catalogs' : `${catalogs.length} catalogs`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="mono" onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4 mr-1.5" />
            Add Catalog
          </Button>
        </div>
      </div>

      <CatalogListTable
        catalogs={catalogs}
        isLoading={isLoading}
        error={error?.message}
      />

      <CatalogFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
