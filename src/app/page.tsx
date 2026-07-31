'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/luxury/Header';
import { Footer } from '@/components/luxury/Footer';
import { HomePage } from '@/components/luxury/HomePage';
import { ShopPage } from '@/components/luxury/ShopPage';
import { ProductDetailPage } from '@/components/luxury/ProductDetailPage';
import { CartDrawer } from '@/components/luxury/CartDrawer';
import { MobileMenu } from '@/components/luxury/MobileMenu';
import { AdminPanel } from '@/components/luxury/AdminPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from 'sonner';

export default function Page() {
  const {
    currentView,
    isLoading,
    filters,
    brands,
    categories,
    products,
    setBrands,
    setCategories,
    setProducts,
    setLoading,
  } = useStore();

  // Initial data fetch
  useEffect(() => {
    async function fetchData() {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/categories'),
        ]);

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData);
        }
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    }
    fetchData();
  }, [setBrands, setCategories]);

  // Fetch products when filters change
  useEffect(() => {
    async function fetchProducts() {
      if (currentView === 'product') return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.brandId) params.set('brandId', filters.brandId);
        if (filters.categoryId) params.set('categoryId', filters.categoryId);
        if (filters.subCategoryId) params.set('subCategoryId', filters.subCategoryId);
        if (filters.tag) params.set('tag', filters.tag);
        if (filters.priceMin) params.set('priceMin', filters.priceMin);
        if (filters.priceMax) params.set('priceMax', filters.priceMax);
        if (filters.sortBy) params.set('sortBy', filters.sortBy);
        if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
        if (filters.featured) params.set('featured', 'true');
        if (filters.bestseller) params.set('bestseller', 'true');
        if (filters.newArrival) params.set('newArrival', 'true');
        if (filters.onSale) params.set('onSale', 'true');

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products, data.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }

    if (currentView === 'admin') return;
    if (currentView === 'shop' || currentView === 'brand' || currentView === 'category' || currentView === 'home') {
      fetchProducts();
    }
  }, [currentView, filters, setLoading, setProducts]);

  const renderView = () => {
    if (isLoading && products.length === 0) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-sm" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'shop':
      case 'brand':
      case 'category':
      case 'search':
        return <ShopPage />;
      case 'product':
        return <ProductDetailPage />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MobileMenu />
      <main className="flex-1">{renderView()}</main>
      <Footer />
      <CartDrawer />
      <Toaster position="top-right" richColors />
    </div>
  );
}
