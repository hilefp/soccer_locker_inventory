import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Package,
  Plus,
  Pencil,
  Trash2,
  Building2,
  Tag,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useClub } from '../hooks/use-clubs';
import { useClubPackages } from '../hooks/use-club-packages';
import { DeletePackageDialog } from '../components/delete-package-dialog';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function PackageListPage() {
  useDocumentTitle('Packages');
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();

  const { data: club, isLoading: clubLoading } = useClub(clubId);
  const { data: packages = [], isLoading: packagesLoading } = useClubPackages(clubId);

  const [deletePackageId, setDeletePackageId] = useState<string | null>(null);
  const [deletePackageName, setDeletePackageName] = useState('');

  const isLoading = clubLoading || packagesLoading;

  const handleDelete = (packageId: string, name: string) => {
    setDeletePackageId(packageId);
    setDeletePackageName(name);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Building2 className="size-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Club not found</h2>
          <Button onClick={() => navigate('/clubs')}>Back to Clubs</Button>
        </div>
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
            onClick={() => navigate(`/clubs/${clubId}`)}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Club
          </Button>
          <div className="flex items-center gap-3">
            {club.logoUrl && (
              <div className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px]">
                <img
                  src={club.logoUrl}
                  alt={club.name}
                  className="h-[30px] w-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">Packages</h1>
              <p className="text-sm text-muted-foreground">{club.name}</p>
            </div>
          </div>
        </div>
        <Button
          variant="mono"
          onClick={() => navigate(`/clubs/${clubId}/packages/create`)}
        >
          <Plus className="size-4 mr-2" />
          Create Package
        </Button>
      </div>

      {/* Package List */}
      {packages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Package className="size-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">No packages yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a package to bundle multiple different products together as a single purchasable unit.
              </p>
            </div>
            <Button
              variant="mono"
              onClick={() => navigate(`/clubs/${clubId}/packages/create`)}
            >
              <Plus className="size-4 mr-2" />
              Create Your First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const imageUrl = pkg.imageUrls?.[0];
            const itemCount = pkg.items?.length ?? 0;
            const totalQuantity = pkg.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

            return (
              <Card
                key={pkg.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  {/* Image */}
                  <div className="flex items-center justify-center bg-accent/30 h-[160px]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={pkg.name}
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <Package className="size-12 text-muted-foreground" />
                    )}
                  </div>
                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={pkg.isActive ? 'success' : 'secondary'}
                      appearance="light"
                      className="text-xs"
                    >
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Package name */}
                  <div>
                    <h3 className="font-semibold text-base line-clamp-1">{pkg.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {itemCount} product{itemCount !== 1 ? 's' : ''} ({totalQuantity} item{totalQuantity !== 1 ? 's' : ''} total)
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">Package Price</span>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(pkg.price)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <p
                      className="text-xs text-muted-foreground line-clamp-2 [&_ul]:list-disc [&_ul]:pl-4"
                      dangerouslySetInnerHTML={{ __html: pkg.description }}
                    />
                  )}

                  {/* Tags */}
                  {pkg.tags && pkg.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="size-3 text-muted-foreground" />
                      {pkg.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5">
                          {tag}
                        </Badge>
                      ))}
                      {pkg.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{pkg.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Item thumbnails */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {pkg.items?.slice(0, 5).map((item) => {
                      const itemImg =
                        item.clubProduct?.imageUrls?.[0] ||
                        item.clubProduct?.product?.imageUrl ||
                        item.clubProduct?.product?.imageUrls?.[0];
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-center rounded-md bg-accent/50 h-[32px] w-[38px] shrink-0"
                          title={`${item.clubProduct?.name || item.clubProduct?.product?.name || 'Product'} x${item.quantity}`}
                        >
                          {itemImg ? (
                            <img
                              src={itemImg}
                              className="h-[24px] w-full object-contain"
                              alt=""
                            />
                          ) : (
                            <Package className="size-3.5 text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
                    {itemCount > 5 && (
                      <span className="text-xs text-muted-foreground">
                        +{itemCount - 5} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/clubs/${clubId}/packages/${pkg.id}/edit`)}
                    >
                      <Pencil className="size-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(pkg.id, pkg.name)}
                    >
                      <Trash2 className="size-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeletePackageDialog
        clubId={clubId!}
        packageId={deletePackageId}
        packageName={deletePackageName}
        open={!!deletePackageId}
        onOpenChange={(open) => {
          if (!open) setDeletePackageId(null);
        }}
      />
    </div>
  );
}
