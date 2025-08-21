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

export interface ImageSize {
  full: string;
  intxt: string;
  tmb: string;
}

// Генерація URL для різних розмірів зображень
export function getImageUrl(filename: string, size: keyof ImageSize = 'intxt'): string {
  if (!filename) return '';
  
  const basePath = '/media/gallery';
  const sizes: ImageSize = {
    full: `${basePath}/full/${filename}`,
    intxt: `${basePath}/intxt/${filename}`,
    tmb: `${basePath}/tmb/${filename}`
  };
  
  return sizes[size] || sizes.intxt;
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
