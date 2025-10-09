import crypto from 'crypto';

/**
 * Генерує preview токен на основі ID новини та секретного ключа
 * Це дозволяє створити детермінований токен, який можна перевірити
 */
export function generatePreviewToken(newsId: number): string {
  const secret = process.env.PREVIEW_TOKEN_SECRET || 'default-secret-key-change-in-production';
  const hash = crypto.createHmac('sha256', secret)
    .update(`news-${newsId}`)
    .digest('hex');
  return hash.substring(0, 32); // Перші 32 символи хешу
}

/**
 * Перевіряє валідність preview токена
 */
export function validatePreviewToken(newsId: number, token: string): boolean {
  const expectedToken = generatePreviewToken(newsId);
  return token === expectedToken;
}

/**
 * Генерує повний preview URL для новини
 */
export function generatePreviewUrl(newsId: number, baseUrl?: string): string {
  const token = generatePreviewToken(newsId);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/preview/${token}/${newsId}`;
}

