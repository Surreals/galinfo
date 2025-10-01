import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

/**
 * Serves media files from external storage
 * This route handles requests to /media/* and serves files from MEDIA_STORAGE_PATH
 * Supports Range requests for video streaming
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
      console.error('File not found:', fullPath);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Get file stats
    const fileStats = await stat(fullPath);
    const fileSize = fileStats.size;
    
    // Determine content type based on file extension
    const contentType = getContentType(filePath);
    
    // Check if this is a video file
    const isVideo = contentType.startsWith('video/');
    
    // Handle Range requests for video streaming
    const range = request.headers.get('range');
    
    if (range && isVideo) {
      // Parse Range header (e.g., "bytes=0-1023")
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      const chunkSize = (end - start) + 1;
      
      // Read the file chunk
      const fileBuffer = await readFile(fullPath);
      const chunk = fileBuffer.slice(start, end + 1);
      
      // Return partial content with Range headers
      return new NextResponse(new Uint8Array(chunk), {
        status: 206, // Partial Content
        headers: {
          'Content-Type': contentType,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
    
    // For non-range requests or non-video files, serve the entire file
    const fileBuffer = await readFile(fullPath);
    
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': isVideo ? 'bytes' : 'none',
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
    'ogv': 'video/ogg',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'flv': 'video/x-flv',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'oga': 'audio/ogg',
  };
  
  return contentTypes[ext || ''] || 'application/octet-stream';
}

