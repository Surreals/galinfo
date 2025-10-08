import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `ad-${timestamp}-${originalName}`;

    // Determine storage path
    const storageBasePath = process.env.MEDIA_STORAGE_PATH;
    let uploadDir: string;
    let publicUrl: string;

    if (storageBasePath && storageBasePath.trim() !== '') {
      // Use external storage
      uploadDir = path.join(storageBasePath, 'advertisements');
      const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || '/media';
      publicUrl = `${mediaUrl}/advertisements/${fileName}`;
    } else {
      // Use public directory
      uploadDir = path.join(process.cwd(), 'public', 'media', 'advertisements');
      publicUrl = `/media/advertisements/${fileName}`;
    }

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        url: publicUrl,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('Error uploading advertisement image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

