'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { ArrowLeft, Heart, ShoppingBag, Minus, Plus, ChevronRight, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ProductCard } from './ProductCard';

export function ProductDetailPage() {
  const {
    selectedProductId,
    productDetail,
    setProductDetail,
    setLoadingProduct,
    isLoadingProduct,
    products,
    addToCart,
    navigateTo,
  } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'attributes'>('description');

  useEffect(() => {
    async function fetchProduct() {
      if (!selectedProductId) return;
      setLoadingProduct(true);
      try {
        const res = await fetch(`/api/products/${selectedProductId}`);
        if (res.ok) {
          const data = await res.json();
          setProductDetail(data);
          // Reset selections
          setSelectedImageIndex(0);
          setSelectedColor(null);
          setSelectedSize(null);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoadingProduct(false);
      }
    }
    fetchProduct();
  }, [selectedProductId, setLoadingProduct, setProductDetail]);

  if (isLoadingProduct || !productDetail) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-sm" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-sm" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  let images: string[] = [];
  try {
    images = JSON.parse(productDetail.images);
  } catch {
    images = [];
  }

  const colors = [...new Set(productDetail.variants.filter((v) => v.color).map((v) => v.color!))];
  const sizes = [...new Set(productDetail.variants.filter((v) => v.size).map((v) => v.size!))];

  const selectedVariant = productDetail.variants.find((v) => {
    if (colors.length > 0 && sizes.length > 0) {
      return v.color === selectedColor && v.size === selectedSize;
    }
    if (colors.length > 0) return v.color === selectedColor;
    if (sizes.length > 0) return v.size === selectedSize;
    return true;
  });

  const hasDiscount = productDetail.compareAtPrice && productDetail.compareAtPrice > productDetail.price;
  const discount = hasDiscount
    ? Math.round(((productDetail.compareAtPrice! - productDetail.price) / productDetail.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    if (selectedVariant.stock < quantity) {
      toast.error('Not enough stock');
      return;
    }
    addToCart(productDetail, selectedVariant, quantity);
    toast.success(`${productDetail.name} added to bag`);
  };

  // Related products (same category, different product)
  const related = products
    .filter((p) => p.categoryId === productDetail.categoryId && p.id !== productDetail.id)
    .slice(0, 4);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-cream border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-xs text-warm-gray">
            <button onClick={() => useStore.getState().goHome()} className="hover:text-gold transition-colors tracking-wider uppercase">
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <button
              onClick={() => {
                useStore.getState().setFilter('categoryId', productDetail.categoryId);
                navigateTo('category', productDetail.categoryId);
              }}
              className="hover:text-gold transition-colors tracking-wider uppercase"
            >
              {productDetail.category.name}
            </button>
            {productDetail.subCategory && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="hover:text-gold transition-colors tracking-wider uppercase">
                  {productDetail.subCategory.name}
                </span>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground tracking-wider uppercase truncate max-w-[200px]">
              {productDetail.name}
            </span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden luxury-image-hover rounded-sm bg-secondary">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIndex}
                  src={images[selectedImageIndex] || ''}
                  alt={productDetail.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden border-2 transition-colors rounded-sm ${
                      selectedImageIndex === idx ? 'border-gold' : 'border-transparent hover:border-gold/50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            <button
              onClick={() => {
                useStore.getState().setFilter('brandId', productDetail.brand.id);
                navigateTo('brand', productDetail.brand.id);
              }}
              className="text-xs text-gold tracking-[0.2em] uppercase hover:text-gold-dark transition-colors"
            >
              {productDetail.brand.name}
            </button>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-light tracking-wide leading-tight">
              {productDetail.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-medium">₹{productDetail.price.toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-warm-gray line-through">
                    ₹{productDetail.compareAtPrice!.toLocaleString('en-IN')}
                  </span>
                  <Badge className="bg-destructive text-white text-xs border-0 px-2 py-0.5 rounded-none">
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>

            {/* Tags */}
            {productDetail.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {productDetail.tags.map((t) => (
                  <Badge
                    key={t.tagId}
                    variant="secondary"
                    className="text-[10px] tracking-wider uppercase border border-gold/20 text-gold px-3 py-1 rounded-none"
                  >
                    {t.tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Description */}
            <p className="text-sm text-warm-gray leading-relaxed">
              {productDetail.description}
            </p>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-[0.15em] uppercase font-medium">
                    Color: {selectedColor || 'Select'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs tracking-wider uppercase border transition-all ${
                        selectedColor === color
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-border hover:border-gold/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-[0.15em] uppercase font-medium">
                    Size: {selectedSize || 'Select'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const inStock = productDetail.variants.some(
                      (v) => v.size === size && v.stock > 0
                    );
                    return (
                      <button
                        key={size}
                        onClick={() => inStock && setSelectedSize(size)}
                        disabled={!inStock}
                        className={`w-12 h-12 text-xs tracking-wider border transition-all flex items-center justify-center ${
                          selectedSize === size
                            ? 'border-gold bg-gold/10 text-gold'
                            : inStock
                            ? 'border-border hover:border-gold/50'
                            : 'border-border text-warm-gray/40 line-through cursor-not-allowed'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                className="flex-1 tracking-[0.15em] uppercase text-xs h-12 bg-charcoal hover:bg-charcoal/90 rounded-none"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Bag — ₹{(selectedVariant?.price || productDetail.price).toLocaleString('en-IN')}
              </Button>
            </div>

            {selectedVariant && (
              <p className="text-xs text-warm-gray flex items-center gap-1">
                {selectedVariant.stock > 0 ? (
                  <>
                    <Check className="h-3 w-3 text-green-600" />
                    In stock — {selectedVariant.stock} available
                  </>
                ) : (
                  'Out of stock'
                )}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" size="sm" className="flex-1 tracking-wider uppercase text-xs">
                <Heart className="mr-2 h-3.5 w-3.5" />
                Wishlist
              </Button>
              <Button variant="outline" size="sm" className="flex-1 tracking-wider uppercase text-xs">
                <Share2 className="mr-2 h-3.5 w-3.5" />
                Share
              </Button>
            </div>

            <Separator />

            {/* Attributes Tabs */}
            <div>
              <div className="flex border-b">
                {(['description', 'attributes'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs tracking-[0.15em] uppercase px-4 py-3 transition-colors border-b-2 ${
                      activeTab === tab
                        ? 'border-gold text-foreground'
                        : 'border-transparent text-warm-gray hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="py-6">
                {activeTab === 'description' ? (
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {productDetail.description}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {productDetail.attributes.map((attr) => (
                      <div key={attr.id} className="flex items-start py-2 border-b border-dashed">
                        <span className="text-xs text-warm-gray tracking-wider uppercase w-32 flex-shrink-0">
                          {attr.name}
                        </span>
                        <span className="text-sm">{attr.value}</span>
                      </div>
                    ))}
                    {productDetail.brand.foundedYear && (
                      <div className="flex items-start py-2 border-b border-dashed">
                        <span className="text-xs text-warm-gray tracking-wider uppercase w-32 flex-shrink-0">
                          Heritage
                        </span>
                        <span className="text-sm">
                          Founded in {productDetail.brand.foundedYear}, {productDetail.brand.country}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">You May Also Like</p>
                <h3 className="text-xl font-light tracking-wide">Related Products</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
