import { Button } from '@/shared/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

interface StockEntryHeaderProps {
  onBack: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  hasProducts: boolean;
}

export function StockEntryHeader({
  onBack,
  onCancel,
  isSubmitting,
  hasProducts,
}: StockEntryHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Stock Entry</h1>
          <p className="text-base text-muted-foreground mt-1">
            Register incoming inventory to warehouse
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="mono"
          disabled={isSubmitting || !hasProducts}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Creating...' : 'Create Entry'}
        </Button>
      </div>
    </div>
  );
}
