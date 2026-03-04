'use client';

import { useEffect, useState } from 'react';
import { useUpdateAppSetting } from '../hooks/use-app-settings';
import type { AppSetting } from '../types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { toast } from 'sonner';

export function AppSettingsFormSheet({
  open,
  onOpenChange,
  setting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting?: AppSetting;
}) {
  const [value, setValue] = useState('');

  const updateMutation = useUpdateAppSetting();
  const isLoading = updateMutation.isPending;

  useEffect(() => {
    if (open && setting) {
      setValue(setting.value);
    }
  }, [open, setting]);

  useEffect(() => {
    if (!open) {
      setValue('');
    }
  }, [open]);

  const handleSave = async () => {
    if (!setting) return;

    try {
      await updateMutation.mutateAsync({
        key: setting.key,
        data: { value: value.trim() },
      });
      toast.success('Setting updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">Edit Setting</SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <div className="px-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Key</Label>
              <Input
                value={setting?.key || ''}
                disabled
                className="font-mono bg-muted/30"
              />
            </div>

            {setting?.description && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-medium">Value</Label>
              <Input
                placeholder="Enter value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </SheetBody>

        <SheetFooter className="border-t p-5">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Close
            </Button>
            <Button
              variant="mono"
              onClick={handleSave}
              disabled={isLoading || !setting}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
