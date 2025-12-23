import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { useClub, useUpdateClub } from '../hooks/use-clubs';
import { ClubImageUpload } from '../components/club-image-upload';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function ClubEditPage() {
  useDocumentTitle('Edit Club');
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!clubId;

  // Fetch club data if editing
  const { data: club, isLoading: clubLoading } = useClub(clubId);
  const updateMutation = useUpdateClub();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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
  const [isActive, setIsActive] = useState(true);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && club) {
      setName(club.name);
      setDescription(club.description || '');
      setLogoUrl(club.logoUrl || '');
      setImageUrl(club.imageUrl || '');
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
      setIsActive(club.isActive);
    }
  }, [isEditMode, club]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a club name');
      return;
    }

    if (!clubId) {
      toast.error('Club ID is missing');
      return;
    }

    const clubData = {
      name,
      description: description || undefined,
      logoUrl: logoUrl || undefined,
      imageUrl: imageUrl || undefined,
      websiteUrl: websiteUrl || undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      country: country || undefined,
      postalCode: postalCode || undefined,
      personInCharge: personInCharge || undefined,
      personInChargeEmail: personInChargeEmail || undefined,
      personInChargePhone: personInChargePhone || undefined,
      isActive,
    };

    try {
      await updateMutation.mutateAsync({ id: clubId, data: clubData });
      navigate(`/clubs/${clubId}`);
    } catch (error) {
      console.error('Error saving club:', error);
    }
  };

  const handleCancel = () => {
    if (clubId) {
      navigate(`/clubs/${clubId}`);
    } else {
      navigate('/clubs');
    }
  };

  if (isEditMode && clubLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Club' : 'New Club'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="mono"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">
                  Club Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter club name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter club description"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="club@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Person in Charge */}
          <Card>
            <CardHeader>
              <CardTitle>Person in Charge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="personInCharge">Name</Label>
                <Input
                  id="personInCharge"
                  value={personInCharge}
                  onChange={(e) => setPersonInCharge(e.target.value)}
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <Label htmlFor="personInChargeEmail">Email</Label>
                <Input
                  id="personInChargeEmail"
                  type="email"
                  value={personInChargeEmail}
                  onChange={(e) => setPersonInChargeEmail(e.target.value)}
                  placeholder="person@example.com"
                />
              </div>
              <div>
                <Label htmlFor="personInChargePhone">Phone</Label>
                <Input
                  id="personInChargePhone"
                  type="tel"
                  value={personInChargePhone}
                  onChange={(e) => setPersonInChargePhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Media & Status */}
        <div className="space-y-6">
          {/* Logo & Image */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ClubImageUpload
                label="Club Logo"
                description="Upload a square logo for your club"
                currentImageUrl={logoUrl}
                aspectRatio="square"
                onImageChange={(url) => setLogoUrl(url)}
                onImageRemove={() => setLogoUrl('')}
              />
              <ClubImageUpload
                label="Cover Image"
                description="Upload a cover image for your club"
                currentImageUrl={imageUrl}
                aspectRatio="wide"
                onImageChange={(url) => setImageUrl(url)}
                onImageRemove={() => setImageUrl('')}
              />
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Controls whether this club is active
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </CardContent>
          </Card>

          {/* Metadata (if editing) */}
          {isEditMode && club && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{new Date(club.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{new Date(club.updatedAt).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
