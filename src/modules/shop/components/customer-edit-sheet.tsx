import { useState, useEffect } from 'react';
import { Pencil, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/shared/components/ui/sheet';
import { Customer, UpdateCustomerRequest } from '@/modules/shop/types/customer.type';
import {
  useUpdateCustomer,
  useResetCustomerPassword,
} from '@/modules/shop/hooks/use-customers';
import { useAuthStore } from '@/shared/stores/auth-store';

interface CustomerEditSheetProps {
  customer: Customer;
}

export function CustomerEditSheet({ customer }: CustomerEditSheetProps) {
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdateCustomer();
  const resetPasswordMutation = useResetCustomerPassword();
  const profile = customer.customerProfile;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN') ?? false;

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isSaving = updateMutation.isPending || resetPasswordMutation.isPending;

  const [formData, setFormData] = useState<UpdateCustomerRequest>({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    birthDate: profile?.birthDate || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || '',
    postalCode: profile?.postalCode || '',
    taxId: profile?.taxId || '',
    companyName: profile?.companyName || '',
    newsletter: profile?.newsletter || false,
    avatarUrl: customer.avatarUrl || '',
  });

  useEffect(() => {
    if (customer && profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        birthDate: profile.birthDate || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        postalCode: profile.postalCode || '',
        taxId: profile.taxId || '',
        companyName: profile.companyName || '',
        newsletter: profile.newsletter || false,
        avatarUrl: customer.avatarUrl || '',
      });
    }
  }, [customer, profile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (formData.phone && !/^\+?[0-9\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (formData.avatarUrl && !/^https?:\/\/.+/.test(formData.avatarUrl)) {
      newErrors.avatarUrl = 'Invalid URL format';
    }
    if (isSuperAdmin && newPassword && newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: customer.id,
        data: formData,
      });

      // SUPER_ADMIN can also reset the customer's password from here.
      if (isSuperAdmin && newPassword.trim()) {
        await resetPasswordMutation.mutateAsync({
          id: customer.id,
          newPassword,
        });
        toast.success('Customer updated and password reset successfully');
      } else {
        toast.success('Customer updated successfully');
      }

      setNewPassword('');
      setShowPassword(false);
      setOpen(false);
      setErrors({});
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update customer';
      toast.error(errorMessage);
      console.error('Error updating customer:', error);
    }
  };

  const handleChange = (field: keyof UpdateCustomerRequest, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Clear sensitive/transient state when the sheet is dismissed.
      setNewPassword('');
      setShowPassword(false);
      setErrors({});
    }
    setOpen(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4 mr-1" />
          Edit Customer
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Customer Information</SheetTitle>
          <SheetDescription>
            Update customer profile details. Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="John"
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1234567890"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate ? formData.birthDate.split('T')[0] : ''}
                onChange={(e) => handleChange('birthDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => handleChange('avatarUrl', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className={errors.avatarUrl ? 'border-destructive' : ''}
              />
              {errors.avatarUrl && (
                <p className="text-xs text-destructive">{errors.avatarUrl}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Address</h3>
            
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="USA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Business Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="ACME Corp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                placeholder="TAX-123456"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Preferences</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="newsletter">Newsletter Subscription</Label>
                <p className="text-xs text-muted-foreground">
                  Receive marketing emails and updates
                </p>
              </div>
              <Switch
                id="newsletter"
                checked={formData.newsletter}
                onCheckedChange={(checked) => handleChange('newsletter', checked)}
              />
            </div>
          </div>

          {/* Security — SUPER_ADMIN only */}
          {isSuperAdmin && (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="size-4" />
                Security
              </h3>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Reset Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.newPassword;
                          return next;
                        });
                      }
                    }}
                    placeholder="Leave blank to keep current password"
                    className={`pr-10 ${errors.newPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword ? (
                  <p className="text-xs text-destructive">{errors.newPassword}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Set a new password for this customer (min 8 characters). The
                    existing password can't be viewed — you can only replace it.
                    Leave blank to keep the current one.
                  </p>
                )}
              </div>
            </div>
          )}

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
