import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Loader2, Building2, Plus } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useClub } from '../hooks/use-clubs';
import { useClubProducts, useClubProductStats } from '../hooks/use-club-products';
import { ClubProductsTable } from '../components/club-products-table';
import { AddProductsToClubDialog } from '../components/add-products-to-club-dialog';
import { EditClubProductSheet } from '../components/edit-club-product-sheet';
import { ClubProduct } from '../types/club-product';

export function ClubDetailPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  // Fetch club data
  const { data: club, isLoading: clubLoading } = useClub(clubId);

  // Fetch club products
  const { data: clubProductsResponse, isLoading: productsLoading } =
    useClubProducts(clubId);
  const clubProducts = clubProductsResponse?.data || [];

  // Fetch product stats
  const { data: stats } = useClubProductStats(clubId);

  // Dialog/Sheet state
  const [isAddProductsOpen, setIsAddProductsOpen] = useState(false);
  const [selectedClubProduct, setSelectedClubProduct] =
    useState<ClubProduct | null>(null);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);

  const handleEditProduct = (clubProduct: ClubProduct) => {
    setSelectedClubProduct(clubProduct);
    setIsEditProductOpen(true);
  };

  if (clubLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Building2 className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Club not found</h2>
        <Button onClick={() => navigate('/clubs')}>Back to Clubs</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clubs')}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            {club.logoUrl && (
              <div className="flex items-center justify-center rounded-md bg-accent/50 h-[50px] w-[60px]">
                <img
                  src={club.logoUrl}
                  alt={club.name}
                  className="h-[40px] w-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{club.name}</h1>
              <p className="text-sm text-muted-foreground">
                {club.city && club.country
                  ? `${club.city}, ${club.country}`
                  : 'No location'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={club.isActive ? 'success' : 'secondary'}>
            {club.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button onClick={() => navigate(`/clubs/${clubId}/edit`)}>
            <Edit className="size-4 mr-2" />
            Edit Club
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="products">
            Products ({stats?.totalProducts || 0})
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Club Name
                  </p>
                  <p className="text-base">{club.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-base">
                    {club.description || 'No description'}
                  </p>
                </div>
                {club.websiteUrl && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Website
                    </p>
                    <a
                      href={club.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-primary hover:underline"
                    >
                      {club.websiteUrl}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-base">{club.email || 'No email'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-base">{club.phone || 'No phone'}</p>
                </div>
                {club.personInCharge && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Person in Charge
                    </p>
                    <p className="text-base">{club.personInCharge}</p>
                    {club.personInChargeEmail && (
                      <p className="text-sm text-muted-foreground">
                        {club.personInChargeEmail}
                      </p>
                    )}
                    {club.personInChargePhone && (
                      <p className="text-sm text-muted-foreground">
                        {club.personInChargePhone}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {club.address && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Address
                    </p>
                    <p className="text-base">{club.address}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      City
                    </p>
                    <p className="text-base">{club.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      State
                    </p>
                    <p className="text-base">{club.state || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Country
                    </p>
                    <p className="text-base">{club.country || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Postal Code
                    </p>
                    <p className="text-base">{club.postalCode || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p className="text-base">
                    {club.createdAt
                      ? new Date(club.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </p>
                  <p className="text-base">
                    {club.updatedAt
                      ? new Date(club.updatedAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {stats.totalProducts}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total Products
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {stats.activeProducts}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active Products
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{stats.inStock}</div>
                  <p className="text-xs text-muted-foreground">In Stock</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{stats.outOfStock}</div>
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Add Products Button */}
          <div className="flex justify-end">
            <Button
              variant="mono"
              onClick={() => setIsAddProductsOpen(true)}
            >
              <Plus className="size-4 mr-2" />
              Add Products
            </Button>
          </div>

          {/* Products Table */}
          <ClubProductsTable
            clubId={clubId!}
            clubProducts={clubProducts}
            isLoading={productsLoading}
            onEditProduct={handleEditProduct}
          />
        </TabsContent>
      </Tabs>

      {/* Add Products Dialog */}
      <AddProductsToClubDialog
        clubId={clubId!}
        open={isAddProductsOpen}
        onOpenChange={setIsAddProductsOpen}
        existingClubProducts={clubProducts}
      />

      {/* Edit Club Product Sheet */}
      <EditClubProductSheet
        clubId={clubId!}
        clubProduct={selectedClubProduct}
        open={isEditProductOpen}
        onOpenChange={setIsEditProductOpen}
      />
    </div>
  );
}
