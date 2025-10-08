import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id);
    
    if (isNaN(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID' },
        { status: 400 }
      );
    }

    // Get video information before deleting
    const selectQuery = `
      SELECT filename, video_type, thumburl
      FROM a_videos 
      WHERE id = ?
    `;
    
    const [videoData] = await executeQuery(selectQuery, [videoId]);
    
    if (videoData.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const video = videoData[0];
    
    // Delete video files from filesystem
    try {
      const filename = video.filename;
      const firstChar = filename.charAt(0);
      const secondChar = filename.charAt(1);
      
      // Use external storage path if configured, otherwise fallback to public directory
      const mediaPath = process.env.MEDIA_STORAGE_PATH;
      const basePath = mediaPath 
        ? mediaPath 
        : join(process.cwd(), 'public', 'media');
      
      // Video file path
      const videoPath = join(basePath, 'videos', firstChar, secondChar, filename);
      
      // Delete video file
      try {
        await unlink(videoPath);
        console.log('Deleted video file:', videoPath);
      } catch (fileError) {
        console.warn('Video file not found or already deleted:', videoPath);
      }
      
      // Delete thumbnail file if thumburl exists
      if (video.thumburl) {
        try {
          // Extract filename from thumburl
          const thumbFilename = video.thumburl.split('/').pop();
          if (thumbFilename) {
            const thumbFirstChar = thumbFilename.charAt(0);
            const thumbSecondChar = thumbFilename.charAt(1);
            const thumbnailPath = join(basePath, 'videos', 'thumbnails', thumbFirstChar, thumbSecondChar, thumbFilename);
            await unlink(thumbnailPath);
            console.log('Deleted thumbnail file:', thumbnailPath);
          }
        } catch (fileError) {
          console.warn('Thumbnail file not found or already deleted:', video.thumburl);
        }
      }
      
    } catch (fileError) {
      console.warn('Error deleting video files:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const deleteQuery = `
      DELETE FROM a_videos 
      WHERE id = ?
    `;
    
    const [result] = await executeQuery(deleteQuery, [videoId]);
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
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
    const videoId = parseInt(id);
    
    if (isNaN(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title_ua, title_deflang, description_ua, description_deflang, video_type } = body;

    // Convert video_type string to integer
    const getVideoTypeId = (type: string): number => {
      const typeMap: { [key: string]: number } = {
        'news': 1,
        'gallery': 2,
        'advertisement': 3
      };
      return typeMap[type] || 1;
    };

    const updateQuery = `
      UPDATE a_videos 
      SET 
        title_ua = ?,
        title_deflang = ?,
        description_ua = ?,
        description_deflang = ?,
        video_type = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [
      title_ua,
      title_deflang,
      description_ua,
      description_deflang,
      getVideoTypeId(video_type),
      videoId
    ]);

    // Get updated video data
    const selectQuery = `
      SELECT 
        id,
        filename,
        title_ua,
        title_deflang,
        description_ua,
        description_deflang,
        thumburl,
        duration,
        file_size,
        mime_type,
        video_type,
        created_at
      FROM a_videos 
      WHERE id = ?
    `;
    
    const [videoData] = await executeQuery(selectQuery, [videoId]);

    if (videoData.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const video = videoData[0];

    // Convert video_type integer back to string for API response
    const getVideoTypeString = (typeId: number): string => {
      const typeMap: { [key: number]: string } = {
        1: 'news',
        2: 'gallery',
        3: 'advertisement'
      };
      return typeMap[typeId] || 'news';
    };

    // Generate video URLs
    const firstChar = video.filename.charAt(0);
    const secondChar = video.filename.charAt(1);
    const videoUrl = `/media/videos/${firstChar}/${secondChar}/${video.filename}`;
    const fallbackThumbnailUrl = `/media/videos/thumbnails/${firstChar}/${secondChar}/${video.filename}`;

    const videoWithUrl = {
      ...video,
      video_type: getVideoTypeString(video.video_type),
      url: videoUrl,
      thumbnail_url: video.thumburl || fallbackThumbnailUrl
    };

    return NextResponse.json({
      success: true,
      video: videoWithUrl
    });

  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}
