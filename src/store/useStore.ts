import { create } from 'zustand';
import type { Product, CartItem, Brand, Category, Tag, View } from '@/types';

interface StoreState {
  // Navigation
  currentView: View;
  selectedProductId: string | null;
  selectedBrandId: string | null;
  selectedCategoryId: string | null;
  selectedSubCategoryId: string | null;
  searchQuery: string;

  // Data
  brands: Brand[];
  categories: Category[];
  tags: Tag[];
  products: Product[];
  productDetail: Product | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: {
    brandId: string | null;
    categoryId: string | null;
    subCategoryId: string | null;
    tag: string | null;
    priceMin: string | null;
    priceMax: string | null;
    sortBy: string;
    sortOrder: string;
    featured: boolean;
    bestseller: boolean;
    newArrival: boolean;
    onSale: boolean;
  };

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;

  // Loading
  isLoading: boolean;
  isLoadingProduct: boolean;

  // Auth
  isAdmin: boolean;

  // Actions - Navigation
  navigateTo: (view: View, id?: string) => void;
  setSearchQuery: (query: string) => void;
  goHome: () => void;

  // Actions - Data
  setBrands: (brands: Brand[]) => void;
  setCategories: (categories: Category[]) => void;
  setTags: (tags: Tag[]) => void;
  setProducts: (products: Product[], pagination: any) => void;
  setProductDetail: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingProduct: (loading: boolean) => void;

  // Actions - Filters
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;

  // Actions - Cart
  addToCart: (product: Product, variant: any, quantity?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateCartQuantity: (productId: string, variantId: string, quantity: number) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Actions - Auth
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
}

const defaultFilters = {
  brandId: null,
  categoryId: null,
  subCategoryId: null,
  tag: null,
  priceMin: null,
  priceMax: null,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  featured: false,
  bestseller: false,
  newArrival: false,
  onSale: false,
};

export const useStore = create<StoreState>((set, get) => ({
  // Navigation state
  currentView: 'home',
  selectedProductId: null,
  selectedBrandId: null,
  selectedCategoryId: null,
  selectedSubCategoryId: null,
  searchQuery: '',

  // Data state
  brands: [],
  categories: [],
  tags: [],
  products: [],
  productDetail: null,
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },

  // Filters
  filters: { ...defaultFilters },

  // Cart state
  cart: [],
  isCartOpen: false,
  isMobileMenuOpen: false,

  // Loading
  isLoading: false,
  isLoadingProduct: false,

  // Auth - restore from sessionStorage on init
  isAdmin: typeof window !== 'undefined' && sessionStorage.getItem('luxuraa_admin') === 'true',

  // Navigation actions
  navigateTo: (view, id) => {
    set({
      currentView: view,
      selectedProductId: view === 'product' ? (id || null) : null,
      selectedBrandId: view === 'brand' ? (id || null) : null,
      selectedCategoryId: view === 'category' ? (id || null) : null,
    });

    // Update filters based on view
    const newFilters = { ...defaultFilters };
    if (view === 'brand' && id) newFilters.brandId = id;
    if (view === 'category' && id) newFilters.categoryId = id;
    if (view === 'shop') {
      // Keep existing filters for shop view
    } else if (view !== 'shop') {
      set({ filters: newFilters, pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  goHome: () => set({ currentView: 'home', filters: { ...defaultFilters }, searchQuery: '' }),

  // Data actions
  setBrands: (brands) => set({ brands }),
  setCategories: (categories) => set({ categories }),
  setTags: (tags) => set({ tags }),
  setProducts: (products, pagination) => set({ products, pagination }),
  setProductDetail: (product) => set({ productDetail: product }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingProduct: (loading) => set({ isLoadingProduct: loading }),

  // Filter actions
  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  resetFilters: () => {
    set({
      filters: { ...defaultFilters },
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    });
  },

  // Cart actions
  addToCart: (product, variant, quantity = 1) => {
    set((state) => {
      const existing = state.cart.find(
        (item) => item.product.id === product.id && item.variant.id === variant.id
      );
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id && item.variant.id === variant.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { product, variant, quantity }] };
    });
    set({ isCartOpen: true });
  },

  removeFromCart: (productId, variantId) => {
    set((state) => ({
      cart: state.cart.filter(
        (item) => !(item.product.id === productId && item.variant.id === variantId)
      ),
    }));
  },

  updateCartQuantity: (productId, variantId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, variantId);
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId && item.variant.id === variantId
          ? { ...item, quantity }
          : item
      ),
    }));
  },

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setCartOpen: (open) => set({ isCartOpen: open }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  getCartTotal: () => {
    return get().cart.reduce(
      (total, item) => total + (item.variant.price || item.product.price) * item.quantity,
      0
    );
  },

  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },

  // Auth actions
  loginAdmin: async (password) => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        set({ isAdmin: true });
        sessionStorage.setItem('luxuraa_admin', 'true');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  logoutAdmin: () => {
    set({ isAdmin: false });
    sessionStorage.removeItem('luxuraa_admin');
    // Clear server-side cookie
    fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {});
    get().goHome();
  },
}));
