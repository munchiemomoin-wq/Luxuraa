import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminUnauthorized } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!requireAdmin()) return adminUnauthorized();
  try {
    const body = await request.json();
    const { name, slug, description, country, foundedYear, logo } = body;

    const brand = await db.brand.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description || null,
        country: country || null,
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
        logo: logo || null,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create brand' }, { status: 500 });
  }
}
