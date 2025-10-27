import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

// Налаштування розмірів зображень
export const IMAGE_SIZES = {
  // Повний розмір (оригінал)
  full: {
    width: null, // Зберігаємо оригінальний розмір
    height: null,
    quality: 90
  },
  // Середній розмір для статей (intxt = in-text)
  intxt: {
    width: 600,
    height: 400,
    quality: 85
  },
  // Мініатюра (tmb = thumbnail)
  tmb: {
    width: 150,
    height: 150,
    quality: 80
  }
} as const;

export type ImageSizeType = keyof typeof IMAGE_SIZES;

export interface ImageProcessingResult {
  filename: string;
  sizes: {
    full: string;
    intxt: string;
    tmb: string;
  };
  metadata: {
    originalWidth: number;
    originalHeight: number;
    format: string;
    size: number;
  };
}

/**
 * Створює шлях з підпапками на основі імені файлу
 */
function createDirectoryPath(filename: string): { firstChar: string; secondChar: string } {
  const firstChar = filename.charAt(0).toLowerCase();
  const secondChar = filename.charAt(1).toLowerCase();
  
  return {
    firstChar: /[a-z0-9]/.test(firstChar) ? firstChar : 'other',
    secondChar: /[a-z0-9]/.test(secondChar) ? secondChar : 'other'
  };
}

/**
 * Обробляє зображення та створює всі необхідні розміри
 */
export async function processImage(
  buffer: Buffer,
  filename: string,
  basePath: string
): Promise<ImageProcessingResult> {
  try {
    // Отримуємо метадані оригінального зображення
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Не вдалося отримати розміри зображення');
    }

    // Створюємо структуру папок
    const { firstChar, secondChar } = createDirectoryPath(filename);
    
    const paths = {
      full: join(basePath, 'gallery', 'full', firstChar, secondChar),
      intxt: join(basePath, 'gallery', 'intxt', firstChar, secondChar),
      tmb: join(basePath, 'gallery', 'tmb', firstChar, secondChar)
    };

    // Створюємо всі необхідні папки
    await Promise.all([
      mkdir(paths.full, { recursive: true }),
      mkdir(paths.intxt, { recursive: true }),
      mkdir(paths.tmb, { recursive: true })
    ]);

    const results: ImageProcessingResult = {
      filename,
      sizes: {
        full: join(paths.full, filename),
        intxt: join(paths.intxt, filename),
        tmb: join(paths.tmb, filename)
      },
      metadata: {
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        format: metadata.format || 'unknown',
        size: buffer.length
      }
    };

    // Створюємо різні розміри зображень
    await Promise.all([
      // Повний розмір (оригінал з оптимізацією)
      sharp(buffer)
        .jpeg({ quality: IMAGE_SIZES.full.quality })
        .png({ quality: IMAGE_SIZES.full.quality })
        .webp({ quality: IMAGE_SIZES.full.quality })
        .toFile(results.sizes.full),

      // Середній розмір (intxt)
      sharp(buffer)
        .resize(IMAGE_SIZES.intxt.width, IMAGE_SIZES.intxt.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: IMAGE_SIZES.intxt.quality })
        .png({ quality: IMAGE_SIZES.intxt.quality })
        .webp({ quality: IMAGE_SIZES.intxt.quality })
        .toFile(results.sizes.intxt),

      // Мініатюра (tmb)
      sharp(buffer)
        .resize(IMAGE_SIZES.tmb.width, IMAGE_SIZES.tmb.height, {
          fit: 'cover', // Для мініатюр використовуємо обрізання для отримання квадратного зображення
          position: 'center'
        })
        .jpeg({ quality: IMAGE_SIZES.tmb.quality })
        .png({ quality: IMAGE_SIZES.tmb.quality }) 
        .webp({ quality: IMAGE_SIZES.tmb.quality })
        .toFile(results.sizes.tmb)
    ]);

    console.log('✅ Успішно створено зображення:', {
      filename,
      originalSize: `${metadata.width}x${metadata.height}`,
      createdSizes: Object.keys(IMAGE_SIZES)
    });

    return results;

  } catch (error) {
    console.error('❌ Помилка обробки зображення:', error);
    throw new Error(`Не вдалося обробити зображення: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
  }
}

/**
 * Валідація зображення перед обробкою
 */
export async function validateImage(buffer: Buffer): Promise<{
  isValid: boolean;
  error?: string;
  metadata?: sharp.Metadata;
}> {
  try {
    const metadata = await sharp(buffer).metadata();
    
    // Перевіряємо чи це дійсно зображення
    if (!metadata.width || !metadata.height) {
      return {
        isValid: false,
        error: 'Файл не є валідним зображенням'
      };
    }

    // Перевіряємо формат
    const supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
    if (!metadata.format || !supportedFormats.includes(metadata.format)) {
      return {
        isValid: false,
        error: `Непідтримуваний формат зображення. Підтримуються: ${supportedFormats.join(', ')}`
      };
    }

    // Перевіряємо розміри (мінімальні вимоги)
    const minWidth = 100;
    const minHeight = 100;
    if (metadata.width < minWidth || metadata.height < minHeight) {
      return {
        isValid: false,
        error: `Зображення занадто мале. Мінімальний розмір: ${minWidth}x${minHeight}px`
      };
    }

    // Перевіряємо максимальні розміри (для запобігання занадто великих файлів)
    const maxWidth = 4000;
    const maxHeight = 4000;
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      return {
        isValid: false,
        error: `Зображення занадто велике. Максимальний розмір: ${maxWidth}x${maxHeight}px`
      };
    }

    return {
      isValid: true,
      metadata
    };

  } catch (error) {
    return {
      isValid: false,
      error: 'Не вдалося прочитати файл зображення'
    };
  }
}

/**
 * Отримання інформації про розміри зображення без обробки
 */
export async function getImageInfo(buffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
}> {
  const metadata = await sharp(buffer).metadata();
  
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: buffer.length
  };
}
