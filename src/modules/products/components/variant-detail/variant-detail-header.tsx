import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

interface VariantDetailHeaderProps {
  isActive: boolean;
  productName?: string;
  onBack: () => void;
  onDelete: () => void;
  onSave: () => void;
  isDeleting: boolean;
  isSaving: boolean;
}

export function VariantDetailHeader({
  isActive,
  productName,
  onBack,
  onDelete,
  onSave,
  isDeleting,
  isSaving,
}: VariantDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Product
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Variant Details</h1>
          {productName && (
            <p className="text-sm text-muted-foreground">Product: {productName}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={isActive ? 'success' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting || isSaving}
        >
          <Trash2 className="size-4 mr-2" />
          Delete
        </Button>
        <Button onClick={onSave} disabled={isSaving || isDeleting}>
          {isSaving ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
