import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ADMIN_TOKEN = 'luxuraa_admin_session';

export function requireAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_TOKEN);

  if (!token || token.value !== 'authenticated') {
    return false;
  }
  return true;
}

export function adminUnauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export { ADMIN_TOKEN };
