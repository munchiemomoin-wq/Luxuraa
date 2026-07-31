import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const bestseller = searchParams.get('bestseller');
    const newArrival = searchParams.get('newArrival');
    const onSale = searchParams.get('onSale');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');

    const where: Prisma.ProductWhereInput = {};

    if (brandId) where.brandId = brandId;
    if (categoryId) where.categoryId = categoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (featured === 'true') where.featured = true;
    if (bestseller === 'true') where.bestseller = true;
    if (newArrival === 'true') where.newArrival = true;
    if (onSale === 'true') where.compareAtPrice = { gt: 0 };

    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag },
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin);
      if (priceMax) where.price.lte = parseFloat(priceMax);
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    let sortByDiscount = false;
    if (sortBy === 'discount') {
      sortByDiscount = true;
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    let products;
    if (sortByDiscount) {
      // Fetch all matching, sort by computed discount, then paginate in-memory
      const allProducts = await db.product.findMany({
        where,
        include: {
          brand: { select: { id: true, name: true, slug: true, logo: true } },
          category: { select: { id: true, name: true, slug: true } },
          subCategory: { select: { id: true, name: true, slug: true } },
          variants: { where: { stock: { gt: 0 } } },
          attributes: true,
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        },
      });
      allProducts.sort((a, b) => {
        const discA = a.compareAtPrice ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0;
        const discB = b.compareAtPrice ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0;
        return sortOrder === 'desc' ? discB - discA : discA - discB;
      });
      products = allProducts.slice((page - 1) * limit, page * limit);
    } else {
      const [fetched] = await Promise.all([
        db.product.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        include: {
          brand: { select: { id: true, name: true, slug: true, logo: true } },
          category: { select: { id: true, name: true, slug: true } },
          subCategory: { select: { id: true, name: true, slug: true } },
          variants: { where: { stock: { gt: 0 } } },
          attributes: true,
          tags: {
            include: {
              tag: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      ]);
      products = fetched;
    }

    const total = await db.product.count({ where });

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
