import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/shared/components/ui/separator';
import { ImageFile, ProductFormImageUpload } from '@/modules/products/components/product-form-image-upload';
import { ProductFormVariants } from '@/modules/products/components/product-form-variants';
import { ProductFormHeader } from '@/modules/products/components/product-form/product-form-header';
import { ProductFormBasicInfo } from '@/modules/products/components/product-form/product-form-basic-info';
import { ProductFormCategoryBrand } from '@/modules/products/components/product-form/product-form-category-brand';
import { ProductFormTagInput } from '@/modules/products/components/product-form/product-form-tag-input';
import { useProductCategories } from '@/modules/products/hooks/use-product-categories';
import { useProductBrands } from '@/modules/products/hooks/use-product-brands';
import { useCreateProduct, useUpdateProduct, useProduct } from '@/modules/products/hooks/use-products';
import { ProductRequest } from '../types/product.type';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function ProductFormPage() {
  useDocumentTitle('Product Form');
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!productId;
  const isNewMode = !productId;

  // Form state
  const [productName, setProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  // Fetch data
  const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();
  const { data: brands = [], isLoading: brandsLoading } = useProductBrands();
  const { data: product = null, isLoading: productLoading } = useProduct(productId || '');

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isFetching = productLoading;

  useEffect(() => {
    if (!isEditMode || !productId) {
      return;
    }

    if (product) {
      setProductName(product.name);
      setSlug(product.slug);
      setSku(product.defaultVariant?.sku || '');
      setPrice(product.defaultVariant?.price || 0);
      setCost(product.defaultVariant?.cost || 0);
      setDescription(product.description || '');
      setCategoryId(product.categoryId || '');
      setBrandId(product.brandId || '');
      setStatus(product.isActive ? 'published' : 'draft');
      setIsFeatured(product.isFeatured || false);
      setTags(product.tags || []);
      setImageUrls(product.imageUrls || []);
      setVariants(product.variants || []);
    }
  }, [isEditMode, productId, product]);

  // Auto-generate slug from product name
  useEffect(() => {
    if (isNewMode && productName) {
      const generatedSlug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [productName, isNewMode]);

  const handleSave = async () => {
    if (!productName.trim() || !slug.trim()) {
      toast.error('Please fill in required fields (Product Name and Slug)');
      return;
    }

    const productData: ProductRequest = {
      name: productName,
      slug: slug,
      description: description || undefined,
      sku: sku,
      price: parseFloat(price.toString()),
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      isActive: status === 'published',
      isFeatured: isFeatured,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
      imageUrls: imageUrls,
      tags: tags.length > 0 ? tags : undefined,
    };

    try {
      if (isNewMode) {
        const result = await createMutation.mutateAsync(productData);
        toast.success('Product created successfully');
        navigate(`/products/${result.id}`);
      } else if (productId) {
        await updateMutation.mutateAsync({ id: productId, data: productData });
        toast.success('Product updated successfully');
        navigate(`/products/${productId}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleUploadComplete = useCallback((images: ImageFile[]) => {
    const uploadedUrls = images
      .map((img) => img.uploadResponse?.url)
      .filter((url): url is string => !!url);

    setImageUrls(uploadedUrls);
  }, []);

  const handleAllImagesChange = useCallback((urls: string[]) => {
    setImageUrls(urls);
  }, []);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <ProductFormHeader
        isEditMode={isEditMode}
        productId={productId}
        status={status}
        setStatus={setStatus}
        isLoading={isLoading}
        onBack={() => navigate(productId ? `/products/${productId}` : '/products')}
        onCancel={() => navigate(productId ? `/products/${productId}` : '/products')}
        onSave={handleSave}
      />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <ProductFormBasicInfo
            productName={productName}
            setProductName={setProductName}
            slug={slug}
            setSlug={setSlug}
            sku={sku}
            setSku={setSku}
            price={price}
            setPrice={setPrice}
            cost={cost}
            setCost={setCost}
            description={description}
            setDescription={setDescription}
            isFeatured={isFeatured}
            setIsFeatured={setIsFeatured}
            isLoading={isLoading}
          />

          {/* Category & Brand */}
          <ProductFormCategoryBrand
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            brandId={brandId}
            setBrandId={setBrandId}
            categories={categories}
            brands={brands}
            categoriesLoading={categoriesLoading}
            brandsLoading={brandsLoading}
            isLoading={isLoading}
          />

          {/* Variants - Only show in edit mode */}
          {isEditMode && productId && (
            <ProductFormVariants
              productId={productId}
              mode="edit"
              variants={variants}
              onVariantsChange={setVariants}
            />
          )}
        </div>

        {/* Right Column - Images & Tags */}
        <div className="space-y-6">
          <ProductFormImageUpload
            mode={isEditMode ? 'edit' : 'new'}
            initialImages={isEditMode && productId && product ? product.imageUrls || [] : []}
            onUploadComplete={handleUploadComplete}
            onAllImagesChange={handleAllImagesChange}
          />

          <Separator className="w-full" />

          <ProductFormTagInput tags={tags} setTags={setTags} />
        </div>
      </div>
    </div>
  );
}
