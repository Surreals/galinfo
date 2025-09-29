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
