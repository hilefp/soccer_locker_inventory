'use client';

import { useEffect, useState } from 'react';
import {
  useCreateClub,
  useDeleteClub,
  useClub,
  useUpdateClub,
} from '../hooks/use-clubs';
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
import { Textarea } from '@/shared/components/ui/textarea';
import { ImageIcon, X } from 'lucide-react';

function ClubLogoUpload({
  logoUrl,
  onLogoChange,
}: {
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}) {
  const [selectedLogo, setSelectedLogo] = useState<string | null>(logoUrl);

  useEffect(() => {
    setSelectedLogo(logoUrl);
  }, [logoUrl]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedLogo(result);
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="w-full h-[200px] bg-accent/50 border border-border rounded-lg flex items-center justify-center">
          {selectedLogo ? (
            <div className="relative flex items-center justify-center w-full h-full">
              <img
                src={selectedLogo}
                alt="Club Logo"
                className="h-[140px] object-contain"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 size-6"
                onClick={() => {
                  setSelectedLogo(null);
                  onLogoChange(null);
                }}
              >
                <X className="size-3" />
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="club-logo-upload"
              />
              <label htmlFor="club-logo-upload" className="absolute bottom-3 right-3">
                <Button size="sm" variant="outline" asChild>
                  <span>Change</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <ImageIcon className="size-[35px] text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="club-logo-upload-empty"
              />
              <label htmlFor="club-logo-upload-empty" className="absolute bottom-3 right-3">
                <Button size="sm" variant="outline" asChild>
                  <span>Upload</span>
                </Button>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ClubFormSheet({
  mode,
  open,
  onOpenChange,
  clubId,
  onSuccess,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId?: string;
  onSuccess?: () => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [personInCharge, setPersonInCharge] = useState('');
  const [personInChargeEmail, setPersonInChargeEmail] = useState('');
  const [personInChargePhone, setPersonInChargePhone] = useState('');
  const [status, setStatus] = useState('active');

  // React Query hooks
  const { data: club, isLoading: isFetchingClub } = useClub(
    isEditMode ? clubId : undefined,
  );
  const createMutation = useCreateClub();
  const updateMutation = useUpdateClub();
  const deleteMutation = useDeleteClub();

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // Load club data when editing
  useEffect(() => {
    if (!isEditMode || !clubId || !open || !club) {
      return;
    }

    setName(club.name);
    setDescription(club.description || '');
    setImageUrl(club.imageUrl || null);
    setLogoUrl(club.logoUrl || null);
    setWebsiteUrl(club.websiteUrl || '');
    setEmail(club.email || '');
    setPhone(club.phone || '');
    setAddress(club.address || '');
    setCity(club.city || '');
    setState(club.state || '');
    setCountry(club.country || '');
    setPostalCode(club.postalCode || '');
    setPersonInCharge(club.personInCharge || '');
    setPersonInChargeEmail(club.personInChargeEmail || '');
    setPersonInChargePhone(club.personInChargePhone || '');
    setStatus(club.isActive ? 'active' : 'inactive');
  }, [isEditMode, clubId, open, club]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setImageUrl(null);
      setLogoUrl(null);
      setWebsiteUrl('');
      setEmail('');
      setPhone('');
      setAddress('');
      setCity('');
      setState('');
      setCountry('');
      setPostalCode('');
      setPersonInCharge('');
      setPersonInChargeEmail('');
      setPersonInChargePhone('');
      setStatus('active');
    }
  }, [open]);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    const clubData = {
      name: name.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl || undefined,
      logoUrl: logoUrl || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      country: country.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      personInCharge: personInCharge.trim() || undefined,
      personInChargeEmail: personInChargeEmail.trim() || undefined,
      personInChargePhone: personInChargePhone.trim() || undefined,
      isActive: status === 'active',
    };

    try {
      if (isNewMode) {
        await createMutation.mutateAsync(clubData);
      } else if (clubId) {
        await updateMutation.mutateAsync({
          id: clubId,
          data: clubData,
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving club:', error);
    }
  };

  const handleDelete = async () => {
    if (!clubId) return;

    if (!confirm('Are you sure you want to delete this club?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(clubId);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting club:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Add Club' : 'Edit Club'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea
            className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="space-y-6">
              {/* Logo Upload */}
              <ClubLogoUpload logoUrl={logoUrl} onLogoChange={setLogoUrl} />

              {/* Club Name */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Club Name *</Label>
                <Input
                  placeholder="FC Barcelona Youth Academy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading || isFetchingClub}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                  placeholder="Youth soccer academy..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={isLoading || isFetchingClub}
                />
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Website URL</Label>
                <Input
                  type="url"
                  placeholder="https://club.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={isLoading || isFetchingClub}
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input
                    type="email"
                    placeholder="contact@club.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isFetchingClub}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading || isFetchingClub}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Address</Label>
                <Input
                  placeholder="123 Stadium Ave"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isLoading || isFetchingClub}
                />
              </div>

              {/* City, State, Postal Code */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">City</Label>
                  <Input
                    placeholder="Barcelona"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isLoading || isFetchingClub}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">State</Label>
                  <Input
                    placeholder="Catalonia"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={isLoading || isFetchingClub}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Postal Code</Label>
                  <Input
                    placeholder="08028"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    disabled={isLoading || isFetchingClub}
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Country</Label>
                <Input
                  placeholder="Spain"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={isLoading || isFetchingClub}
                />
              </div>

              {/* Person in Charge */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Person in Charge</Label>
                <Input
                  placeholder="John Smith"
                  value={personInCharge}
                  onChange={(e) => setPersonInCharge(e.target.value)}
                  disabled={isLoading || isFetchingClub}
                />
              </div>

              {/* Person in Charge Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Contact Email</Label>
                  <Input
                    type="email"
                    placeholder="manager@club.com"
                    value={personInChargeEmail}
                    onChange={(e) => setPersonInChargeEmail(e.target.value)}
                    disabled={isLoading || isFetchingClub}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Contact Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1987654321"
                    value={personInChargePhone}
                    onChange={(e) => setPersonInChargePhone(e.target.value)}
                    disabled={isLoading || isFetchingClub}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                  disabled={isLoading || isFetchingClub}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t p-5">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Close
            </Button>
            {isEditMode && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading || isFetchingClub}
              >
                Delete
              </Button>
            )}
            <Button
              variant="mono"
              onClick={handleSave}
              disabled={isLoading || isFetchingClub || !name.trim()}
            >
              {isLoading
                ? 'Saving...'
                : isFetchingClub
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
