import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json(brands);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
