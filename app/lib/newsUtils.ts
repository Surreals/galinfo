import dayjs from 'dayjs';
import { config } from './config';
import { ensureFullImageUrl, generateImagePath, getImageUrl } from './imageUtils';

interface NewsItem {
  id: string;
  ndate: string;
  ntime: string;
  ntype: number;
  images: string | any[]; // Може бути рядок або масив об'єктів з новою структурою
  urlkey: string;
  photo: string | number | null; // Може бути рядком, числом або null
  video: string;
  udate: number;
  nheader: string;
  nteaser: string;
  sheader: string;
  steaser: string;
  qty: number;
  image_filenames: Array<{
    id: number;
    filename: string;
    title_ua?: string;
    title_deflang?: string;
    pic_type?: number;
  }>;
  nweight: number;
}

// Нова структура зображення з API
interface ApiImageUrls {
  full: string;
  intxt: string;
  tmb: string;
}

interface ApiImage {
  urls: ApiImageUrls;
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

// Нова функція для повного формату дати: "13 серпня 2025 р., 14:13"
export function formatFullNewsDate(ndate: string, ntime?: string): string {
  // Створюємо дату з UTC часу (додаємо Z для вказування UTC)
  const dateTimeString = ntime ? `${ndate}T${ntime}` : ndate;
  const dateObj = new Date(dateTimeString);

  // Форматуємо дату: "13 серпня 2025" (без 'р.')
  const dateStr = dateObj.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).replace(' р.', ''); // Прибираємо 'р.' з року

  // Використовуємо локальний час (автоматично конвертується з UTC)
  const localTime = dateObj.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `${dateStr} ${localTime}`;
}

export function generateArticleUrl(newsItem: NewsItem): string {
  // Use the urlkey if available, otherwise generate from date and id
  if (newsItem.urlkey) {
    return `/news/${newsItem.urlkey}_${newsItem.id}`;
  }

  // Generate URL from date and id (similar to PHP app's articleLink function)
  if (newsItem.ndate && typeof newsItem.ndate === 'string') {
    const dateParts = newsItem.ndate.split('-');
    if (dateParts.length === 3) {
      const [year, month, day] = dateParts;
      return `/article/${year}/${month}/${day}/${newsItem.id}`;
    }
  }

  // Fallback to simple id-based URL
  return `/article/${newsItem.id}`;
}


