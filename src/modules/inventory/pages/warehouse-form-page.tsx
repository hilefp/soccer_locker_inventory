import { useNavigate, useParams } from 'react-router';
import {
  CreateWarehouseSchemaType,
} from '../schemas/warehouse-schema';
import {
  useWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
} from '../hooks/use-warehouses';
import { WarehouseForm } from '../components/warehouse-form';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function WarehouseFormPage() {
  useDocumentTitle('Warehouse Form');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== undefined && id !== 'new';

  const { data: warehouse, isLoading: isLoadingWarehouse } = useWarehouse(id || '');
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();

  const handleSubmit = async (data: CreateWarehouseSchemaType) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data });
        navigate('/inventory/warehouses');
      } else {
        await createMutation.mutateAsync(data);
        navigate('/inventory/warehouses');
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/inventory/warehouses');
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingWarehouse) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-muted-foreground">Loading warehouse...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/inventory/warehouses')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Warehouses
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditMode ? 'Edit Warehouse' : 'Create New Warehouse'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Update warehouse information'
            : 'Add a new warehouse to your inventory system'}
        </p>
      </div>

      <WarehouseForm
        warehouse={warehouse}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
