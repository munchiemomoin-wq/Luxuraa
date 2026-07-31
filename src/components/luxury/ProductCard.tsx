'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { navigateTo, addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);

  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [];
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedVariant) {
      addToCart(product, selectedVariant);
    }
  };

  const rs = '\u20B9';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigateTo('product', product.id)}
    >
      <div className="relative aspect-[3/4] bg-secondary luxury-image-hover rounded-sm overflow-hidden mb-4">
        {/* Main Image */}
        <img
          src={images[0] || ''}
          alt={product.name}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isHovered && images[1] ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {images[1] && (
          <img
            src={images[1]}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.newArrival && (
            <Badge className="bg-charcoal text-white text-[10px] tracking-wider uppercase border-0 px-2.5 py-0.5 rounded-none">
              New
            </Badge>
          )}
          {product.bestseller && (
            <Badge className="bg-gold text-white text-[10px] tracking-wider uppercase border-0 px-2.5 py-0.5 rounded-none">
              Bestseller
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-destructive text-white text-[10px] tracking-wider uppercase border-0 px-2.5 py-0.5 rounded-none">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Hover Actions */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {product.variants.length > 0 && (
            <Button
              onClick={handleQuickAdd}
              className="w-full tracking-[0.15em] uppercase text-xs h-10 bg-charcoal/90 hover:bg-charcoal text-white backdrop-blur-sm rounded-none"
            >
              <ShoppingBag className="mr-2 h-3.5 w-3.5" />
              Quick Add to Bag
            </Button>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={`absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full transition-all ${
            isHovered ? 'opacity-100' : 'opacity-0'
          } hover:text-destructive`}
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-warm-gray tracking-[0.15em] uppercase">
          {product.brand.name}
        </p>
        <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-gold transition-colors">
          {product.name}
        </h4>

        {/* Color variants swatches */}
        {(() => {
          const colors = [...new Set(product.variants.filter(v => v.color).map(v => v.color))];
          if (colors.length > 1) {
            return (
              <div className="flex items-center gap-1.5 mt-1">
                {colors.slice(0, 4).map((color) => (
                  <span
                    key={color}
                    className="w-3 h-3 rounded-full border border-border bg-muted"
                    title={color || ''}
                  />
                ))}
                {colors.length > 4 && (
                  <span className="text-[10px] text-warm-gray">+{colors.length - 4}</span>
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((t) => (
              <span key={t.tagId} className="text-[10px] text-warm-gray tracking-wider uppercase">
                {t.tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Price - MRP / Seller Price / Discount */}
        <div className="pt-1">
          {hasDiscount ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">
                  {rs}{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-warm-gray line-through">
                  MRP {rs}{product.compareAtPrice!.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-600 font-medium">
                  {discount}% off
                </span>
                <span className="text-[10px] text-warm-gray">
                  Save {rs}{(product.compareAtPrice! - product.price).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-sm font-medium">{rs}{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
