import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
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

  // Step wizard state (only for new mode)
  const [currentStep, setCurrentStep] = useState(1);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

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
    if (isNewMode && productName && currentStep === 1) {
      const generatedSlug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [productName, isNewMode, currentStep]);

  // Validate step 1 fields
  const validateStep1 = (): boolean => {
    if (!productName.trim()) {
      toast.error('Product Name is required');
      return false;
    }
    if (!slug.trim()) {
      toast.error('Slug is required');
      return false;
    }
    return true;
  };

  // Step 1 → Create product and move to step 2
  const handleCreateAndContinue = async () => {
    if (!validateStep1()) return;

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
      const result = await createMutation.mutateAsync(productData);
      setCreatedProductId(result.id!);
      setVariants(result.variants || []);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  // Edit mode save
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
      ...(isNewMode && variants.length > 0 ? { variants } : {}),
    };

    try {
      if (productId) {
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

  // ─── NEW MODE: Step-by-Step Wizard ───────────────────────────────
  if (isNewMode) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentStep === 2) {
                  // Already created product, go to its detail page
                  navigate(`/products/${createdProductId}`);
                } else {
                  navigate('/products');
                }
              }}
              disabled={isLoading}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create New Product</h1>
              <p className="text-sm text-muted-foreground">
                {currentStep === 1 ? 'Step 1 of 2 — Product Information' : 'Step 2 of 2 — Generate Variants'}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center size-8 rounded-full text-sm font-medium transition-colors ${
                  currentStep >= 1
                    ? 'bg-foreground text-background'
                    : 'bg-accent text-muted-foreground'
                }`}
              >
                {currentStep > 1 ? <Check className="size-4" /> : '1'}
              </div>
              <span className={`text-sm ${currentStep >= 1 ? 'font-medium' : 'text-muted-foreground'}`}>
                Product Info
              </span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center size-8 rounded-full text-sm font-medium transition-colors ${
                  currentStep >= 2
                    ? 'bg-foreground text-background'
                    : 'bg-accent text-muted-foreground'
                }`}
              >
                2
              </div>
              <span className={`text-sm ${currentStep >= 2 ? 'font-medium' : 'text-muted-foreground'}`}>
                Variants
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Product Information */}
        {currentStep === 1 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
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
              </div>

              <div className="space-y-6">
                <ProductFormImageUpload
                  mode="new"
                  initialImages={[]}
                  onUploadComplete={handleUploadComplete}
                  onAllImagesChange={handleAllImagesChange}
                />

                <Separator className="w-full" />

                <ProductFormTagInput tags={tags} setTags={setTags} />
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/products')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="mono"
                onClick={handleCreateAndContinue}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creating Product...
                  </>
                ) : (
                  <>
                    Create & Continue to Variants
                    <ArrowRight className="size-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Generate Variants */}
        {currentStep === 2 && createdProductId && (
          <>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-primary/10">
                  <Check className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Product created successfully!</p>
                  <p className="text-xs text-muted-foreground">
                    Now generate variants for <span className="font-medium">{productName}</span> using product attributes.
                  </p>
                </div>
              </div>
            </div>

            <ProductFormVariants
              productId={createdProductId}
              mode="edit"
              variants={variants}
              onVariantsChange={setVariants}
            />

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {variants.length > 0
                  ? `${variants.length} variant${variants.length !== 1 ? 's' : ''} created`
                  : 'No variants generated yet — you can skip and add them later'}
              </p>
              <Button
                variant="mono"
                onClick={() => navigate(`/products/${createdProductId}`)}
              >
                <Check className="size-4 mr-2" />
                {variants.length > 0 ? 'Done — View Product' : 'Skip & View Product'}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── EDIT MODE: Same as before ───────────────────────────────────
  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProductFormHeader
        isEditMode={isEditMode}
        productId={productId}
        status={status}
        setStatus={setStatus}
        isLoading={isLoading}
        onBack={() => navigate(`/products/${productId}`)}
        onCancel={() => navigate(`/products/${productId}`)}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

          {productId && (
            <ProductFormVariants
              productId={productId}
              mode="edit"
              variants={variants}
              onVariantsChange={setVariants}
            />
          )}
        </div>

        <div className="space-y-6">
          <ProductFormImageUpload
            mode="edit"
            initialImages={product ? product.imageUrls || [] : []}
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
