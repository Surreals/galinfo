// Configuration file for easy maintenance and future changes

export const config = {
  // Image configuration
  images: {
    // Base URL for news images - can be easily changed via environment variable or hardcoded
    baseUrl: process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://galinfo.com.ua',
    // Path to news images relative to base URL
    newsPath: process.env.NEXT_PUBLIC_IMAGE_NEWS_PATH || '/media/gallery/intxt',
    // Full path for news images
    getNewsImagePath: (filename: string) => {
      const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://galinfo.com.ua';
      const newsPath = process.env.NEXT_PUBLIC_IMAGE_NEWS_PATH || '/media/gallery/intxt';
      return `${baseUrl}${newsPath}/${filename}`;
    },
  },
  
  // Media storage configuration (for uploads)
  storage: {
    // External path for storing uploaded media files
    // This should be an absolute path outside the project directory
    // Example for Windows: 'C:/media/galinfo' or 'D:/uploads/galinfo'
    // Example for Linux: '/var/www/media/galinfo' or '/home/user/uploads/galinfo'
    mediaPath: process.env.MEDIA_STORAGE_PATH || '',
    
    // Public URL for accessing uploaded media
    // This should match your web server configuration
    mediaUrl: process.env.NEXT_PUBLIC_MEDIA_URL || '/media',
    
    // Subdirectories for different media types
    paths: {
      images: {
        full: '/gallery/full',
        tmb: '/gallery/tmb',
        intxt: '/gallery/intxt',
      },
      videos: {
        files: '/videos',
        thumbnails: '/videos/thumbnails',
      },
    },
    
    // Helper function to get absolute storage path
    getStoragePath: (...segments: string[]): string => {
      const mediaPath = process.env.MEDIA_STORAGE_PATH;
      if (!mediaPath) {
        // Fallback to project's public directory if no external path is configured
        return segments.join('/').replace(/\/+/g, '/');
      }
      return [mediaPath, ...segments].join('/').replace(/\/+/g, '/');
    },
    
    // Helper function to get public URL for media
    getMediaUrl: (...segments: string[]): string => {
      const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || '/media';
      return [mediaUrl, ...segments].join('/').replace(/\/+/g, '/');
    },
  },
  
  // API configuration
  api: {
    // Base URL for API endpoints
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://galinfo.com.ua' 
      : 'http://localhost:3000',
    // Request timeout in milliseconds (60 seconds)
    timeout: 60000,
    // Retry configuration
    retries: {
      maxAttempts: 2,
      delay: 1000, // 1 second delay between retries
    },
  },
  
  // Database configuration
  database: {
    // Language ID for Ukrainian content
    defaultLanguage: '1',
  },
} as const;
