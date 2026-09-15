import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminUnauthorized } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return adminUnauthorized();
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      compareAtPrice,
      brandId,
      categoryId,
      subCategoryId,
      gender,
      featured,
      bestseller,
      newArrival,
      images,
      videoUrl,
      variants,
      attributes,
      tags,
    } = body;

    // Create product
    const product = await db.product.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
        description: description || null,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        brandId,
        categoryId,
        subCategoryId: subCategoryId || null,
        gender: gender || null,
        featured: featured || false,
        bestseller: bestseller || false,
        newArrival: newArrival || false,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        videoUrl: videoUrl || null,
        variants: {
          create: (variants || []).map((v: any) => ({
            name: v.name || '',
            sku: v.sku || null,
            color: v.color || null,
            size: v.size || null,
            material: v.material || null,
            price: v.price ? parseFloat(v.price) : null,
            stock: parseInt(v.stock || '0'),
            image: v.image || null,
          })),
        },
        attributes: {
          create: (attributes || []).map((a: any) => ({
            name: a.name,
            value: a.value,
          })),
        },
        tags: {
          create: (tags || []).map((tagId: string) => ({
            tagId,
          })),
        },
      },
      include: {
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
        variants: true,
        attributes: true,
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) return adminUnauthorized();
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const { variants, attributes, tags, images, videoUrl, selectedTags, ...productFields } = updateData;

    // Resolve tags: support both `tags` (array of IDs) and `selectedTags` (array of IDs)
    const tagIds: string[] = selectedTags || tags || [];

    // Update product fields + nested relations in a single transaction
    const updated = await db.product.update({
      where: { id },
      data: {
        name: productFields.name,
        description: productFields.description,
        price: productFields.price ? parseFloat(productFields.price) : undefined,
        compareAtPrice: productFields.compareAtPrice ? parseFloat(productFields.compareAtPrice) : null,
        brandId: productFields.brandId,
        categoryId: productFields.categoryId,
        subCategoryId: productFields.subCategoryId || null,
        gender: productFields.gender || null,
        featured: productFields.featured,
        bestseller: productFields.bestseller,
        newArrival: productFields.newArrival,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        videoUrl: videoUrl || null,
        // Replace all variants (delete old + create new)
        variants: variants
          ? {
              deleteMany: {},
              create: variants.map((v: any) => ({
                name: v.name || '',
                sku: v.sku || null,
                color: v.color || null,
                size: v.size || null,
                material: v.material || null,
                price: v.price ? parseFloat(v.price) : null,
                stock: parseInt(v.stock || '0'),
                image: v.image || null,
              })),
            }
          : undefined,
        // Replace all attributes
        attributes: attributes
          ? {
              deleteMany: {},
              create: attributes.map((a: any) => ({
                name: a.name,
                value: a.value,
              })),
            }
          : undefined,
        // Replace all tag associations
        tags: tagIds.length > 0
          ? {
              deleteMany: {},
              create: tagIds.map((tagId: string) => ({ tagId })),
            }
          : { deleteMany: {} },
      },
      include: {
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
        variants: true,
        attributes: true,
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) return adminUnauthorized();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
