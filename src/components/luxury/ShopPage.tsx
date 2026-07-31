'use client';

import { useStore } from '@/store/useStore';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, Grid2X2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from './ProductCard';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ShopPage() {
  const {
    products,
    brands,
    categories,
    tags,
    filters,
    pagination,
    setFilter,
    resetFilters,
    currentView,
    searchQuery,
    isLoading,
  } = useStore();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const activeBrand = brands.find((b) => b.id === filters.brandId);
  const activeCategory = categories.find((c) => c.id === filters.categoryId);
  const activeTag = tags.find((t) => t.slug === filters.tag);

  const getHeaderText = () => {
    if (currentView === 'search' && searchQuery) return `Search: "${searchQuery}"`;
    if (activeBrand) return activeBrand.name;
    if (activeCategory) return activeCategory.name;
    if (activeTag) return activeTag.name;
    if (filters.featured) return 'Featured';
    if (filters.bestseller) return 'Bestsellers';
    if (filters.newArrival) return 'New Arrivals';
    return 'All Products';
  };

  const activeFilterCount = [
    filters.brandId,
    filters.categoryId,
    filters.subCategoryId,
    filters.tag,
    filters.priceMin,
    filters.priceMax,
    filters.featured,
    filters.bestseller,
    filters.newArrival,
  ].filter(Boolean).length;

  const priceRanges = [
    { label: 'Under ₹50,000', min: null, max: '50000' },
    { label: '₹50K - ₹1L', min: '50000', max: '100000' },
    { label: '₹1L - ₹3L', min: '100000', max: '300000' },
    { label: '₹3L - ₹5L', min: '300000', max: '500000' },
    { label: '₹5L+', min: '500000', max: null },
  ];

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-cream border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
            {currentView === 'brand' ? 'Brand Collection' : currentView === 'category' ? 'Category' : currentView === 'search' ? 'Search Results' : 'Collection'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-wide">{getHeaderText()}</h1>
          {activeBrand && (
            <p className="text-sm text-warm-gray mt-3 max-w-2xl">{activeBrand.description}</p>
          )}
          <p className="text-xs text-warm-gray mt-3">
            {pagination.total} product{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="tracking-wider uppercase text-xs"
            >
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-gold text-white rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetFilters();
                  useStore.getState().navigateTo('shop');
                }}
                className="text-xs text-warm-gray hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilter('sortBy', sortBy);
                setFilter('sortOrder', sortOrder);
              }}
              className="text-xs border bg-background h-8 px-2 tracking-wider uppercase rounded-sm"
            >
              <option value="createdAt-desc">Newest</option>
              <option value="createdAt-asc">Oldest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>

            <div className="hidden lg:flex items-center border rounded-sm">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 ${gridCols === 3 ? 'bg-secondary' : ''}`}
              >
                <Grid2X2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 ${gridCols === 4 ? 'bg-secondary' : ''}`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Tags */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 mb-6"
            >
              {activeBrand && (
                <FilterTag label={activeBrand.name} onRemove={() => setFilter('brandId', null)} />
              )}
              {activeCategory && (
                <FilterTag label={activeCategory.name} onRemove={() => setFilter('categoryId', null)} />
              )}
              {activeTag && (
                <FilterTag label={activeTag.name} onRemove={() => setFilter('tag', null)} />
              )}
              {filters.featured && (
                <FilterTag label="Featured" onRemove={() => setFilter('featured', false)} />
              )}
              {filters.bestseller && (
                <FilterTag label="Bestsellers" onRemove={() => setFilter('bestseller', false)} />
              )}
              {filters.newArrival && (
                <FilterTag label="New Arrivals" onRemove={() => setFilter('newArrival', false)} />
              )}
              {filters.priceMin && filters.priceMax && (
                <FilterTag
                  label={`₹${Number(filters.priceMin).toLocaleString('en-IN')} - ₹${Number(filters.priceMax).toLocaleString('en-IN')}`}
                  onRemove={() => {
                    setFilter('priceMin', null);
                    setFilter('priceMax', null);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="hidden lg:block w-60 flex-shrink-0"
              >
                <div className="sticky top-24 space-y-6">
                  {/* Brands */}
                  <FilterSection title="Brand">
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.brandId === brand.id}
                            onChange={(e) => {
                              setFilter('brandId', e.target.checked ? brand.id : null);
                              useStore.getState().navigateTo('shop');
                            }}
                            className="rounded-sm border-border accent-gold"
                          />
                          <span className="text-xs tracking-wider uppercase group-hover:text-gold transition-colors">
                            {brand.name}
                          </span>
                          <span className="text-[10px] text-warm-gray ml-auto">
                            ({brand._count.products})
                          </span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Categories */}
                  <FilterSection title="Category">
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.categoryId === cat.id}
                            onChange={(e) => {
                              setFilter('categoryId', e.target.checked ? cat.id : null);
                              setFilter('subCategoryId', null);
                            }}
                            className="rounded-sm border-border accent-gold"
                          />
                          <span className="text-xs tracking-wider uppercase group-hover:text-gold transition-colors">
                            {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Price Range */}
                  <FilterSection title="Price Range">
                    <div className="space-y-2">
                      {priceRanges.map((range) => (
                        <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="price"
                            checked={
                              filters.priceMin === range.min && filters.priceMax === range.max
                            }
                            onChange={() => {
                              setFilter('priceMin', range.min);
                              setFilter('priceMax', range.max);
                            }}
                            className="accent-gold"
                          />
                          <span className="text-xs tracking-wider group-hover:text-gold transition-colors">
                            {range.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Tags */}
                  <FilterSection title="Tags">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => setFilter('tag', filters.tag === tag.slug ? null : tag.slug)}
                          className={`text-[10px] tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                            filters.tag === tag.slug
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-border hover:border-gold/50 hover:text-gold'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Special */}
                  <FilterSection title="Special">
                    <div className="space-y-2">
                      {[
                        { label: 'Featured', value: 'featured' },
                        { label: 'Bestsellers', value: 'bestseller' },
                        { label: 'New Arrivals', value: 'newArrival' },
                      ].map((item) => (
                        <label key={item.value} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters[item.value as keyof typeof filters] as boolean}
                            onChange={(e) =>
                              setFilter(item.value, e.target.checked)
                            }
                            className="rounded-sm border-border accent-gold"
                          />
                          <span className="text-xs tracking-wider uppercase group-hover:text-gold transition-colors">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading && products.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-secondary rounded-sm mb-4" />
                    <div className="h-3 bg-secondary rounded w-3/4 mb-2" />
                    <div className="h-3 bg-secondary rounded w-1/2 mb-2" />
                    <div className="h-4 bg-secondary rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-warm-gray text-sm">No products found matching your criteria.</p>
                <Button
                  variant="outline"
                  onClick={() => resetFilters()}
                  className="mt-4 tracking-wider uppercase text-xs"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    gridCols === 3
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}
                >
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setFilter('page', Math.max(1, pagination.page - 1))}
                      className="text-xs tracking-wider"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={pagination.page === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('page', page)}
                            className={`w-8 h-8 p-0 text-xs ${
                              pagination.page === page ? 'bg-charcoal hover:bg-charcoal/90' : ''
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setFilter('page', Math.min(pagination.totalPages, pagination.page + 1))}
                      className="text-xs tracking-wider"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs tracking-[0.15em] uppercase font-medium mb-3 pb-2 border-b">
        {title}
      </h4>
      {children}
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge
      variant="secondary"
      className="text-xs tracking-wider uppercase gap-1 px-3 py-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
    >
      {label}
      <X className="h-3 w-3 ml-1" onClick={onRemove} />
    </Badge>
  );
}
