'use client';

import { useStore } from '@/store/useStore';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileMenu() {
  const { isMobileMenuOpen, toggleMobileMenu, brands, categories, navigateTo, goHome, setFilter } = useStore();

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={toggleMobileMenu} />

      {/* Menu Panel */}
      <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-background overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg tracking-[0.2em] uppercase font-light">
            <span className="font-medium">Maison</span> <span className="text-gradient-gold">Luxe</span>
          </h2>
          <button onClick={toggleMobileMenu} className="p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm tracking-wider uppercase py-3"
            onClick={() => {
              goHome();
              toggleMobileMenu();
            }}
          >
            Home
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-sm tracking-wider uppercase py-3"
            onClick={() => {
              useStore.getState().resetFilters();
              navigateTo('shop');
              toggleMobileMenu();
            }}
          >
            Shop All
          </Button>

          {/* Categories */}
          <div className="pt-4 pb-2">
            <p className="text-xs tracking-[0.2em] uppercase text-warm-gray mb-2 px-4">Categories</p>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant="ghost"
                className="w-full justify-between text-sm tracking-wider uppercase py-2.5 px-4"
                onClick={() => {
                  setFilter('categoryId', cat.id);
                  navigateTo('shop');
                  toggleMobileMenu();
                }}
              >
                {cat.name}
                <ChevronRight className="h-3 w-3 opacity-40" />
              </Button>
            ))}
          </div>

          {/* Brands */}
          <div className="pt-4 pb-2">
            <p className="text-xs tracking-[0.2em] uppercase text-warm-gray mb-2 px-4">Brands</p>
            {brands.map((brand) => (
              <Button
                key={brand.id}
                variant="ghost"
                className="w-full justify-between text-sm tracking-wider uppercase py-2.5 px-4"
                onClick={() => {
                  setFilter('brandId', brand.id);
                  navigateTo('shop');
                  toggleMobileMenu();
                }}
              >
                {brand.name}
                <ChevronRight className="h-3 w-3 opacity-40" />
              </Button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
