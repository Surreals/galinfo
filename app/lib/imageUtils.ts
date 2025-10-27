// Функція для генерації шляхів з підпапками (винесена з newsUtils для уникнення циклічних імпортів)
export function generateImagePath(filename: string): string {
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

// Типи для зображень
export interface NewsImage {
  id: number;
  filename: string;
  title: string;
  urls: {
    full: string;
    intxt: string;
    tmb: string;
  };
}

// Тип для зображення з API (як ви отримуєте з бази даних)
export interface ApiNewsImage {
  urls: {
    full: string;
    intxt: string;
    tmb: string;
  };
}

export interface ImageSize {
  full: string;
  intxt: string;
  tmb: string;
}

// Базові URL для зображень - використовуємо тільки серверний IP
const OLD_IMAGE_BASE_URL = 'http://89.116.31.189';
const NEW_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://89.116.31.189';

// Функція для визначення, чи є зображення старим (з старого сайту)
function isOldImage(filename: string): boolean {
  // Старі зображення мають прості імена без timestamp
  // Нові зображення мають формат: timestamp_randomstring.extension (13+ digits)
  // Старі зображення можуть мати формат: number_shortstring.extension (менше 13 цифр)
  const timestampPattern = /^\d{13,}_[a-zA-Z0-9]+\./;
  return !timestampPattern.test(filename);
}

// Генерація URL для різних розмірів зображень
export function getImageUrl(filename: string, size: keyof ImageSize = 'intxt'): string {
  if (!filename) return '';
  
  const isOld = isOldImage(filename);
  const baseUrl = isOld ? OLD_IMAGE_BASE_URL : NEW_IMAGE_BASE_URL;
  const basePath = '/media/gallery';
  
  // Генеруємо URL для різних розмірів з fallback логікою
  const imagePath = generateImagePath(filename);
  
  const sizes: ImageSize = {
    full: `${baseUrl}${basePath}/full/${imagePath}`,     // Завжди оригінальний файл
    intxt: `${baseUrl}${basePath}/intxt/${imagePath}`,   // Спочатку шукаємо в intxt, fallback через API
    tmb: `${baseUrl}${basePath}/tmb/${imagePath}`        // Спочатку шукаємо в tmb, fallback через API
  };
  return sizes[size] || sizes.full;
}

// Отримання alt тексту для зображення по мові
export function getImageAlt(image: any, lang: string = '1'): string {
  if (!image) return '';
  
  const langMap: { [key: string]: string } = {
    '1': 'ua',
    '2': 'en',
    '3': 'ru'
  };
  
  const langKey = langMap[lang] || 'ua';
  const titleKey = `title_${langKey}`;
  
  return image[titleKey] || image.title_ua || image.filename || '';
}

// Обробка поля images з бази даних
export function parseNewsImages(imagesString: string | null): number[] {
  if (!imagesString) return [];
  
  return imagesString
    .split(',')
    .map(id => id.trim())
    .filter(id => id && !isNaN(parseInt(id)))
    .map(id => parseInt(id));
}

// Формування об'єктів зображень для новин
export function formatNewsImages(
  imagesData: any[], 
  imageIds: number[], 
  lang: string = '1'
): NewsImage[] {
  if (!imagesData || !imageIds) return [];
  
  return imageIds
    .map(id => {
      const image = imagesData.find(img => img.id == id);
      if (!image) return null;
      
      return {
        id: image.id,
        filename: image.filename,
        title: getImageAlt(image, lang),
        urls: {
          full: getImageUrl(image.filename, 'full'),
          intxt: getImageUrl(image.filename, 'intxt'),
          tmb: getImageUrl(image.filename, 'tmb')
        }
      };
    })
    .filter(Boolean) as NewsImage[];
}

// Отримання основного зображення для новини
export function getMainImage(images: NewsImage[]): NewsImage | null {
  if (!images || images.length === 0) return null;
  return images[0];
}

// Перевірка чи є у новини зображення
export function hasImages(images: NewsImage[]): boolean {
  return images && images.length > 0;
}

// Отримання кількості зображень
export function getImagesCount(images: NewsImage[]): number {
  return images ? images.length : 0;
}

// Фільтрація зображень за розміром
export function filterImagesBySize(images: NewsImage[], minWidth?: number, minHeight?: number): NewsImage[] {
  // В реальному проекті тут можна додати логіку фільтрації за розмірами
  // Поки що повертаємо всі зображення
  return images || [];
}

// Отримання URL зображення з API структури
export function getImageUrlFromApi(apiImage: ApiNewsImage | null, size: keyof ImageSize = 'intxt'): string {
  if (!apiImage || !apiImage.urls) return '';
  
  const url = apiImage.urls[size] || apiImage.urls.intxt || '';
  
  // Якщо URL відносний, перевіряємо чи потрібно додати підпапки
  if (url && !url.startsWith('http')) {
    // Якщо URL не містить підпапки (наприклад, /media/gallery/tmb/volgnpz.jpg),
    // то потрібно додати підпапки на основі імені файлу
    const filename = url.split('/').pop();
    if (filename && !url.includes('/' + filename.charAt(0) + '/')) {
      // Генеруємо правильний шлях з підпапками
      const basePath = url.substring(0, url.lastIndexOf('/'));
      const correctPath = `${basePath}/${generateImagePath(filename)}`;
      const isOld = isOldImage(filename);
      const baseUrl = isOld ? OLD_IMAGE_BASE_URL : NEW_IMAGE_BASE_URL;
      return `${baseUrl}${correctPath}`;
    }
    const isOld = filename ? isOldImage(filename) : true; // Default to old if no filename
    const baseUrl = isOld ? OLD_IMAGE_BASE_URL : NEW_IMAGE_BASE_URL;
    return `${baseUrl}${url}`;
  }
  
  return url;
}

// Отримання основного зображення з API даних
export function getMainImageFromApi(apiImages: ApiNewsImage[] | null): ApiNewsImage | null {
  if (!apiImages || apiImages.length === 0) return null;
  return apiImages[0];
}

// Перевірка чи є зображення в API даних
export function hasApiImages(apiImages: ApiNewsImage[] | null): boolean {
  return !!(apiImages && apiImages.length > 0);
}

// Отримання кількості зображень з API
export function getApiImagesCount(apiImages: ApiNewsImage[] | null): number {
  return apiImages ? apiImages.length : 0;
}

// Конвертація API зображення в NewsImage (якщо потрібно)
export function convertApiImageToNewsImage(apiImage: ApiNewsImage, id: number = 0, filename: string = '', title: string = ''): NewsImage {
  return {
    id,
    filename,
    title,
    urls: apiImage.urls
  };
}

// Функції для роботи з базовим URL
export function getImageBaseUrl(): string {
  return OLD_IMAGE_BASE_URL;
}

// Функція для отримання базового URL з можливістю перевизначення
export function getImageBaseUrlWithFallback(customUrl?: string): string {
  return customUrl || OLD_IMAGE_BASE_URL;
}

// Функція для отримання базового URL для старих зображень
export function getOldImageBaseUrl(): string {
  return OLD_IMAGE_BASE_URL;
}

// Функція для отримання базового URL для нових зображень
export function getNewImageBaseUrl(): string {
  return NEW_IMAGE_BASE_URL;
}

// Функція для перевірки, чи потрібно додавати базовий URL
export function ensureFullImageUrl(url: string, customBaseUrl?: string): string {
  if (!url) return '';
  
  // Якщо URL вже повний, повертаємо як є
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Якщо URL відносний, визначаємо правильний базовий URL на основі типу зображення
  let baseUrl = customBaseUrl;
  
  if (!baseUrl) {
    // Визначаємо тип зображення на основі URL
    const filename = url.split('/').pop() || '';
    if (isOldImage(filename)) {
      baseUrl = OLD_IMAGE_BASE_URL;
    } else {
      baseUrl = NEW_IMAGE_BASE_URL;
    }
  }
  
  return `${baseUrl}${url}`;
}
