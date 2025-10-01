import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Serves media files from external storage
 * This route handles requests to /media/* and serves files from MEDIA_STORAGE_PATH
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the file path from the URL
    const filePath = params.path.join('/');
    
    // Determine the base path (external storage or public directory)
    const mediaPath = process.env.MEDIA_STORAGE_PATH;
    const basePath = mediaPath 
      ? mediaPath 
      : join(process.cwd(), 'public', 'media');
    
    // Full path to the requested file
    const fullPath = join(basePath, filePath);
    
    // Security check: ensure the path is within the allowed directory
    const normalizedBasePath = basePath.replace(/\\/g, '/');
    const normalizedFullPath = fullPath.replace(/\\/g, '/');
    
    if (!normalizedFullPath.startsWith(normalizedBasePath)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileBuffer = await readFile(fullPath);
    
    // Determine content type based on file extension
    const contentType = getContentType(filePath);
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Error serving media file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}

/**
 * Determine content type based on file extension
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const contentTypes: { [key: string]: string } = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    
    // Videos
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'flv': 'video/x-flv',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
  };
  
  return contentTypes[ext || ''] || 'application/octet-stream';
}

