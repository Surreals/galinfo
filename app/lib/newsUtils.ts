import dayjs from 'dayjs';

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

export function getNewsImage(newsItem: NewsItem): string | null {
  // Check if there's a photo field first
  if (newsItem.photo) {
    return newsItem.photo;
  }
  
  // Check if there are images in the images field
  if (newsItem.images) {
    try {
      const imageData = JSON.parse(newsItem.images);
      if (Array.isArray(imageData) && imageData.length > 0) {
        // Return the first image path
        return `/media/gallery/intxt/${imageData[0].filename}`;
      }
    } catch (e) {
      // If parsing fails, try to use the raw string
      if (newsItem.images.includes('filename')) {
        // Extract filename from the images string
        const match = newsItem.images.match(/"filename":"([^"]+)"/);
        if (match) {
          return `/media/gallery/intxt/${match[1]}`;
        }
      }
    }
  }
  
  // Return a placeholder image if no image is available
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
