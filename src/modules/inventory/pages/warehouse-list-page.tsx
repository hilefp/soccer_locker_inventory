import { useState } from 'react';
import { WarehouseListTable } from '../components/warehouse-list-table';
import { useWarehouses } from '../hooks/use-warehouses';
import { Warehouse, WarehouseFilters } from '../types/warehouse.types';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

export function WarehouseListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<WarehouseFilters>({});

  const { data: warehouses, isLoading, error } = useWarehouses(filters);

  const handleEdit = (warehouse: Warehouse) => {
    navigate(`/inventory/warehouses/${warehouse.id}/edit`);
  };

  const handleViewStatistics = (warehouse: Warehouse) => {
    navigate(`/inventory/warehouses/${warehouse.id}`);
  };

  const handleCreateNew = () => {
    navigate('/inventory/warehouses/new');
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warehouses</h1>
          <p className="text-muted-foreground">
            Manage your warehouse locations and inventory centers
          </p>
        </div>
        <Button variant="mono" onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Warehouse
        </Button>
      </div>

      <WarehouseListTable
        warehouses={warehouses}
        isLoading={isLoading}
        error={error?.message || null}
        onEdit={handleEdit}
        onViewStatistics={handleViewStatistics}
      />
    </div>
  );
}
