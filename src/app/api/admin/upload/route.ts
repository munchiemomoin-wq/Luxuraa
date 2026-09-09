import { NextResponse } from 'next/server';
import cloudinary, { CLOUDINARY_FOLDER } from '@/lib/cloudinary';
import { requireAdmin, adminUnauthorized } from '@/lib/admin-auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 6;

function getCloudinaryFormat(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
  };
  return map[mimeType] || 'jpg';
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return adminUnauthorized();

  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      { error: 'Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed` }, { status: 400 });
    }

    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 5MB)`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Convert to base64 for Cloudinary upload
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        const result = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload(
            base64,
            {
              folder: CLOUDINARY_FOLDER,
              resource_type: 'image',
              format: getCloudinaryFormat(file.type),
              transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });

        urls.push(result.secure_url);
      } catch (err: any) {
        errors.push(`${file.name}: Upload failed`);
        console.error('Cloudinary upload error:', err);
      }
    }

    return NextResponse.json({ urls, errors });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Delete an image from Cloudinary
export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return adminUnauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ error: 'publicId required' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
