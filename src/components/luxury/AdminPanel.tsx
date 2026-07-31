'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import {
  Plus, Trash2, Edit3, Save, X, Package, ChevronDown, ChevronUp,
  Tag, Layers, Settings, ArrowLeft, Check, Upload,
  Sparkles, PackageOpen, Copy, Search, ChevronLeft, RefreshCw,
  Camera, Video, FileImage, XCircle, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface VariantRow {
  name: string;
  color: string;
  size: string;
  material: string;
  price: string;
  stock: string;
}

interface AttributeRow {
  name: string;
  value: string;
}

const ADMIN_PAGE_SIZE = 50;

export function AdminPanel() {
  const {
    brands,
    categories,
    tags,
    setBrands,
    setCategories,
    setProducts,
    navigateTo,
    logoutAdmin,
  } = useStore();

  // ---- Admin-specific product state (independent of store) ----
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminTotal, setAdminTotal] = useState(0);
  const [adminPage, setAdminPage] = useState(1);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');

  const fetchAdminProducts = useCallback(async (page: number, append: boolean = false, search?: string) => {
    setIsLoadingAdmin(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ADMIN_PAGE_SIZE),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAdminProducts((prev) => append ? [...prev, ...data.products] : data.products);
        setAdminTotal(data.pagination.total);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingAdmin(false);
    }
  }, []);

  // Initial load + when search changes
  useEffect(() => {
    setAdminPage(1);
    fetchAdminProducts(1, false, adminSearch || undefined);
  }, [adminSearch, fetchAdminProducts]);

  // Also refresh store products so the front-end stays in sync
  const refreshStoreProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=12&sortBy=createdAt&sortOrder=desc');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products, data.pagination);
      }
    } catch { /* silent */ }
  };

  const loadMore = () => {
    const nextPage = adminPage + 1;
    setAdminPage(nextPage);
    fetchAdminProducts(nextPage, true, adminSearch || undefined);
  };

  // Filtered products shown in table
  const displayedProducts = adminSearch
    ? adminProducts
    : adminProducts;

  // ---- Tabs ----
  const [activeTab, setActiveTab] = useState<'products' | 'brands' | 'categories'>('products');

  // ---- Product form ----
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    brandId: '',
    categoryId: '',
    subCategoryId: '',
    featured: false,
    bestseller: false,
    newArrival: false,
    images: [] as string[],
    videoUrl: '',
    variants: [{ name: 'Default', color: '', size: '', material: '', price: '', stock: '10' }] as VariantRow[],
    attributes: [{ name: '', value: '' }] as AttributeRow[],
    selectedTags: [] as string[],
  });

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      brandId: '',
      categoryId: '',
      subCategoryId: '',
      featured: false,
      bestseller: false,
      newArrival: false,
      images: [],
      videoUrl: '',
      variants: [{ name: 'Default', color: '', size: '', material: '', price: '', stock: '10' }],
      attributes: [{ name: '', value: '' }],
      selectedTags: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const keepFormForNext = () => {
    const currentBrand = form.brandId;
    const currentCategory = form.categoryId;
    const currentSubCategory = form.subCategoryId;
    const currentTags = form.selectedTags;
    const currentAttributes = form.attributes;
    setForm({
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      brandId: currentBrand,
      categoryId: currentCategory,
      subCategoryId: currentSubCategory,
      featured: false,
      bestseller: false,
      newArrival: false,
      images: [],
      videoUrl: '',
      variants: [{ name: 'Default', color: '', size: '', material: '', price: '', stock: '10' }],
      attributes: currentAttributes.filter(a => a.name.trim()),
      selectedTags: currentTags,
    });
    setEditingId(null);
    // Keep form open for rapid entry
  };

  const handleEditProduct = (product: any) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
      brandId: product.brandId,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId || '',
      featured: product.featured,
      bestseller: product.bestseller,
      newArrival: product.newArrival,
      images: (() => { try { return JSON.parse(product.images); } catch { return []; } })(),
      videoUrl: (product as any).videoUrl || '',
      variants: product.variants.length > 0
        ? product.variants.map((v: any) => ({
            name: v.name,
            color: v.color || '',
            size: v.size || '',
            material: v.material || '',
            price: v.price ? String(v.price) : '',
            stock: String(v.stock),
          }))
        : [{ name: 'Default', color: '', size: '', material: '', price: '', stock: '10' }],
      attributes: product.attributes.length > 0
        ? product.attributes.map((a: any) => ({ name: a.name, value: a.value }))
        : [{ name: '', value: '' }],
      selectedTags: product.tags.map((t: any) => t.tagId),
    });
    setEditingId(product.id);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDuplicateProduct = async (product: any) => {
    try {
      const payload = {
        name: `${product.name} (Copy)`,
        description: product.description,
        price: String(product.price),
        compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
        brandId: product.brandId,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        featured: false,
        bestseller: false,
        newArrival: false,
        images: product.images,
        variants: product.variants.map((v: any) => ({
          name: v.name,
          color: v.color || '',
          size: v.size || '',
          material: v.material || '',
          price: v.price ? String(v.price) : '',
          stock: String(v.stock),
        })),
        attributes: product.attributes.map((a: any) => ({ name: a.name, value: a.value })),
        tags: product.tags.map((t: any) => t.tagId),
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(`Duplicated "${product.name}"`);
        fetchAdminProducts(1, false, adminSearch || undefined);
        refreshStoreProducts();
      } else {
        toast.error('Failed to duplicate');
      }
    } catch {
      toast.error('Error duplicating product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted successfully');
        fetchAdminProducts(1, false, adminSearch || undefined);
        refreshStoreProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch {
      toast.error('Error deleting product');
    }
  };

  const handleSubmit = async (andAddAnother: boolean = false) => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price) { toast.error('Price is required'); return; }
    if (!form.brandId) { toast.error('Please select a brand'); return; }
    if (!form.categoryId) { toast.error('Please select a category'); return; }
    if (form.images.length === 0) { toast.error('Please upload at least one image'); return; }

    setIsSubmitting(true);
    try {
      const payload: any = { ...form, tags: form.selectedTags, videoUrl: form.videoUrl || null };
      const method = editingId ? 'PUT' : 'POST';
      if (editingId) payload.id = editingId;

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? 'Product updated!' : 'Product created!');
        if (andAddAnother) {
          keepFormForNext();
        } else {
          resetForm();
        }
        fetchAdminProducts(1, false, adminSearch || undefined);
        refreshStoreProducts();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save product');
      }
    } catch {
      toast.error('Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Image file upload ----
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 6 - form.images.length;
    if (remaining <= 0) {
      toast.error('Maximum 6 images allowed');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);

    setIsUploading(true);
    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append('files', file));

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.urls && data.urls.length > 0) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...data.urls],
        }));
        toast.success(`Uploaded ${data.urls.length} image(s)`);
      }

      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((err: string) => toast.error(err));
      }
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // ---- Variant management ----
  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: '', color: '', size: '', material: '', price: '', stock: '10' }],
    }));
  };
  const removeVariant = (index: number) => {
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };
  const updateVariant = (index: number, field: keyof VariantRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  };

  // ---- Attribute management ----
  const addAttribute = () => {
    setForm((prev) => ({ ...prev, attributes: [...prev.attributes, { name: '', value: '' }] }));
  };
  const removeAttribute = (index: number) => {
    setForm((prev) => ({ ...prev, attributes: prev.attributes.filter((_, i) => i !== index) }));
  };
  const updateAttribute = (index: number, field: keyof AttributeRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    }));
  };

  // ---- Tag toggle ----
  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter((t) => t !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  };

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const subCategories = selectedCategory?.subCategories || [];

  // ---- Brand form ----
  const [brandForm, setBrandForm] = useState({ name: '', description: '', country: '', foundedYear: '' });
  const [showBrandForm, setShowBrandForm] = useState(false);

  const handleCreateBrand = async () => {
    if (!brandForm.name.trim()) { toast.error('Brand name is required'); return; }
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandForm),
      });
      if (res.ok) {
        toast.success('Brand created successfully');
        const newBrands = await (await fetch('/api/brands')).json();
        setBrands(newBrands);
        setBrandForm({ name: '', description: '', country: '', foundedYear: '' });
        setShowBrandForm(false);
      }
    } catch { toast.error('Error creating brand'); }
  };

  // ---- Category form ----
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) { toast.error('Category name is required'); return; }
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      if (res.ok) {
        toast.success('Category created successfully');
        const newCategories = await (await fetch('/api/categories')).json();
        setCategories(newCategories);
        setCategoryForm({ name: '', description: '' });
        setShowCategoryForm(false);
      }
    } catch { toast.error('Error creating category'); }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-cream border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('home')} className="p-2 hover:text-gold transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-light tracking-wide flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gold" />
                  Admin Panel
                </h1>
                <p className="text-xs text-warm-gray mt-1">Manage products, brands, and categories</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => { resetForm(); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                className="tracking-[0.15em] uppercase text-xs bg-gold text-white hover:bg-gold-dark"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logoutAdmin}
                className="tracking-wider uppercase text-xs text-warm-gray hover:text-destructive"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b mb-6">
          {([
            { key: 'products' as const, label: 'Products', icon: Package, count: adminTotal },
            { key: 'brands' as const, label: 'Brands', icon: Sparkles, count: brands.length },
            { key: 'categories' as const, label: 'Categories', icon: Layers, count: categories.length },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs tracking-[0.15em] uppercase border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-gold text-foreground font-medium'
                  : 'border-transparent text-warm-gray hover:text-foreground'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* ===================== PRODUCTS TAB ===================== */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Product Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  ref={formRef}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-sm overflow-hidden"
                >
                  <div className="bg-cream px-6 py-4 flex items-center justify-between border-b">
                    <h3 className="text-sm tracking-wider uppercase font-medium">
                      {editingId ? 'Edit Product' : 'New Product'}
                    </h3>
                    <button onClick={resetForm} className="p-1 hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">Product Name *</label>
                        <Input
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Gucci Horsebit 1955 Loafer"
                          className="h-10"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">Description</label>
                        <Textarea
                          value={form.description}
                          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Detailed product description..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">Price (₹) *</label>
                        <Input
                          type="number" step="0.01"
                          value={form.price}
                          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                          placeholder="980"
                        />
                      </div>
                      <div>
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">Compare at Price (₹)</label>
                        <Input
                          type="number" step="0.01"
                          value={form.compareAtPrice}
                          onChange={(e) => setForm((p) => ({ ...p, compareAtPrice: e.target.value }))}
                          placeholder="1200 (optional, for sale)"
                        />
                      </div>
                    </div>

                    {/* Brand & Category & Flags */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">Brand *</label>
                        <select
                          value={form.brandId}
                          onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value }))}
                          className="w-full h-10 px-3 text-sm border bg-background rounded-sm"
                        >
                          <option value="">Select Brand</option>
                          {brands.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">Category *</label>
                        <select
                          value={form.categoryId}
                          onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value, subCategoryId: '' }))}
                          className="w-full h-10 px-3 text-sm border bg-background rounded-sm"
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">Sub-Category</label>
                        <select
                          value={form.subCategoryId}
                          onChange={(e) => setForm((p) => ({ ...p, subCategoryId: e.target.value }))}
                          className="w-full h-10 px-3 text-sm border bg-background rounded-sm"
                          disabled={!selectedCategory}
                        >
                          <option value="">None</option>
                          {subCategories.map((sc) => (<option key={sc.id} value={sc.id}>{sc.name}</option>))}
                        </select>
                      </div>
                      <div className="flex items-end gap-2 flex-wrap">
                        {([
                          { key: 'featured' as const, label: 'Featured' },
                          { key: 'bestseller' as const, label: 'Bestseller' },
                          { key: 'newArrival' as const, label: 'New' },
                        ]).map((flag) => (
                          <label
                            key={flag.key}
                            className={`flex items-center gap-1.5 px-3 py-2 border text-[10px] tracking-wider uppercase cursor-pointer transition-colors ${
                              form[flag.key] ? 'border-gold bg-gold/10 text-gold' : 'border-border hover:border-gold/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={form[flag.key]}
                              onChange={(e) => setForm((p) => ({ ...p, [flag.key]: e.target.checked }))}
                              className="sr-only"
                            />
                            {flag.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Image Upload */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-2 text-xs tracking-wider uppercase text-warm-gray">
                          <Camera className="h-3.5 w-3.5" />
                          Product Images * ({form.images.length}/6)
                        </label>
                      </div>

                      {/* Upload dropzone */}
                      <div
                        onClick={() => form.images.length < 6 && fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-all ${
                          isUploading
                            ? 'border-gold/60 bg-gold/5'
                            : form.images.length >= 6
                              ? 'border-border bg-muted cursor-not-allowed'
                              : 'border-border hover:border-gold/50 hover:bg-cream/50'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-gold">Uploading...</span>
                          </div>
                        ) : form.images.length >= 6 ? (
                          <div className="flex flex-col items-center gap-2">
                            <Check className="h-8 w-8 text-gold" />
                            <span className="text-xs text-warm-gray">6 images uploaded (maximum reached)</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-cream flex items-center justify-center">
                              <Upload className="h-5 w-5 text-gold" />
                            </div>
                            <div>
                              <p className="text-sm text-foreground font-medium">Click to upload images</p>
                              <p className="text-[10px] text-warm-gray mt-1">
                                JPG, PNG, WebP, GIF or SVG — max 5MB each — up to {6 - form.images.length} more
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Previews + Empty Slots */}
                      {form.images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
                          {form.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square border bg-secondary rounded-sm overflow-hidden group">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded-full font-medium">
                                {idx + 1}
                              </span>
                            </div>
                          ))}
                          {Array.from({ length: Math.max(0, Math.min(4, 6 - form.images.length)) }).map((_, i) => (
                            <div
                              key={`empty-${i}`}
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square border-2 border-dashed rounded-sm flex flex-col items-center justify-center text-warm-gray/40 cursor-pointer hover:border-gold/40 hover:text-warm-gray/60 transition-colors"
                            >
                              <FileImage className="h-5 w-5" />
                              <span className="text-[9px] mt-1">Add</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Video URL */}
                    <div>
                      <label className="flex items-center gap-2 text-xs tracking-wider uppercase text-warm-gray mb-3">
                        <Video className="h-3.5 w-3.5" />
                        Product Video URL
                        <span className="text-[10px] normal-case tracking-normal text-warm-gray/60">(optional — YouTube, Vimeo, etc.)</span>
                      </label>
                      <div className="relative">
                        <Input
                          value={form.videoUrl}
                          onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                          placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                          className="h-10 pr-10"
                        />
                        {form.videoUrl && (
                          <button
                            onClick={() => setForm((p) => ({ ...p, videoUrl: '' }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-destructive transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {form.videoUrl && (
                        <p className="text-[10px] text-gold mt-1.5 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Video link added — will display on product page
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Variants */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-2 text-xs tracking-wider uppercase text-warm-gray">
                          <Layers className="h-3.5 w-3.5" />
                          Variants ({form.variants.length})
                        </label>
                        <Button variant="ghost" size="sm" onClick={addVariant} className="text-xs h-7">
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {form.variants.map((variant, idx) => (
                          <div key={idx} className="border rounded-sm p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] tracking-wider uppercase text-warm-gray">Variant {idx + 1}</span>
                              {form.variants.length > 1 && (
                                <button onClick={() => removeVariant(idx)} className="text-warm-gray hover:text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                              <Input value={variant.color} onChange={(e) => updateVariant(idx, 'color', e.target.value)} placeholder="Color" className="h-8 text-xs" />
                              <Input value={variant.size} onChange={(e) => updateVariant(idx, 'size', e.target.value)} placeholder="Size" className="h-8 text-xs" />
                              <Input value={variant.material} onChange={(e) => updateVariant(idx, 'material', e.target.value)} placeholder="Material" className="h-8 text-xs" />
                              <Input type="number" step="0.01" value={variant.price} onChange={(e) => updateVariant(idx, 'price', e.target.value)} placeholder="Price (₹)" className="h-8 text-xs" />
                              <Input type="number" value={variant.stock} onChange={(e) => updateVariant(idx, 'stock', e.target.value)} placeholder="Stock" className="h-8 text-xs" />
                              <Input value={variant.name} onChange={(e) => updateVariant(idx, 'name', e.target.value)} placeholder="Label" className="h-8 text-xs" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Attributes */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-2 text-xs tracking-wider uppercase text-warm-gray">
                          <Settings className="h-3.5 w-3.5" />
                          Attributes ({form.attributes.filter(a => a.name).length})
                        </label>
                        <Button variant="ghost" size="sm" onClick={addAttribute} className="text-xs h-7">
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {form.attributes.map((attr, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input value={attr.name} onChange={(e) => updateAttribute(idx, 'name', e.target.value)} placeholder="Name (e.g. Material)" className="h-8 text-xs flex-1" />
                            <Input value={attr.value} onChange={(e) => updateAttribute(idx, 'value', e.target.value)} placeholder="Value (e.g. Calfskin)" className="h-8 text-xs flex-[2]" />
                            {form.attributes.length > 1 && (
                              <button onClick={() => removeAttribute(idx)} className="p-1 text-warm-gray hover:text-destructive flex-shrink-0">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Tags */}
                    <div>
                      <label className="flex items-center gap-2 text-xs tracking-wider uppercase text-warm-gray mb-3">
                        <Tag className="h-3.5 w-3.5" /> Tags ({form.selectedTags.length} selected)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`text-[10px] tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                              form.selectedTags.includes(tag.id)
                                ? 'border-gold bg-gold/10 text-gold'
                                : 'border-border hover:border-gold/50 hover:text-gold text-warm-gray'
                            }`}
                          >{tag.name}</button>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2 flex-wrap">
                      <Button
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        className="tracking-[0.15em] uppercase text-xs bg-charcoal hover:bg-charcoal/90 px-6"
                      >
                        {isSubmitting ? <span className="animate-pulse">Saving...</span> : <><Save className="mr-2 h-4 w-4" />{editingId ? 'Update' : 'Create Product'}</>}
                      </Button>
                      {!editingId && (
                        <Button
                          onClick={() => handleSubmit(true)}
                          disabled={isSubmitting}
                          variant="outline"
                          className="tracking-[0.15em] uppercase text-xs px-6 border-gold/40 text-gold hover:bg-gold/10"
                        >
                          <Plus className="mr-2 h-3.5 w-3.5" />
                          Create & Add Another
                        </Button>
                      )}
                      <Button variant="outline" onClick={resetForm} className="tracking-[0.15em] uppercase text-xs">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search + Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-gray" />
                <Input
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-warm-gray">
                  Showing <span className="font-medium text-foreground">{displayedProducts.length}</span> of <span className="font-medium text-foreground">{adminTotal}</span> products
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchAdminProducts(1, false, adminSearch || undefined)}
                  className="h-8 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Product List */}
            {displayedProducts.length === 0 && !isLoadingAdmin ? (
              <div className="text-center py-20">
                <PackageOpen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-warm-gray text-sm">No products found.</p>
              </div>
            ) : (
              <div className="border rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-cream border-b">
                        <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Product</th>
                        <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3 hidden sm:table-cell">Brand</th>
                        <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3 hidden md:table-cell">Category</th>
                        <th className="text-right text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Price</th>
                        <th className="text-center text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3 hidden lg:table-cell">Flags</th>
                        <th className="text-right text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-cream/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                                {(() => { try { const imgs = JSON.parse(product.images); return imgs[0] ? <img src={imgs[0]} alt="" className="w-full h-full object-cover" /> : null; } catch { return null; } })()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate max-w-[200px]">{product.name}</p>
                                <p className="text-[10px] text-warm-gray">{product.variants.length} variants</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-xs text-warm-gray">{product.brand.name}</span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs text-warm-gray">{product.category.name}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-medium">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.compareAtPrice && (
                              <span className="text-[10px] text-warm-gray line-through ml-1">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex items-center justify-center gap-1">
                              {product.featured && <Badge className="text-[9px] px-1.5 py-0 border-gold/30 bg-gold/10 text-gold">Featured</Badge>}
                              {product.bestseller && <Badge className="text-[9px] px-1.5 py-0">Bestseller</Badge>}
                              {product.newArrival && <Badge className="text-[9px] px-1.5 py-0 border-charcoal/30">New</Badge>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-0.5">
                              <button onClick={() => handleDuplicateProduct(product)} className="p-1.5 text-warm-gray hover:text-gold transition-colors" title="Duplicate">
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleEditProduct(product)} className="p-1.5 text-warm-gray hover:text-gold transition-colors" title="Edit">
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 text-warm-gray hover:text-destructive transition-colors" title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Load More */}
                {displayedProducts.length < adminTotal && (
                  <div className="border-t py-4 text-center">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={isLoadingAdmin}
                      className="tracking-wider uppercase text-xs"
                    >
                      {isLoadingAdmin ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" />
                          Load More ({adminTotal - displayedProducts.length} remaining)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== BRANDS TAB ===================== */}
        {activeTab === 'brands' && (
          <div className="space-y-4">
            <AnimatePresence>
              {showBrandForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border rounded-sm overflow-hidden">
                  <div className="bg-cream px-6 py-3 border-b flex items-center justify-between">
                    <h3 className="text-xs tracking-wider uppercase font-medium">New Brand</h3>
                    <button onClick={() => setShowBrandForm(false)} className="p-1 hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input value={brandForm.name} onChange={(e) => setBrandForm((p) => ({ ...p, name: e.target.value }))} placeholder="Brand Name *" />
                    <Input value={brandForm.country} onChange={(e) => setBrandForm((p) => ({ ...p, country: e.target.value }))} placeholder="Country" />
                    <Input value={brandForm.foundedYear} onChange={(e) => setBrandForm((p) => ({ ...p, foundedYear: e.target.value }))} placeholder="Founded Year" />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateBrand} size="sm" className="flex-1 tracking-wider uppercase text-xs">Create</Button>
                      <Button variant="outline" size="sm" onClick={() => setShowBrandForm(false)}>Cancel</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!showBrandForm && (
              <Button variant="outline" onClick={() => setShowBrandForm(true)} className="tracking-wider uppercase text-xs">
                <Plus className="mr-2 h-4 w-4" /> Add Brand
              </Button>
            )}
            <div className="border rounded-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="bg-cream border-b">
                  <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Brand</th>
                  <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3 hidden sm:table-cell">Country</th>
                  <th className="text-right text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Products</th>
                </tr></thead>
                <tbody>{brands.map((brand) => (
                  <tr key={brand.id} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-charcoal text-white rounded-full flex items-center justify-center text-xs font-medium">{brand.logo || brand.name[0]}</div>
                        <div><p className="text-xs font-medium">{brand.name}</p><p className="text-[10px] text-warm-gray">{brand.foundedYear || ''}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs text-warm-gray">{brand.country || '-'}</span></td>
                    <td className="px-4 py-3 text-right"><Badge variant="secondary" className="text-[10px]">{brand._count.products}</Badge></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== CATEGORIES TAB ===================== */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <AnimatePresence>
              {showCategoryForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border rounded-sm overflow-hidden">
                  <div className="bg-cream px-6 py-3 border-b flex items-center justify-between">
                    <h3 className="text-xs tracking-wider uppercase font-medium">New Category</h3>
                    <button onClick={() => setShowCategoryForm(false)} className="p-1 hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} placeholder="Category Name *" />
                    <Input value={categoryForm.description} onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateCategory} size="sm" className="flex-1 tracking-wider uppercase text-xs">Create</Button>
                      <Button variant="outline" size="sm" onClick={() => setShowCategoryForm(false)}>Cancel</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!showCategoryForm && (
              <Button variant="outline" onClick={() => setShowCategoryForm(true)} className="tracking-wider uppercase text-xs">
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            )}
            <div className="border rounded-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="bg-cream border-b">
                  <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Category</th>
                  <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3 hidden sm:table-cell">Sub-Categories</th>
                  <th className="text-right text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Products</th>
                </tr></thead>
                <tbody>{categories.map((cat) => (
                  <tr key={cat.id} className="border-b">
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium">{cat.name}</p>
                      <p className="text-[10px] text-warm-gray">{cat.description || ''}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {cat.subCategories.map((sc) => (<Badge key={sc.id} variant="secondary" className="text-[10px]">{sc.name}</Badge>))}
                        {cat.subCategories.length === 0 && <span className="text-[10px] text-warm-gray">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right"><Badge variant="secondary" className="text-[10px]">{cat._count.products}</Badge></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
