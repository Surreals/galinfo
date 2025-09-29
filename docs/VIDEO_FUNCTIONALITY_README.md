# Video Functionality Documentation

## Overview

This document describes the video functionality implementation in the GalInfo project. The system allows users to upload, manage, and display videos in articles using EditorJS.

## Features

- **Video Upload**: Upload video files through the admin interface
- **EditorJS Integration**: Add videos directly in the article editor using custom video tool
- **Video Management**: Admin panel for managing uploaded videos
- **Video Display**: Automatic video rendering on article pages
- **Database Storage**: Videos stored in `a_videos` table with metadata
- **Custom Implementation**: Reliable custom video tool (no third-party dependencies)

## Database Schema

### a_videos Table

```sql
CREATE TABLE a_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  title_ua VARCHAR(500),
  title_deflang VARCHAR(500),
  description_ua TEXT,
  description_deflang TEXT,
  duration INT DEFAULT 0,
  file_size BIGINT DEFAULT 0,
  mime_type VARCHAR(100),
  video_type TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Video Types
- `1` - News videos
- `2` - Gallery videos  
- `3` - Advertisement videos

## File Structure

### API Endpoints

- `GET /api/admin/videos` - List videos with pagination and filtering
- `POST /api/admin/videos/upload` - Upload new video file
- `PUT /api/admin/videos/[id]` - Update video metadata
- `DELETE /api/admin/videos/[id]` - Delete video and associated files

### Components

- `app/admin/videos/page.tsx` - Video management admin page
- `app/admin/videos/videos.module.css` - Styling for video management
- `app/lib/videoUtils.ts` - Video utility functions

### EditorJS Integration

- `app/admin/article-editor/components/EditorJSClient.tsx` - Updated with custom video tool
- `app/admin/article-editor/components/VideoTool.ts` - Custom video tool implementation
- Video tool configuration with upload endpoints

## Usage

### 1. Setting Up Videos Table

Run the database setup script:

```bash
node scripts/setup-videos-table.js
```

### 2. Uploading Videos

#### Through Admin Panel
1. Navigate to `/admin/videos`
2. Click "Завантажити відео" button
3. Select video file (supports MP4, WebM, OGG, AVI, MOV, WMV)
4. Video will be uploaded and stored in database

#### Through EditorJS
1. Open article editor
2. Click the video tool button
3. Upload file or paste video URL
4. Add caption if needed
5. Video will be embedded in article content

### 3. Video Storage

Videos are stored in the following structure:
```
public/media/videos/
├── {first_char}/{second_char}/  # Based on filename
│   └── {filename}
└── thumbnails/
    └── {first_char}/{second_char}/
        └── {filename}  # Video thumbnails (future feature)
```

### 4. Video Display

Videos are automatically rendered on article pages with:
- HTML5 video player with controls
- Responsive design
- Support for multiple video formats
- Caption display
- Styling with rounded corners and shadow

## Configuration

### EditorJS Video Tool Config

```typescript
video: {
  class: VideoTool,
  config: {
    endpoints: {
      byFile: '/api/admin/videos/upload',
      byUrl: '/api/admin/videos/upload',
    },
    field: 'file',
    types: 'video/*',
    captionPlaceholder: 'Введіть підпис до відео',
    buttonContent: 'Вибрати відео',
  }
}
```

### Video Upload Limits

- Maximum file size: 100MB
- Supported formats: MP4, WebM, OGG, AVI, MOV, WMV
- File naming: `{timestamp}_{random}.{extension}`

## API Reference

### Upload Video

**POST** `/api/admin/videos/upload`

**Form Data:**
- `file` (File) - Video file to upload
- `title` (string) - Video title
- `video_type` (string) - Type: 'news', 'gallery', 'advertisement'
- `description` (string) - Video description

**Response:**
```json
{
  "success": true,
  "video": {
    "id": 1,
    "filename": "1234567890_abc123.mp4",
    "title_ua": "Video Title",
    "url": "/media/videos/1/2/1234567890_abc123.mp4",
    "file_size": 1024000,
    "mime_type": "video/mp4",
    "video_type": "news"
  }
}
```

### Update Video

**PUT** `/api/admin/videos/[id]`

**Request Body:**
```json
{
  "title_ua": "Updated Title",
  "title_deflang": "Updated Title",
  "description_ua": "Updated Description",
  "description_deflang": "Updated Description",
  "video_type": "news"
}
```

**Response:**
```json
{
  "success": true,
  "video": {
    "id": 1,
    "filename": "1234567890_abc123.mp4",
    "title_ua": "Updated Title",
    "url": "/media/videos/1/2/1234567890_abc123.mp4",
    "video_type": "news"
  }
}
```

### Delete Video

**DELETE** `/api/admin/videos/[id]`

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### List Videos

**GET** `/api/admin/videos`

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `search` (string) - Search term
- `video_type` (string) - Filter by type

**Response:**
```json
{
  "videos": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Utility Functions

### videoUtils.ts

- `getVideoUrl(filename)` - Generate video URL
- `getVideoThumbnailUrl(filename)` - Generate thumbnail URL
- `formatVideoDuration(seconds)` - Format duration as HH:MM:SS
- `formatFileSize(bytes)` - Format file size
- `isSupportedVideoFormat(mimeType)` - Check if format is supported

## Testing

Run the video upload test:

```bash
node scripts/test-video-upload.js
```

## Future Enhancements

- [ ] Video thumbnail generation using FFmpeg
- [ ] Video compression and optimization
- [ ] Video streaming support
- [ ] Video analytics and statistics
- [ ] Bulk video operations
- [ ] Video search and filtering improvements
- [ ] Video metadata extraction (duration, resolution, etc.)

## Troubleshooting

### Common Issues

1. **Upload fails with "File must be a video"**
   - Check file MIME type
   - Ensure file extension matches content

2. **Video not displaying on article page**
   - Check video URL generation
   - Verify file exists in public directory
   - Check browser console for errors

3. **Database connection errors**
   - Verify database credentials
   - Ensure `a_videos` table exists
   - Run setup script if needed

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=video:*
```

## Security Considerations

- File upload validation prevents malicious files
- File size limits prevent abuse
- MIME type validation ensures only videos are uploaded
- Database queries use parameterized statements
- File paths are sanitized to prevent directory traversal

## Performance Notes

- Videos are stored with subdirectory structure for better file system performance
- Thumbnail generation can be added for faster loading
- Consider CDN integration for large video files
- Implement video compression for web optimization
