import dayjs from 'dayjs';
import { config } from './config';

interface NewsItem {
  id: string;
  ndate: string;
  ntime: string;
  ntype: number;
  images: string;
  urlkey: string;
  photo: string;
  video: string;
  udate: number;
  nheader: string;
  nteaser: string;
  sheader: string;
  steaser: string;
  qty: number;
  image_filenames: string;
}

export function formatNewsDate(ndate: string, udate: number): string {
  const now = dayjs();
  const newsTime = dayjs.unix(udate);
  
  // If news is from today, show time
  if (newsTime.isSame(now, 'day')) {
    return newsTime.format('HH:mm');
  }
  
  // If news is from yesterday, show "вчора"
  if (newsTime.isSame(now.subtract(1, 'day'), 'day')) {
    return 'вчора';
  }
  
  // Otherwise show date
  return newsTime.format('DD.MM');
}

export function generateArticleUrl(newsItem: NewsItem): string {
  // Use the urlkey if available, otherwise generate from date and id
  if (newsItem.urlkey) {
    return `/article/${newsItem.urlkey}`;
  }
  
  // Generate URL from date and id (similar to PHP app's articleLink function)
  const dateParts = newsItem.ndate.split('-');
  if (dateParts.length === 3) {
    const [year, month, day] = dateParts;
    return `/article/${year}/${month}/${day}/${newsItem.id}`;
  }
  
  // Fallback to simple id-based URL
  return `/article/${newsItem.id}`;
}

// Helper function to generate image path with subdirectories (like PHP app)
function generateImagePath(filename: string): string {
  // Extract the part before the extension
  const match = filename.match(/^(.+?)(\.[^.]+)$/);
  if (!match) return filename;
  
  const nameWithoutExt = match[1];
  const extension = match[2];
  
  // Take first 2 characters
  const firstTwoChars = nameWithoutExt.substring(0, 2);
  
  // Split into individual characters and create path
  const pathParts = firstTwoChars.split('').map(char => {
    // If character is alphanumeric, use it; otherwise use 'other'
    return /[A-Za-z0-9]/.test(char) ? char : 'other';
  });
  
  // Ensure we have exactly 2 parts
  while (pathParts.length < 2) {
    pathParts.push('other');
  }
  
  // Create the subdirectory path
  const subPath = pathParts.slice(0, 2).join('/');
  
  return `${subPath}/${filename}`;
}

export function getNewsImage(newsItem: NewsItem): string | null {
  // Check if there's a photo field first
  if (newsItem.photo && newsItem.photo.trim() !== '') {
    // If photo is a full URL, return it as is
    if (newsItem.photo.startsWith('http://') || newsItem.photo.startsWith('https://')) {
      return newsItem.photo;
    }
    // If photo is a relative path, return it as is
    if (newsItem.photo.startsWith('/')) {
      return newsItem.photo;
    }
    // Otherwise, assume it's a filename and construct the path with subdirectories
    const imagePath = generateImagePath(newsItem.photo);
    return config.images.getNewsImagePath(imagePath);
  }
  
  // Check if we have image_filenames from the database join
  if (newsItem.image_filenames && newsItem.image_filenames.trim() !== '') {
    const filenames = newsItem.image_filenames.split(',').map(f => f.trim());
    if (filenames.length > 0) {
      const imagePath = generateImagePath(filenames[0]);
      return config.images.getNewsImagePath(imagePath);
    }
  }
  
  // Check if there are images in the images field
  if (newsItem.images && newsItem.images.trim() !== '') {
    try {
      // First try to parse as JSON
      const imageData = JSON.parse(newsItem.images);
      if (Array.isArray(imageData) && imageData.length > 0) {
        // Return the first image path
        if (imageData[0].filename) {
          const imagePath = generateImagePath(imageData[0].filename);
          return config.images.getNewsImagePath(imagePath);
        }
      }
    } catch (e) {
      // If parsing fails, try different formats
      
      // Check if it's a comma-separated list of filenames
      if (newsItem.images.includes(',')) {
        const filenames = newsItem.images.split(',').map(f => f.trim());
        if (filenames.length > 0) {
          const imagePath = generateImagePath(filenames[0]);
          return config.images.getNewsImagePath(imagePath);
        }
      }
      
      // Check if it's a single filename
      if (newsItem.images.includes('filename')) {
        // Extract filename from the images string
        const match = newsItem.images.match(/"filename":"([^"]+)"/);
        if (match) {
          const imagePath = generateImagePath(match[1]);
          return config.images.getNewsImagePath(imagePath);
        }
      }
      
      // If it looks like a filename (no spaces, has extension)
      if (!newsItem.images.includes(' ') && (newsItem.images.includes('.jpg') || newsItem.images.includes('.jpeg') || newsItem.images.includes('.png') || newsItem.images.includes('.gif'))) {
        const imagePath = generateImagePath(newsItem.images);
        return config.images.getNewsImagePath(imagePath);
      }
    }
  }
  
  // Return null if no image is available
  return null;
}

export function getNewsTitle(newsItem: NewsItem): string {
  // Use slide header if available, otherwise use regular header
  return newsItem.sheader || newsItem.nheader || 'Без заголовка';
}

export function getNewsTeaser(newsItem: NewsItem): string {
  // Use slide teaser if available, otherwise use regular teaser
  return newsItem.steaser || newsItem.nteaser || '';
}