export function getNewsImage(newsItem: NewsItem, size: keyof ApiImageUrls = 'intxt'): string | null {
  // Спочатку перевіряємо, чи є нова структура зображень (масив об'єктів з urls)
  if (Array.isArray(newsItem.images) && newsItem.images.length > 0) {
    const firstImage = newsItem.images[0] as ApiImage;
    if (firstImage && firstImage.urls && firstImage.urls[size]) {
      return ensureFullImageUrl(firstImage.urls[size]);
    }
    // Якщо немає потрібного розміру, спробуємо інші розміри
    if (firstImage && firstImage.urls) {
      const fallbackUrl = firstImage.urls.intxt || firstImage.urls.full || firstImage.urls.tmb;
      return fallbackUrl ? ensureFullImageUrl(fallbackUrl) : null;
    }
  }

  // Check if there's a photo field first
  if (newsItem.photo && newsItem.photo.toString().trim() !== '') {
    const photoStr = newsItem.photo.toString();
    // If photo is a full URL, return it as is
    if (photoStr.startsWith('http://') || photoStr.startsWith('https://')) {
      return photoStr;
    }
    // If photo is a relative path, ensure it has full URL
    if (photoStr.startsWith('/')) {
      return ensureFullImageUrl(photoStr);
    }
    // Otherwise, assume it's a filename and construct the path with subdirectories
    const imagePath = generateImagePath(photoStr);
    return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
  }

  // Check if we have image_filenames from the database join
  if (newsItem.image_filenames && Array.isArray(newsItem.image_filenames) && newsItem.image_filenames.length > 0) {
    const imagePath = generateImagePath(newsItem.image_filenames[0].filename);
    return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
  }

  // Check if there are images in the images field (стара структура - рядок)
  if (typeof newsItem.images === 'string' && newsItem.images.trim() !== '') {
    try {
      // First try to parse as JSON
      const imageData = JSON.parse(newsItem.images);
      if (Array.isArray(imageData) && imageData.length > 0) {
        // Перевіряємо, чи це нова структура з urls
        if (imageData[0].urls && ensureFullImageUrl(imageData[0].urls[size])) {
          return ensureFullImageUrl(imageData[0].urls[size]);
        }
        // Якщо це стара структура з filename
        if (imageData[0].filename) {
          const imagePath = generateImagePath(imageData[0].filename);
          return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
        }
      }
    } catch (e) {
      // If parsing fails, try different formats

      // Check if it's a comma-separated list of filenames
      if (newsItem.images.includes(',')) {
        const filenames = newsItem.images.split(',').map((f: string) => f.trim());
        if (filenames.length > 0) {
          const imagePath = generateImagePath(filenames[0]);
          return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
        }
      }

      // Check if it's a single filename
      if (newsItem.images.includes('filename')) {
        // Extract filename from the images string
        const match = newsItem.images.match(/"filename":"([^"]+)"/);
        if (match) {
          const imagePath = generateImagePath(match[1]);
          return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
        }
      }

      // If it looks like a filename (no spaces, has extension)
      if (!newsItem.images.includes(' ') && (newsItem.images.includes('.jpg') || newsItem.images.includes('.jpeg') || newsItem.images.includes('.png') || newsItem.images.includes('.gif'))) {
        const imagePath = generateImagePath(newsItem.images);
        return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
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

// Універсальний тип для новин з різних джерел
type UniversalNewsItem = {
  id: number | string;
  images: any;
  photo?: string | number;
  image_filenames?: Array<{
    id: number;
    filename: string;
    title_ua?: string;
    title_deflang?: string;
    pic_type?: number;
  }>;
  [key: string]: any; // Дозволяємо додаткові поля
};

// Нові функції для роботи з різними розмірами зображень
export function getNewsImageFull(newsItem: UniversalNewsItem): string | null {
  return getNewsImage(newsItem as NewsItem, 'full');
}

export function getNewsImageIntxt(newsItem: UniversalNewsItem): string | null {
  return getNewsImage(newsItem as NewsItem, 'intxt');
}

export function getNewsImageThumbnail(newsItem: UniversalNewsItem): string | null {
  return getNewsImage(newsItem as NewsItem, 'tmb');
}

// Функція для отримання всіх зображень новини
export function getAllNewsImages(newsItem: NewsItem): ApiImage[] {
  if (Array.isArray(newsItem.images)) {
    return newsItem.images.filter(img => img && img.urls) as ApiImage[];
  }

  // Якщо це рядок, спробуємо парсити
  if (typeof newsItem.images === 'string' && newsItem.images.trim() !== '') {
    try {
      const imageData = JSON.parse(newsItem.images);
      if (Array.isArray(imageData)) {
        return imageData.filter(img => img && img.urls) as ApiImage[];
      }
    } catch (e) {
      // Ігноруємо помилки парсингу
    }
  }

  return [];
}

// Функція для перевірки наявності зображень
export function hasNewsImages(newsItem: NewsItem): boolean {
  return getAllNewsImages(newsItem).length > 0;
}

// Функція для перевірки наявності фото у новині (універсальна)
export function hasNewsPhoto(newsItem: any): boolean {
  // Перевіряємо різні поля, які можуть містити фото
  if (newsItem.photo && newsItem.photo.toString().trim() !== '') {
    return true;
  }

  if (newsItem.image_filenames && Array.isArray(newsItem.image_filenames) && newsItem.image_filenames.length > 0) {
    return true;
  }

  if (Array.isArray(newsItem.images) && newsItem.images.length > 0) {
    return true;
  }

  if (Array.isArray(newsItem.images_data) && newsItem.images_data.length > 0) {
    return true;
  }

  if (typeof newsItem.images === 'string' && newsItem.images.trim() !== '') {
    return true;
  }

  return false;
}


export function getImageFromImageData(
  image: any,
  size: keyof ApiImageUrls = 'intxt'
): string | null {
  if (!image || !image.filename) {
    return null;
  }

  // Використовуємо нову функцію getImageUrl для правильного визначення URL
  return getImageUrl(image.filename, size);
}

// Універсальні функції для роботи з зображеннями будь-яких новин
export function getUniversalNewsImage(newsItem: any, size: keyof ApiImageUrls = 'intxt'): string | null {


  // Спочатку перевіряємо, чи є нова структура зображень (масив об'єктів з urls)
  if (Array.isArray(newsItem.images) && newsItem.images.length > 0 || Array.isArray(newsItem.images_data) && newsItem.images_data.length > 0) {
    const firstImage = newsItem.images_data?.[0] || newsItem.images?.[0];

    if (firstImage && firstImage.urls && firstImage.urls[size]) {
      // Якщо URL відносний, перевіряємо чи потрібно додати підпапки
      const url = firstImage.urls[size];
      if (url && !url.startsWith('http')) {
        // Якщо URL не містить підпапки (наприклад, /media/gallery/tmb/volgnpz.jpg),
        // то потрібно додати підпапки на основі імені файлу
        const filename = url.split('/').pop();
        if (filename && !url.includes('/' + filename.charAt(0) + '/')) {
          // Генеруємо правильний шлях з підпапками
          const basePath = url.substring(0, url.lastIndexOf('/'));
          const correctPath = `${basePath}/${generateImagePath(filename)}`;
          return ensureFullImageUrl(correctPath);
        }
      }
      return ensureFullImageUrl(url);
    }
    // Якщо немає потрібного розміру, спробуємо інші розміри
    if (firstImage && firstImage.urls) {
      const fallbackUrl = firstImage.urls.full || firstImage.urls.intxt || firstImage.urls.tmb;
      if (fallbackUrl) {
        // Застосовуємо ту ж логіку для fallback URL
        if (!fallbackUrl.startsWith('http')) {
          const filename = fallbackUrl.split('/').pop();
          if (filename && !fallbackUrl.includes('/' + filename.charAt(0) + '/')) {
            const basePath = fallbackUrl.substring(0, fallbackUrl.lastIndexOf('/'));
            const correctPath = `${basePath}/${generateImagePath(filename)}`;
            return ensureFullImageUrl(correctPath);
          }
        }
        return ensureFullImageUrl(fallbackUrl);
      }
    }
  }

  // Check if there's a photo field first
  if (newsItem.photo && newsItem.photo.toString().trim() !== '') {
    const photoStr = newsItem.photo.toString();
    // If photo is a full URL, return it as is
    if (photoStr.startsWith('http://') || photoStr.startsWith('https://')) {
      return photoStr;
    }
    // If photo is a relative path, ensure it has full URL
    if (photoStr.startsWith('/')) {
      return ensureFullImageUrl(photoStr);
    }
    // Otherwise, assume it's a filename and construct the path with subdirectories
    const imagePath = generateImagePath(photoStr);
    return ensureFullImageUrl(ensureFullImageUrl(config.images.getNewsImagePath(imagePath)));
  }

  // Check if we have image_filenames from the database join
  if (newsItem.image_filenames && Array.isArray(newsItem.image_filenames) && newsItem.image_filenames.length > 0) {
    const imagePath = generateImagePath(newsItem.image_filenames[0].filename);
    return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
  }

  // Check if there are images in the images field (стара структура - рядок)
  if (typeof newsItem.images === 'string' && newsItem.images.trim() !== '') {
    try {
      // First try to parse as JSON
      const imageData = JSON.parse(newsItem.images);
      if (Array.isArray(imageData) && imageData.length > 0) {
        // Перевіряємо, чи це нова структура з urls
        if (imageData[0].urls && ensureFullImageUrl(imageData[0].urls[size])) {
          return ensureFullImageUrl(imageData[0].urls[size]);
        }
        // Якщо це стара структура з filename
        if (imageData[0].filename) {
          const imagePath = generateImagePath(imageData[0].filename);
          return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
        }
      }
    } catch (e) {
      // If parsing fails, try different formats

      // Check if it's a comma-separated list of filenames
      if (newsItem.images.includes(',')) {
        const filenames = newsItem.images.split(',').map((f: string) => f.trim());
        if (filenames.length > 0) {
          const imagePath = generateImagePath(filenames[0]);
          return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
        }
      }

      // Check if it's a single filename
      if (newsItem.images.includes('filename')) {
        // Extract filename from the images string
        const match = newsItem.images.match(/"filename":"([^"]+)"/);
        if (match) {
          const imagePath = generateImagePath(match[1]);
          return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
        }
      }

      // If it looks like a filename (no spaces, has extension)
      if (!newsItem.images.includes(' ') && (newsItem.images.includes('.jpg') || newsItem.images.includes('.jpeg') || newsItem.images.includes('.png') || newsItem.images.includes('.gif'))) {
        const imagePath = generateImagePath(newsItem.images);
        return ensureFullImageUrl(config.images.getNewsImagePath(imagePath));
      }
    }
  }

  // Return null if no image is available
  return null;
}

// Універсальні функції для різних розмірів
export function getUniversalNewsImageFull(newsItem: any): string | null {
  return getUniversalNewsImage(newsItem, 'full');
}

export function getUniversalNewsImageIntxt(newsItem: any): string | null {
  return getUniversalNewsImage(newsItem, 'intxt');
}

export function getUniversalNewsImageThumbnail(newsItem: any): string | null {
  return getUniversalNewsImage(newsItem, 'tmb');
}
