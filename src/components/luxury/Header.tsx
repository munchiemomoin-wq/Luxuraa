'use client';

import { useStore } from '@/store/useStore';
import { Search, ShoppingBag, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';

export function Header() {
  const {
    goHome,
    navigateTo,
    brands,
    categories,
    searchQuery,
    setSearchQuery,
    toggleCart,
    getCartCount,
    currentView,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('search');
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-charcoal text-white/80 text-xs tracking-widest uppercase text-center py-2 px-4">
        Complimentary Shipping on Orders Over $1,000 — Authentic Luxury Guaranteed
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-[0_1px_0_0_var(--border)]'
            : 'bg-background'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => useStore.getState().toggleMobileMenu()}
              className="lg:hidden p-2 -ml-2"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => goHome()}
                className={`text-sm tracking-wider uppercase transition-colors hover:text-gold ${
                  currentView === 'home' ? 'text-foreground font-medium' : 'text-warm-gray'
                }`}
              >
                Home
              </button>

              <div
                className="relative"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <button
                  onClick={() => navigateTo('shop')}
                  className={`flex items-center gap-1 text-sm tracking-wider uppercase transition-colors hover:text-gold ${
                    currentView === 'shop' ? 'text-foreground font-medium' : 'text-warm-gray'
                  }`}
                >
                  Shop
                  <ChevronDown className="h-3 w-3" />
                </button>

                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 pt-2 w-[600px]">
                    <div className="bg-background border shadow-lg rounded-sm p-6 grid grid-cols-3 gap-6">
                      {categories.map((cat) => (
                        <div key={cat.id}>
                          <button
                            onClick={() => {
                              useStore.getState().setFilter('categoryId', cat.id);
                              navigateTo('shop');
                              setIsCategoriesOpen(false);
                            }}
                            className="text-sm font-medium tracking-wider uppercase hover:text-gold transition-colors mb-2"
                          >
                            {cat.name}
                          </button>
                          <div className="space-y-1">
                            {cat.subCategories.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  useStore.getState().setFilter('categoryId', cat.id);
                                  useStore.getState().setFilter('subCategoryId', sub.id);
                                  navigateTo('shop');
                                  setIsCategoriesOpen(false);
                                }}
                                className="block text-xs text-warm-gray hover:text-gold transition-colors tracking-wide"
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {brands.slice(0, 4).map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => navigateTo('brand', brand.id)}
                  className="text-sm tracking-wider uppercase text-warm-gray hover:text-gold transition-colors"
                >
                  {brand.name}
                </button>
              ))}
            </nav>

            {/* Logo */}
            <button
              onClick={goHome}
              className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
            >
              <h1 className="text-xl lg:text-2xl font-light tracking-[0.3em] uppercase">
                <span className="font-medium">Maison</span>{' '}
                <span className="text-gradient-gold">Luxe</span>
              </h1>
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search luxury..."
                      className="w-48 lg:w-64 h-9 px-3 text-sm bg-secondary border-none focus:outline-none focus:ring-1 focus:ring-gold/30 rounded-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="p-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 hover:text-gold transition-colors"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>

              <button
                className="p-2 hover:text-gold transition-colors hidden sm:block"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </button>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="p-2 hover:text-gold transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-gold text-white border-0 rounded-full">
                    {cartCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Gold accent line */}
        <div className="h-[1px] gold-shimmer" />
      </header>
    </>
  );
}
