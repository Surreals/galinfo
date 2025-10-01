# Video Thumbnail Upload Feature

## Overview
Added support for uploading custom thumbnails when uploading videos to the admin system. Thumbnails are stored in the `thumburl` field in the database.

## Database Changes

### New Column
Added `thumburl` column to the `a_videos` table:
- **Type**: `VARCHAR(500)`
- **Nullable**: Yes (NULL allowed)
- **Position**: After `description_deflang`

### Migration Script
Run the migration script to add the column to existing databases:
```bash
node scripts/add-thumburl-to-videos.js
```

Or recreate the table with:
```bash
node scripts/setup-videos-table.js
```

## API Changes

### POST `/api/admin/videos/upload`
**Updated Parameters:**
- `file` (required) - Video file to upload
- `thumbnail` (optional) - Thumbnail image file
- `title` (required) - Video title
- `description` (optional) - Video description
- `video_type` (required) - Type: 'news', 'gallery', or 'advertisement'

**Thumbnail Validation:**
- Must be an image file (image/*)
- Maximum size: 5MB (recommended)
- Supported formats: JPG, PNG, GIF, WebP

**Response:**
```json
{
  "success": true,
  "video": {
    "id": 123,
    "filename": "video.mp4",
    "title_ua": "Video Title",
    "thumburl": "/media/videos/thumbnails/a/b/thumbnail.jpg",
    "url": "/media/videos/a/b/video.mp4",
    "thumbnail_url": "/media/videos/thumbnails/a/b/thumbnail.jpg",
    ...
  }
}
```

### GET `/api/admin/videos`
**Updated Response:**
Now includes `thumburl` field from the database. The `thumbnail_url` in the response uses `thumburl` if available, otherwise falls back to the auto-generated path.

## Frontend Changes

### Video Upload Modal
Updated `app/admin/videos/page.tsx` with a comprehensive upload modal that includes:

1. **Video File Selection**
   - Upload button to select video file
   - Validates file type (video/*)
   - Max size: 100MB

2. **Thumbnail Upload (Optional)**
   - Upload button to select thumbnail image
   - Validates file type (image/*)
   - Max size: 5MB
   - Shows preview in upload list

3. **Metadata Fields**
   - Title (required)
   - Description (optional)
   - Video Type (required: news/gallery/advertisement)

## File Storage Structure

Videos and thumbnails are stored with the same directory structure:
```
media/
  videos/
    [first-char]/
      [second-char]/
        video-filename.mp4
    thumbnails/
      [first-char]/
        [second-char]/
          thumbnail-filename.jpg
```

Example:
```
media/
  videos/
    1/
      7/
        1728901234_abc123.mp4
    thumbnails/
      1/
        7/
          1728901234_xyz789.jpg
```

## Usage Instructions

### Admin Panel

1. Navigate to `/admin/videos`
2. Click "Завантажити відео" button
3. In the modal:
   - Click "Вибрати відео" to select your video file
   - Optionally click "Вибрати мініатюру" to upload a custom thumbnail
   - Fill in the title (required)
   - Optionally add a description
   - Select video type
4. Click "Завантажити" to upload

### API Usage

```javascript
const formData = new FormData();
formData.append('file', videoFile);
formData.append('thumbnail', thumbnailFile); // Optional
formData.append('title', 'My Video');
formData.append('description', 'Video description');
formData.append('video_type', 'news');

const response = await fetch('/api/admin/videos/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

## Fallback Behavior

If no thumbnail is uploaded:
- The `thumburl` field will be `NULL` in the database
- The API will return a generated thumbnail URL based on the video filename
- This maintains backward compatibility with videos uploaded before this feature

## Benefits

1. **Custom Thumbnails**: Allows uploading custom, high-quality thumbnails
2. **Better User Experience**: Videos display with proper preview images
3. **SEO Optimization**: Custom thumbnails improve video visibility
4. **Backward Compatible**: Works with existing videos without thumbnails

## Technical Details

### Backend (route.ts)
- Accepts `thumbnail` from FormData
- Validates thumbnail file type and size
- Saves thumbnail with unique filename
- Stores thumbnail URL in database
- Returns thumbnail URL in response

### Frontend (page.tsx)
- New upload modal with video and thumbnail inputs
- Separate state for video and thumbnail files
- Form validation for required fields
- Loading states during upload

### Database (a_videos)
- `thumburl` field stores full thumbnail URL
- NULL allowed for backward compatibility
- Indexed for performance (through filename)

