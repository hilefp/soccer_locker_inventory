'use client';

import { useEffect, useState } from 'react';
import {
  useCreateTag,
  useTag,
  useUpdateTag,
  useDeleteTag,
} from '../hooks/use-tags';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { toast } from 'sonner';

export function TagFormSheet({
  mode,
  open,
  onOpenChange,
  tagId,
  onSuccess,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagId?: string;
  onSuccess?: () => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState('true');

  const { data: tag, isLoading: isFetchingTag } = useTag(
    isEditMode ? tagId : undefined,
  );
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // Load tag data when editing
  useEffect(() => {
    if (!isEditMode || !tagId || !open || !tag) return;

    setName(tag.name);
    setIsActive(tag.isActive ? 'true' : 'false');
  }, [isEditMode, tagId, open, tag]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setName('');
      setIsActive('true');
    }
  }, [open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Tag name is required');
      return;
    }

    try {
      if (isNewMode) {
        await createMutation.mutateAsync({ name: name.trim() });
        toast.success('Tag created successfully');
      } else if (tagId) {
        await updateMutation.mutateAsync({
          id: tagId,
          data: {
            name: name.trim(),
            isActive: isActive === 'true',
          },
        });
        toast.success('Tag updated successfully');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.error(
        isNewMode ? 'Failed to create tag' : 'Failed to update tag',
      );
    }
  };

  const handleDelete = async () => {
    if (!tagId) return;

    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      await deleteMutation.mutateAsync(tagId);
      toast.success('Tag deleted successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Add Tag' : 'Edit Tag'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea
            className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Tag Name *</Label>
                <Input
                  placeholder="e.g. FIELD PLAYERS"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  disabled={isLoading || isFetchingTag}
                />
                <p className="text-xs text-muted-foreground">
                  Tag names are auto-uppercased for consistency
                </p>
              </div>

              {/* Status (edit mode only) */}
              {isEditMode && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Status</Label>
                  <Select
                    value={isActive}
                    onValueChange={setIsActive}
                    disabled={isLoading || isFetchingTag}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t p-5">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Close
            </Button>
            {isEditMode && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading || isFetchingTag}
              >
                Delete
              </Button>
            )}
            <Button
              variant="mono"
              onClick={handleSave}
              disabled={isLoading || isFetchingTag}
            >
              {isLoading
                ? 'Saving...'
                : isFetchingTag
                  ? 'Loading...'
                  : isNewMode
                    ? 'Create'
                    : 'Save'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
