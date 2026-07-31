export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  country: string | null;
  foundedYear: number | null;
  _count: { products: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  order: number;
  subCategories: SubCategory[];
  _count: { products: number };
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  categoryId: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  color: string | null;
  size: string | null;
  material: string | null;
  price: number | null;
  stock: number;
  image: string | null;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  name: string;
  value: string;
}

export interface ProductTag {
  productId: string;
  tagId: string;
  tag: { id: string; name: string; slug: string };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  brandId: string;
  brand: { id: string; name: string; slug: string; logo: string | null };
  categoryId: string;
  category: { id: string; name: string; slug: string };
  subCategoryId: string | null;
  subCategory: { id: string; name: string; slug: string } | null;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  images: string;
  videoUrl: string | null;
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  tags: ProductTag[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export type View = 'home' | 'shop' | 'product' | 'brand' | 'category' | 'search' | 'admin';
