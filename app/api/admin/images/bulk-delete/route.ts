import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No image IDs provided' },
        { status: 400 }
      );
    }

    // Validate all IDs are numbers
    const imageIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (imageIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid image IDs' },
        { status: 400 }
      );
    }

    // Get image information before deleting
    const placeholders = imageIds.map(() => '?').join(',');
    const selectQuery = `
      SELECT id, filename, pic_type
      FROM a_pics 
      WHERE id IN (${placeholders})
    `;
    
    const [imagesData] = await executeQuery(selectQuery, imageIds);
    
    if (imagesData.length === 0) {
      return NextResponse.json(
        { error: 'No images found' },
        { status: 404 }
      );
    }

    // Use external storage path if configured, otherwise fallback to public directory
    const mediaPath = process.env.MEDIA_STORAGE_PATH;
    const basePath = mediaPath 
      ? mediaPath 
      : join(process.cwd(), 'public', 'media');
    
    const sizes = ['full', 'tmb', 'intxt'];
    let deletedFiles = 0;
    let failedFiles = 0;

    // Delete image files from filesystem
    for (const image of imagesData) {
      try {
        const filename = image.filename;
        const firstChar = filename.charAt(0);
        const secondChar = filename.charAt(1);
        
        // Delete all three sizes (full, tmb, intxt)
        for (const size of sizes) {
          try {
            const imagePath = join(basePath, 'gallery', size, firstChar, secondChar, filename);
            await unlink(imagePath);
            deletedFiles++;
          } catch (fileError) {
            console.warn(`${size} image file not found or already deleted:`, filename);
            failedFiles++;
          }
        }
        
      } catch (fileError) {
        console.warn('Error deleting image files for image:', image.id, fileError);
        failedFiles++;
      }
    }

    // Delete from database
    const deleteQuery = `
      DELETE FROM a_pics 
      WHERE id IN (${placeholders})
    `;
    
    const [result] = await executeQuery(deleteQuery, imageIds);
    
    const deletedCount = (result as any).affectedRows;

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} image(s)`,
      deleted: deletedCount,
      deletedFiles,
      failedFiles
    });

  } catch (error) {
    console.error('Error bulk deleting images:', error);
    return NextResponse.json(
      { error: 'Failed to delete images' },
      { status: 500 }
    );
  }
}

