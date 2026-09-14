import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { CLOUDINARY_FOLDER } from '@/lib/cloudinary';
import { requireAdmin, adminUnauthorized } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return adminUnauthorized();

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: CLOUDINARY_FOLDER,
                resource_type: 'image',
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as { secure_url: string });
              }
            )
            .end(buffer);
        });

        urls.push(result.secure_url);
      } catch (err: any) {
        console.error('Upload error for file:', file.name, err);
        errors.push(`Failed to upload ${file.name}`);
      }
    }

    return NextResponse.json({ urls, errors });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
