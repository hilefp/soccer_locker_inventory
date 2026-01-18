import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Package } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { VariantDetailHeader } from '@/modules/products/components/variant-detail/variant-detail-header';
import { VariantDetailBasicInfo } from '@/modules/products/components/variant-detail/variant-detail-basic-info';
import { VariantDetailPricing } from '@/modules/products/components/variant-detail/variant-detail-pricing';
import { VariantDetailPhysicalAttributes } from '@/modules/products/components/variant-detail/variant-detail-physical-attributes';
import { VariantDetailAttributesStatus } from '@/modules/products/components/variant-detail/variant-detail-attributes-status';
import { useProductVariant, useUpdateProductVariant, useDeleteProductVariant, useSetDefaultVariant } from '@/modules/products/hooks/use-product-variants';
import { useProduct } from '@/modules/products/hooks/use-products';
import { ProductVariant } from '@/modules/products/types/product.type';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function VariantDetailPage() {
  useDocumentTitle('Variant Details');
  const { productId, variantId } = useParams<{ productId: string; variantId: string }>();
  const navigate = useNavigate();

  const { data: variant, isLoading: isLoadingVariant } = useProductVariant(variantId || '');
  const { data: product } = useProduct(productId || '');
  const updateMutation = useUpdateProductVariant();
  const deleteMutation = useDeleteProductVariant();
  const setDefaultMutation = useSetDefaultVariant();

  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!productId || !variantId) {
      navigate('/products');
    }
  }, [productId, variantId, navigate]);

  useEffect(() => {
    if (variant) {
      setEditingVariant(variant);
    }
  }, [variant]);

  const handleSave = async () => {
    if (!editingVariant || !variantId) return;

    try {
      await updateMutation.mutateAsync({
        variantId,
        data: {
          sku: editingVariant.sku,
          barcode: editingVariant.barcode,
          attributes: editingVariant.attributes,
          price: editingVariant.price,
          compareAtPrice: editingVariant.compareAtPrice,
          cost: editingVariant.cost,
          weight: editingVariant.weight,
          weightUnit: editingVariant.weightUnit,
          dimensions: editingVariant.dimensions,
          dimensionUnit: editingVariant.dimensionUnit,
          imageUrl: editingVariant.imageUrl,
          imageUrls: editingVariant.imageUrls,
          isActive: editingVariant.isActive,
        },
      });
    } catch (error) {
      console.error('Error saving variant:', error);
    }
  };

  const handleDelete = async () => {
    if (!variantId) return;

    try {
      await deleteMutation.mutateAsync(variantId);
      navigate(`/products/${productId}`);
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  const handleSetDefault = async () => {
    if (!productId || !variantId) return;

    try {
      await setDefaultMutation.mutateAsync({ productId, variantId });
    } catch (error) {
      console.error('Error setting default variant:', error);
    }
  };

  if (isLoadingVariant) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!variant || !editingVariant) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Package className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Variant not found</h2>
        <Button onClick={() => navigate(`/products/${productId}`)}>
          Back to Product
        </Button>
      </div>
    );
  }

  const isSaving = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isSettingDefault = setDefaultMutation.isPending;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <VariantDetailHeader
        isActive={editingVariant.isActive !== false}
        isDefault={editingVariant.isDefault === true}
        productName={product?.name}
        onBack={() => navigate(`/products/${productId}`)}
        onDelete={() => setShowDeleteDialog(true)}
        onSave={handleSave}
        onSetDefault={handleSetDefault}
        isDeleting={isDeleting}
        isSaving={isSaving}
        isSettingDefault={isSettingDefault}
      />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <VariantDetailBasicInfo
          sku={editingVariant.sku}
          setSku={(value) => setEditingVariant({ ...editingVariant, sku: value })}
          barcode={editingVariant.barcode || ''}
          setBarcode={(value) => setEditingVariant({ ...editingVariant, barcode: value })}
          imageUrl={editingVariant.imageUrl || ''}
          setImageUrl={(value) => setEditingVariant({ ...editingVariant, imageUrl: value })}
          isSaving={isSaving}
        />

        {/* Pricing */}
        <VariantDetailPricing
          price={editingVariant.price}
          setPrice={(value) => setEditingVariant({ ...editingVariant, price: value })}
          compareAtPrice={editingVariant.compareAtPrice}
          setCompareAtPrice={(value) =>
            setEditingVariant({ ...editingVariant, compareAtPrice: value })
          }
          cost={editingVariant.cost}
          setCost={(value) => setEditingVariant({ ...editingVariant, cost: value })}
          isSaving={isSaving}
        />

        {/* Physical Attributes */}
        <VariantDetailPhysicalAttributes
          weight={editingVariant.weight}
          setWeight={(value) => setEditingVariant({ ...editingVariant, weight: value })}
          weightUnit={editingVariant.weightUnit || 'kg'}
          setWeightUnit={(value) =>
            setEditingVariant({ ...editingVariant, weightUnit: value })
          }
          dimensions={editingVariant.dimensions}
          setDimensions={(value) =>
            setEditingVariant({ ...editingVariant, dimensions: value })
          }
          dimensionUnit={editingVariant.dimensionUnit || 'cm'}
          setDimensionUnit={(value) =>
            setEditingVariant({ ...editingVariant, dimensionUnit: value })
          }
          isSaving={isSaving}
        />

        {/* Attributes & Status */}
        <VariantDetailAttributesStatus
          attributes={editingVariant.attributes}
          isActive={editingVariant.isActive !== false}
          setIsActive={(value) => setEditingVariant({ ...editingVariant, isActive: value })}
          isSaving={isSaving}
        />

        {/* Preview Image */}
        {editingVariant.imageUrl && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Image Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video max-w-md rounded-lg border overflow-hidden bg-accent/20">
                <img
                  src={editingVariant.imageUrl}
                  alt={`Variant ${editingVariant.sku}`}
                  className="object-contain w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the variant
              "{editingVariant.sku}" from the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
