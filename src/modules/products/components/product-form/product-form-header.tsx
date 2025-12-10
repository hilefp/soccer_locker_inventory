import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

interface ProductFormHeaderProps {
  isEditMode: boolean;
  productId?: string;
  status: string;
  setStatus: (status: string) => void;
  isLoading: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ProductFormHeader({
  isEditMode,
  productId,
  status,
  setStatus,
  isLoading,
  onBack,
  onCancel,
  onSave,
}: ProductFormHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Product' : 'Create New Product'}
          </h1>
          {isEditMode && productId && (
            <p className="text-sm text-muted-foreground">ID: {productId.slice(0, 8)}...</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Select
          value={status}
          onValueChange={setStatus}
          indicatorPosition="right"
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              {isEditMode ? 'Save Changes' : 'Create Product'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
