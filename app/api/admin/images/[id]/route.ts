import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { getImageUrl } from '@/app/lib/imageUtils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const imageId = parseInt(id);
    
    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    // Get image information before deleting
    const selectQuery = `
      SELECT filename, pic_type
      FROM a_pics 
      WHERE id = ?
    `;
    
    const [imageData] = await executeQuery(selectQuery, [imageId]);
    
    if (imageData.length === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const image = imageData[0];
    
    // Delete image files from filesystem
    try {
      const filename = image.filename;
      const firstChar = filename.charAt(0);
      const secondChar = filename.charAt(1);
      
      // Use external storage path if configured, otherwise fallback to public directory
      const mediaPath = process.env.MEDIA_STORAGE_PATH;
      const basePath = mediaPath 
        ? mediaPath 
        : join(process.cwd(), 'public', 'media');
      
      // Delete all three sizes (full, tmb, intxt)
      const sizes = ['full', 'tmb', 'intxt'];
      
      for (const size of sizes) {
        try {
          const imagePath = join(basePath, 'gallery', size, firstChar, secondChar, filename);
          await unlink(imagePath);
          console.log(`Deleted ${size} image file:`, imagePath);
        } catch (fileError) {
          console.warn(`${size} image file not found or already deleted:`, filename);
        }
      }
      
    } catch (fileError) {
      console.warn('Error deleting image files:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const deleteQuery = `
      DELETE FROM a_pics 
      WHERE id = ?
    `;
    
    const [result] = await executeQuery(deleteQuery, [imageId]);
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const imageId = parseInt(id);
    
    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title_ua, title_deflang, pic_type, tags } = body;

    // Convert pic_type string to integer
    const getPicTypeId = (type: string): number => {
      const typeMap: { [key: string]: number } = {
        'news': 1,
        'gallery': 2,
        'avatar': 3,
        'banner': 4
      };
      return typeMap[type] || 2;
    };

    const updateQuery = `
      UPDATE a_pics 
      SET 
        title_ua = ?,
        title_deflang = ?,
        pic_type = ?,
        tags = ?
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [
      title_ua,
      title_deflang,
      getPicTypeId(pic_type),
      tags || null,
      imageId
    ]);

    // Get updated image data
    const selectQuery = `
      SELECT 
        id,
        filename,
        title_ua,
        title_deflang,
        pic_type,
        tags
      FROM a_pics 
      WHERE id = ?
    `;
    
    const [imageData] = await executeQuery(selectQuery, [imageId]);

    if (imageData.length === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const image = imageData[0];

    // Convert pic_type integer back to string for API response
    const getPicTypeString = (typeId: number): string => {
      const typeMap: { [key: number]: string } = {
        1: 'news',
        2: 'gallery',
        3: 'avatar',
        4: 'banner'
      };
      return typeMap[typeId] || 'gallery';
    };

    const imageWithUrl = {
      ...image,
      pic_type: getPicTypeString(image.pic_type),
      url: getImageUrl(image.filename, 'full'),
      thumbnail_url: getImageUrl(image.filename, 'tmb')
    };

    return NextResponse.json({
      success: true,
      image: imageWithUrl
    });

  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

