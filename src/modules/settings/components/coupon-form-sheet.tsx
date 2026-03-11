'use client';

import { useEffect, useState } from 'react';
import {
  useCreateCoupon,
  useCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from '../hooks/use-coupons';
import { CouponType } from '../types';
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
import { useClubs } from '@/modules/clubs/hooks/use-clubs';

export function CouponFormSheet({
  mode,
  open,
  onOpenChange,
  couponId,
  onSuccess,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponId?: string;
  onSuccess?: () => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CouponType>(CouponType.FREE_SHIPPING);
  const [shippingMethod, setShippingMethod] = useState('');
  const [isActive, setIsActive] = useState('true');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [clubId, setClubId] = useState('');

  const { data: coupon, isLoading: isFetchingCoupon } = useCoupon(
    isEditMode ? couponId : undefined,
  );
  const { data: clubs = [] } = useClubs();
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // Load coupon data when editing
  useEffect(() => {
    if (!isEditMode || !couponId || !open || !coupon) return;

    setCode(coupon.code);
    setDescription(coupon.description || '');
    setType(coupon.type);
    setShippingMethod(coupon.shippingMethod || '');
    setIsActive(coupon.isActive ? 'true' : 'false');
    setValidFrom(coupon.validFrom ? coupon.validFrom.slice(0, 10) : '');
    setValidTo(coupon.validTo ? coupon.validTo.slice(0, 10) : '');
    setMaxUses(coupon.maxUses != null ? String(coupon.maxUses) : '');
    setClubId(coupon.clubId || '');
  }, [isEditMode, couponId, open, coupon]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setCode('');
      setDescription('');
      setType(CouponType.FREE_SHIPPING);
      setShippingMethod('');
      setIsActive('true');
      setValidFrom('');
      setValidTo('');
      setMaxUses('');
      setClubId('');
    }
  }, [open]);

  const handleSave = async () => {
    if (!code.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    const couponData = {
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      type,
      shippingMethod: shippingMethod.trim() || undefined,
      isActive: isActive === 'true',
      validFrom: validFrom || undefined,
      validTo: validTo || undefined,
      maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
      clubId: clubId.trim() || undefined,
    };

    try {
      if (isNewMode) {
        await createMutation.mutateAsync(couponData);
        toast.success('Coupon created successfully');
      } else if (couponId) {
        await updateMutation.mutateAsync({
          id: couponId,
          data: couponData,
        });
        toast.success('Coupon updated successfully');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(
        isNewMode ? 'Failed to create coupon' : 'Failed to update coupon',
      );
    }
  };

  const handleDelete = async () => {
    if (!couponId) return;

    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await deleteMutation.mutateAsync(couponId);
      toast.success('Coupon deleted successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Add Coupon' : 'Edit Coupon'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea
            className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="space-y-6">
              {/* Code */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Coupon Code *</Label>
                <Input
                  placeholder="e.g. WMFCOACH"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isLoading || isFetchingCoupon}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Description</Label>
                <Input
                  placeholder="Coupon description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading || isFetchingCoupon}
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Type</Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as CouponType)}
                  disabled={isLoading || isFetchingCoupon}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CouponType.FREE_SHIPPING}>
                      Free Shipping
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shipping Method */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Shipping Method</Label>
                <Input
                  placeholder="e.g. WMF Coach Pick-up"
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  disabled={isLoading || isFetchingCoupon}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={isActive}
                  onValueChange={setIsActive}
                  disabled={isLoading || isFetchingCoupon}
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

              {/* Valid From */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Valid From</Label>
                <Input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  disabled={isLoading || isFetchingCoupon}
                />
              </div>

              {/* Valid To */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Valid To</Label>
                <Input
                  type="date"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  disabled={isLoading || isFetchingCoupon}
                />
              </div>

              {/* Max Uses */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Max Uses</Label>
                <Input
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  disabled={isLoading || isFetchingCoupon}
                  min={0}
                />
              </div>

              {/* Club */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Club</Label>
                <Select
                  value={clubId || 'none'}
                  onValueChange={(value) =>
                    setClubId(value === 'none' ? '' : value)
                  }
                  disabled={isLoading || isFetchingCoupon}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {clubs
                      .filter((club) => club.isActive)
                      .map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
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
                disabled={isLoading || isFetchingCoupon}
              >
                Delete
              </Button>
            )}
            <Button
              variant="mono"
              onClick={handleSave}
              disabled={isLoading || isFetchingCoupon}
            >
              {isLoading
                ? 'Saving...'
                : isFetchingCoupon
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
