import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminUnauthorized } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return adminUnauthorized();
  try {
    const body = await request.json();
    const { name, categoryId, description, image } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const subCategory = await db.subCategory.create({
      data: {
        name,
        slug,
        categoryId,
        description: description || null,
        image: image || null,
      },
    });

    return NextResponse.json(subCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create subcategory' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) return adminUnauthorized();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'SubCategory ID required' }, { status: 400 });
    }

    await db.subCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete subcategory' }, { status: 500 });
  }
}
