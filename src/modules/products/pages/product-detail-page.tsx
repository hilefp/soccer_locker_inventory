import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Loader2, Package, Image as ImageIcon, Tags as TagsIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useProduct } from '@/modules/products/hooks/use-products';

// Helper to safely format price
const formatPrice = (price: number | string | undefined | null): string => {
  if (price === undefined || price === null) return '0.00';
  return Number(price).toFixed(2);
};

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  const { data: product, isLoading } = useProduct(productId || '');

  useEffect(() => {
    if (!productId) {
      navigate('/products');
    }
  }, [productId, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Package className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
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
            onClick={() => navigate('/products')}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground">
              SKU: {product.defaultVariant?.sku || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={product.isActive ? 'success' : 'secondary'}>
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {product.isFeatured && (
            <Badge variant="outline">Featured</Badge>
          )}
          <Button onClick={() => navigate(`/products/${productId}/edit`)}>
            <Edit className="size-4 mr-2" />
            Edit Product
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="variants">
            Variants ({product.variants?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
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
                  <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                  <p className="text-base">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Slug</p>
                  <p className="text-base font-mono text-sm">{product.slug}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-base">{product.description || 'No description'}</p>
                </div>
                {product.model && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Model</p>
                    <p className="text-base">{product.model}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category & Brand */}
            <Card>
              <CardHeader>
                <CardTitle>Category & Brand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-base">
                    {product.category?.name || 'Uncategorized'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Brand</p>
                  <p className="text-base">
                    {product.brand?.name || 'No brand'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">
                    ${formatPrice(product.defaultVariant?.price)}
                  </p>
                </div>
                {product.minPrice !== product.maxPrice && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price Range</p>
                    <p className="text-base">
                      ${formatPrice(product.minPrice)} - ${formatPrice(product.maxPrice)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-base">
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-base">
                    {product.updatedAt
                      ? new Date(product.updatedAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
            </CardHeader>
            <CardContent>
              {!product.variants || product.variants.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="size-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No variants available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Edit the product to add variants
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Attributes</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Compare At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell>
                          <span className="font-medium">{variant.sku}</span>
                          {variant.barcode && (
                            <span className="block text-xs text-muted-foreground">
                              {variant.barcode}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <span
                                key={key}
                                className="px-2 py-0.5 text-xs rounded-full bg-accent text-foreground"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${formatPrice(variant.price)}
                        </TableCell>
                        <TableCell>
                          {variant.compareAtPrice ? (
                            <span className="text-muted-foreground line-through">
                              ${formatPrice(variant.compareAtPrice)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={variant.isActive !== false ? 'success' : 'secondary'}>
                            {variant.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/products/${productId}/variants/${variant.id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              {!product.imageUrls || product.imageUrls.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="size-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No images available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {product.imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg border overflow-hidden bg-accent/20"
                    >
                      <img
                        src={url}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="primary" className="text-xs">
                            Primary
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Tags</CardTitle>
            </CardHeader>
            <CardContent>
              {!product.tags || product.tags.length === 0 ? (
                <div className="text-center py-12">
                  <TagsIcon className="size-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tags available</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
