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
    if (sortBy === 'price') {
      orderBy.price = sortOrder === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
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
      db.product.count({ where }),
    ]);

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
