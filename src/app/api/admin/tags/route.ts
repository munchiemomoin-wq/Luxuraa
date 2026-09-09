import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminUnauthorized } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return adminUnauthorized();
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const tag = await db.tag.create({
      data: { name, slug },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create tag' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) return adminUnauthorized();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Tag ID required' }, { status: 400 });
    }

    await db.tag.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete tag' }, { status: 500 });
  }
}
