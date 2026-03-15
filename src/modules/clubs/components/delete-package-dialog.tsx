import { useUngroupClubProducts } from '../hooks/use-club-products';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeletePackageDialogProps {
  clubId: string;
  groupId: string | null;
  packageName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeletePackageDialog({
  clubId,
  groupId,
  packageName,
  open,
  onOpenChange,
  onSuccess,
}: DeletePackageDialogProps) {
  const ungroupMutation = useUngroupClubProducts(clubId);

  const handleDelete = async () => {
    if (!groupId) return;

    try {
      await ungroupMutation.mutateAsync(groupId);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error dissolving package:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Dissolve Package</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to dissolve the package{' '}
            <span className="font-semibold text-foreground">"{packageName}"</span>?
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            The individual products will remain in the club catalog but will no longer
            be grouped together. They will appear separately in the shop.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={ungroupMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={ungroupMutation.isPending}
          >
            {ungroupMutation.isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Dissolving...
              </>
            ) : (
              'Dissolve Package'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
