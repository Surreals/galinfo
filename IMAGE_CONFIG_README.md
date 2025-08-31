# Image Configuration Guide

## Overview
The HeroSection now fetches real news images from your database and displays them using the main server URL (`https://galinfo.com.ua`) as a temporary solution.

## Current Configuration
- **Base URL**: `https://galinfo.com.ua`
- **Image Path**: `/media/gallery/intxt/`
- **Subdirectory Logic**: Automatically generates subdirectories like `/p/a/` based on filename (e.g., `parubij_08020.jpg` → `/p/a/parubij_08020.jpg`)
- **Full Example**: `https://galinfo.com.ua/media/gallery/intxt/p/a/parubij_08020.jpg`

## How Subdirectory Logic Works

The PHP app organizes images in subdirectories based on the first 2 characters of the filename:

- `parubij_08020.jpg` → `/p/a/parubij_08020.jpg`
- `nikopolshchyna130825.jpg` → `/n/i/nikopolshchyna130825.jpg`
- `pokhoron_khrest_svichka_geroy_smert_pomynalna1919119.jpg` → `/p/o/pokhoron_khrest_svichka_geroy_smert_pomynalna1919119.jpg`
- `vtoplenyk_potopelnyk.jpg` → `/v/t/vtoplenyk_potopelnyk.jpg`
- `dsc-0479.jpg` → `/d/s/dsc-0479.jpg`

This logic is now replicated in the Next.js app to ensure compatibility with the existing image structure.

## How to Change Image Sources

### Option 1: Environment Variables (Recommended)
Add these to your `.env.local` file:

```bash
# To use local images
NEXT_PUBLIC_IMAGE_BASE_URL=http://localhost:3000
NEXT_PUBLIC_IMAGE_NEWS_PATH=/media/gallery/intxt

# To use a CDN
NEXT_PUBLIC_IMAGE_BASE_URL=https://your-cdn.com
NEXT_PUBLIC_IMAGE_NEWS_PATH=/images/news

# To use the main server (current default)
NEXT_PUBLIC_IMAGE_BASE_URL=https://galinfo.com.ua
NEXT_PUBLIC_IMAGE_NEWS_PATH=/media/gallery/intxt
```

### Option 2: Direct Code Change
Edit `app/lib/config.ts`:

```typescript
export const config = {
  images: {
    baseUrl: 'https://your-new-url.com', // Change this
    newsPath: '/your/new/path',          // Change this
    // ... rest of config
  },
  // ... rest of config
}
```

## Why This Approach?

1. **Immediate Solution**: Images work right now using the main server
2. **Correct Path Generation**: Automatically generates the same subdirectory structure as the PHP app (`/p/a/`, `/n/i/`, etc.)
3. **Future Flexibility**: Easy to switch to local images, CDN, or other sources
4. **No Styling Changes**: Your existing Next.js design remains intact
5. **Database Integration**: Real news data from your existing database
6. **Fallback Support**: Placeholder images if no real images are found

## Testing the Current Setup

1. Start your development server: `npm run dev`
2. Visit the homepage
3. Check the browser console for any image loading errors
4. Verify that real news images are displayed in the HeroSection

## Next Steps

When you're ready to use local images:
1. Copy the `/media/gallery/intxt/` folder from your main server to your Next.js `public` folder
2. Set `NEXT_PUBLIC_IMAGE_BASE_URL=http://localhost:3000` in `.env.local`
3. Restart your development server

The HeroSection will automatically use the new image source without any code changes needed.
