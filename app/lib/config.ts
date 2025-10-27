// Configuration file for easy maintenance and future changes

export const config = {
  // Image configuration
  images: {
    // Base URL for news images - використовуємо тільки серверний IP
    baseUrl: process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://89.116.31.189',
    // Path to news images relative to base URL
    newsPath: process.env.NEXT_PUBLIC_IMAGE_NEWS_PATH || '/media/gallery/full',
    // Full path for news images
    getNewsImagePath: (filename: string) => {
      const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://89.116.31.189';
      const newsPath = process.env.NEXT_PUBLIC_IMAGE_NEWS_PATH || '/media/gallery/full';
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
    // Тепер API автоматично генерує розміри з fallback на full
    paths: {
      images: {
        full: '/gallery/full',   // Оригінальні зображення
        tmb: '/gallery/tmb',     // Мініатюри 150px (генеруються API)
        intxt: '/gallery/intxt', // Середні зображення 800px (генеруються API)
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
