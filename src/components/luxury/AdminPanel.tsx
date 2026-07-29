'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Plus, Trash2, Edit3, Save, X, Package, ChevronDown, ChevronUp,
  ImageIcon, Tag, Layers, Settings, ArrowLeft, Check, Upload,
  Sparkles, PackageOpen
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

export function AdminPanel() {
  const {
    brands,
    categories,
    tags,
    products,
    setProducts,
    setBrands,
    setCategories,
    navigateTo,
  } = useStore();

  // Tabs
  const [activeTab, setActiveTab] = useState<'products' | 'brands' | 'categories'>('products');

  // Product form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInput, setImageInput] = useState('');

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
      variants: [{ name: 'Default', color: '', size: '', material: '', price: '', stock: '10' }],
      attributes: [{ name: '', value: '' }],
      selectedTags: [],
    });
    setImageInput('');
    setEditingId(null);
    setShowForm(false);
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
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted successfully');
        refreshProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch {
      toast.error('Error deleting product');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price) { toast.error('Price is required'); return; }
    if (!form.brandId) { toast.error('Please select a brand'); return; }
    if (!form.categoryId) { toast.error('Please select a category'); return; }
    if (form.images.length === 0) { toast.error('At least one image URL is required'); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.selectedTags,
      };

      const url = editingId ? '/api/admin/products' : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? 'Product updated successfully' : 'Product created successfully');
        resetForm();
        refreshProducts();
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

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products, data.pagination);
      }
    } catch {
      // silent
    }
  };

  // Image management
  const addImage = () => {
    if (imageInput.trim()) {
      setForm((prev) => ({ ...prev, images: [...prev.images, imageInput.trim()] }));
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // Variant management
  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: '', color: '', size: '', material: '', price: '', stock: '10' }],
    }));
  };

  const removeVariant = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, field: keyof VariantRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  };

  // Attribute management
  const addAttribute = () => {
    setForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', value: '' }],
    }));
  };

  const removeAttribute = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const updateAttribute = (index: number, field: keyof AttributeRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    }));
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter((t) => t !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  };

  // Get subcategories for selected category
  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const subCategories = selectedCategory?.subCategories || [];

  // Brand form
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
    } catch {
      toast.error('Error creating brand');
    }
  };

  // Category form
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
    } catch {
      toast.error('Error creating category');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-cream border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateTo('home')}
                className="p-2 hover:text-gold transition-colors"
              >
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
            <Button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="tracking-[0.15em] uppercase text-xs bg-gold text-white hover:bg-gold-dark"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b mb-8">
          {([
            { key: 'products' as const, label: 'Products', icon: Package, count: products.length },
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

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Product Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
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
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">
                          Product Name *
                        </label>
                        <Input
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Gucci Horsebit 1955 Loafer"
                          className="h-10"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">
                          Description
                        </label>
                        <Textarea
                          value={form.description}
                          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Detailed product description..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">
                          Price ($) *
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={form.price}
                          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                          placeholder="980"
                        />
                      </div>
                      <div>
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">
                          Compare at Price ($)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={form.compareAtPrice}
                          onChange={(e) => setForm((p) => ({ ...p, compareAtPrice: e.target.value }))}
                          placeholder="1200 (optional)"
                        />
                      </div>
                    </div>

                    {/* Brand & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">
                          Brand *
                        </label>
                        <select
                          value={form.brandId}
                          onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value }))}
                          className="w-full h-10 px-3 text-sm border bg-background rounded-sm"
                        >
                          <option value="">Select Brand</option>
                          {brands.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">
                          Category *
                        </label>
                        <select
                          value={form.categoryId}
                          onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value, subCategoryId: '' }))}
                          className="w-full h-10 px-3 text-sm border bg-background rounded-sm"
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs tracking-wider uppercase text-warm-gray mb-1.5">
                          Sub-Category
                        </label>
                        <select
                          value={form.subCategoryId}
                          onChange={(e) => setForm((p) => ({ ...p, subCategoryId: e.target.value }))}
                          className="w-full h-10 px-3 text-sm border bg-background rounded-sm"
                          disabled={!selectedCategory}
                        >
                          <option value="">None</option>
                          {subCategories.map((sc) => (
                            <option key={sc.id} value={sc.id}>{sc.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end gap-3">
                        {[
                          { key: 'featured' as const, label: 'Featured' },
                          { key: 'bestseller' as const, label: 'Bestseller' },
                          { key: 'newArrival' as const, label: 'New' },
                        ].map((flag) => (
                          <label
                            key={flag.key}
                            className={`flex items-center gap-1.5 px-3 py-2 border text-xs tracking-wider uppercase cursor-pointer transition-colors ${
                              form[flag.key]
                                ? 'border-gold bg-gold/10 text-gold'
                                : 'border-border hover:border-gold/50'
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

                    {/* Images */}
                    <div>
                      <label className="flex items-center gap-2 text-xs tracking-wider uppercase text-warm-gray mb-3">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Product Images * (paste URLs)
                      </label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={imageInput}
                          onChange={(e) => setImageInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                          placeholder="https://images.unsplash.com/photo-xxx?w=800"
                          className="flex-1"
                        />
                        <Button onClick={addImage} variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {form.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square border bg-secondary rounded-sm overflow-hidden group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                        {form.images.length === 0 && (
                          <div className="aspect-square border-2 border-dashed rounded-sm flex flex-col items-center justify-center text-warm-gray">
                            <Upload className="h-6 w-6 mb-1" />
                            <span className="text-[10px]">No images</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-warm-gray mt-2">
                        Tip: Use Unsplash URLs like https://images.unsplash.com/photo-XXXX?w=800 for luxury product photos
                      </p>
                    </div>

                    <Separator />

                    {/* Variants */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-2 text-xs tracking-wider uppercase text-warm-gray">
                          <Layers className="h-3.5 w-3.5" />
                          Variants (color, size, material)
                        </label>
                        <Button variant="outline" size="sm" onClick={addVariant} className="text-xs">
                          <Plus className="h-3 w-3 mr-1" /> Add Variant
                        </Button>
                      </div>
                      <div className="space-y-3">
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
                              <Input
                                value={variant.color}
                                onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                                placeholder="Color"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={variant.size}
                                onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                                placeholder="Size"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={variant.material}
                                onChange={(e) => updateVariant(idx, 'material', e.target.value)}
                                placeholder="Material"
                                className="h-8 text-xs"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                value={variant.price}
                                onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                                placeholder="Price ($)"
                                className="h-8 text-xs"
                              />
                              <Input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                                placeholder="Stock"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={variant.name}
                                onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                                placeholder="Name"
                                className="h-8 text-xs"
                              />
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
                          Attributes (material, dimensions, origin, etc.)
                        </label>
                        <Button variant="outline" size="sm" onClick={addAttribute} className="text-xs">
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {form.attributes.map((attr, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              value={attr.name}
                              onChange={(e) => updateAttribute(idx, 'name', e.target.value)}
                              placeholder="Attribute name (e.g. Material)"
                              className="h-8 text-xs flex-1"
                            />
                            <Input
                              value={attr.value}
                              onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                              placeholder="Value (e.g. Calfskin leather)"
                              className="h-8 text-xs flex-[2]"
                            />
                            {form.attributes.length > 1 && (
                              <button onClick={() => removeAttribute(idx)} className="p-1 text-warm-gray hover:text-destructive">
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
                        <Tag className="h-3.5 w-3.5" />
                        Tags
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
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="tracking-[0.15em] uppercase text-xs bg-charcoal hover:bg-charcoal/90 px-8"
                      >
                        {isSubmitting ? (
                          <span className="animate-pulse">Saving...</span>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {editingId ? 'Update Product' : 'Create Product'}
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetForm} className="tracking-[0.15em] uppercase text-xs">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product List */}
            {!showForm && products.length === 0 ? (
              <div className="text-center py-20">
                <PackageOpen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-warm-gray text-sm">No products yet. Click &quot;Add Product&quot; to get started.</p>
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
                      {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-cream/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                                {(() => {
                                  try {
                                    const imgs = JSON.parse(product.images);
                                    return imgs[0] ? <img src={imgs[0]} alt="" className="w-full h-full object-cover" /> : null;
                                  } catch { return null; }
                                })()}
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
                            <span className="text-xs font-medium">${product.price.toLocaleString()}</span>
                            {product.compareAtPrice && (
                              <span className="text-[10px] text-warm-gray line-through ml-1">
                                ${product.compareAtPrice.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex items-center justify-center gap-1">
                              {product.featured && (
                                <Badge className="text-[9px] px-1.5 py-0 border-gold/30 bg-gold/10 text-gold">Featured</Badge>
                              )}
                              {product.bestseller && (
                                <Badge className="text-[9px] px-1.5 py-0">Bestseller</Badge>
                              )}
                              {product.newArrival && (
                                <Badge className="text-[9px] px-1.5 py-0 border-charcoal/30">New</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 text-warm-gray hover:text-gold transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 text-warm-gray hover:text-destructive transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <div className="space-y-4">
            <AnimatePresence>
              {showBrandForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-sm overflow-hidden"
                >
                  <div className="bg-cream px-6 py-3 border-b flex items-center justify-between">
                    <h3 className="text-xs tracking-wider uppercase font-medium">New Brand</h3>
                    <button onClick={() => setShowBrandForm(false)} className="p-1 hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input
                      value={brandForm.name}
                      onChange={(e) => setBrandForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Brand Name *"
                    />
                    <Input
                      value={brandForm.country}
                      onChange={(e) => setBrandForm((p) => ({ ...p, country: e.target.value }))}
                      placeholder="Country"
                    />
                    <Input
                      value={brandForm.foundedYear}
                      onChange={(e) => setBrandForm((p) => ({ ...p, foundedYear: e.target.value }))}
                      placeholder="Founded Year"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateBrand} size="sm" className="flex-1 tracking-wider uppercase text-xs">
                        Create
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowBrandForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showBrandForm && (
              <Button variant="outline" onClick={() => setShowBrandForm(true)} className="tracking-wider uppercase text-xs">
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            )}

            <div className="border rounded-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream border-b">
                    <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Brand</th>
                    <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3 hidden sm:table-cell">Country</th>
                    <th className="text-right text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Products</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id} className="border-b">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-charcoal text-white rounded-full flex items-center justify-center text-xs font-medium">
                            {brand.logo || brand.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{brand.name}</p>
                            <p className="text-[10px] text-warm-gray">{brand.foundedYear || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-warm-gray">{brand.country || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="secondary" className="text-[10px]">{brand._count.products}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <AnimatePresence>
              {showCategoryForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-sm overflow-hidden"
                >
                  <div className="bg-cream px-6 py-3 border-b flex items-center justify-between">
                    <h3 className="text-xs tracking-wider uppercase font-medium">New Category</h3>
                    <button onClick={() => setShowCategoryForm(false)} className="p-1 hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Category Name *"
                    />
                    <Input
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateCategory} size="sm" className="flex-1 tracking-wider uppercase text-xs">
                        Create
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowCategoryForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showCategoryForm && (
              <Button variant="outline" onClick={() => setShowCategoryForm(true)} className="tracking-wider uppercase text-xs">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            )}

            <div className="border rounded-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream border-b">
                    <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Category</th>
                    <th className="text-left text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3 hidden sm:table-cell">Sub-Categories</th>
                    <th className="text-right text-[10px] tracking-wider uppercase text-warm-gray px-4 py-3">Products</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium">{cat.name}</p>
                        <p className="text-[10px] text-warm-gray">{cat.description || ''}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {cat.subCategories.map((sc) => (
                            <Badge key={sc.id} variant="secondary" className="text-[10px]">{sc.name}</Badge>
                          ))}
                          {cat.subCategories.length === 0 && (
                            <span className="text-[10px] text-warm-gray">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="secondary" className="text-[10px]">{cat._count.products}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
