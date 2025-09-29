// Функція для генерації шляхів з підпапками для відео (аналогічно до imageUtils)
export function generateVideoPath(filename: string): string {
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

// Типи для відео
export interface NewsVideo {
  id: number;
  filename: string;
  title: string;
  description?: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  videoType: number;
  url: string;
  thumbnailUrl?: string;
}

// Тип для відео з API (як ви отримуєте з бази даних)
export interface ApiNewsVideo {
  id: number;
  filename: string;
  title_ua: string;
  title_deflang: string;
  description_ua?: string;
  description_deflang?: string;
  duration: number;
  file_size: number;
  mime_type: string;
  video_type: number;
  url: string;
  thumbnail_url?: string;
}

// Базові URL для відео
const OLD_VIDEO_BASE_URL = 'https://galinfo.com.ua';
const NEW_VIDEO_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';

// Функція для визначення, чи є відео старим (з старого сайту)
function isOldVideo(filename: string): boolean {
  // Старі відео мають прості імена без timestamp
  // Нові відео мають формат: timestamp_randomstring.extension (13+ digits)
  const timestampPattern = /^\d{13,}_[a-zA-Z0-9]+\./;
  return !timestampPattern.test(filename);
}

// Генерація URL для відео
export function getVideoUrl(filename: string): string {
  if (!filename) return '';
  
  const isOld = isOldVideo(filename);
  const baseUrl = isOld ? OLD_VIDEO_BASE_URL : NEW_VIDEO_BASE_URL;
  const basePath = '/media/videos';
  
  if (isOld) {
    // Для старих відео використовуємо стару структуру папок
    const videoPath = generateVideoPath(filename);
    return `${baseUrl}${basePath}/${videoPath}`;
  } else {
    // Для нових відео використовуємо локальну структуру
    const videoPath = generateVideoPath(filename);
    return `${basePath}/${videoPath}`;
  }
}

// Генерація URL для мініатюр відео
export function getVideoThumbnailUrl(filename: string): string {
  if (!filename) return '';
  
  const isOld = isOldVideo(filename);
  const baseUrl = isOld ? OLD_VIDEO_BASE_URL : NEW_VIDEO_BASE_URL;
  const basePath = '/media/videos/thumbnails';
  
  if (isOld) {
    const videoPath = generateVideoPath(filename);
    return `${baseUrl}${basePath}/${videoPath}`;
  } else {
    const videoPath = generateVideoPath(filename);
    return `${basePath}/${videoPath}`;
  }
}

// Отримання alt тексту для відео по мові
export function getVideoAlt(video: any, lang: string = '1'): string {
  if (!video) return '';
  
  const langMap: { [key: string]: string } = {
    '1': 'ua',
    '2': 'en',
    '3': 'ru'
  };
  
  const langKey = langMap[lang] || 'ua';
  const titleKey = `title_${langKey}`;
  
  return video[titleKey] || video.title_ua || video.filename || '';
}

// Отримання опису відео по мові
export function getVideoDescription(video: any, lang: string = '1'): string {
  if (!video) return '';
  
  const langMap: { [key: string]: string } = {
    '1': 'ua',
    '2': 'en',
    '3': 'ru'
  };
  
  const langKey = langMap[lang] || 'ua';
  const descKey = `description_${langKey}`;
  
  return video[descKey] || video.description_ua || '';
}

// Обробка поля videos з бази даних
export function parseNewsVideos(videosString: string | null): number[] {
  if (!videosString) return [];
  
  return videosString
    .split(',')
    .map(id => id.trim())
    .filter(id => id && !isNaN(parseInt(id)))
    .map(id => parseInt(id));
}

// Формування об'єктів відео для новин
export function formatNewsVideos(
  videosData: any[], 
  videoIds: number[], 
  lang: string = '1'
): NewsVideo[] {
  if (!videosData || !videoIds) return [];
  
  return videoIds
    .map(id => {
      const video = videosData.find(vid => vid.id == id);
      if (!video) return null;
      
      return {
        id: video.id,
        filename: video.filename,
        title: getVideoAlt(video, lang),
        description: getVideoDescription(video, lang),
        duration: video.duration || 0,
        fileSize: video.file_size || 0,
        mimeType: video.mime_type || 'video/mp4',
        videoType: video.video_type || 1,
        url: getVideoUrl(video.filename),
        thumbnailUrl: getVideoThumbnailUrl(video.filename)
      };
    })
    .filter(Boolean) as NewsVideo[];
}

// Отримання основного відео для новини
export function getMainVideo(videos: NewsVideo[]): NewsVideo | null {
  if (!videos || videos.length === 0) return null;
  return videos[0];
}

// Перевірка чи є у новини відео
export function hasVideos(videos: NewsVideo[]): boolean {
  return videos && videos.length > 0;
}

// Отримання кількості відео
export function getVideosCount(videos: NewsVideo[]): number {
  return videos ? videos.length : 0;
}

// Форматування тривалості відео
export function formatVideoDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

// Форматування розміру файлу
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Перевірка підтримуваних форматів відео
export function isSupportedVideoFormat(mimeType: string): boolean {
  const supportedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv'
  ];
  
  return supportedTypes.includes(mimeType.toLowerCase());
}

// Отримання розширення файлу з MIME типу
export function getVideoExtension(mimeType: string): string {
  const mimeToExt: { [key: string]: string } = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'video/avi': 'avi',
    'video/mov': 'mov',
    'video/wmv': 'wmv'
  };
  
  return mimeToExt[mimeType.toLowerCase()] || 'mp4';
}

// Конвертація API відео в NewsVideo
export function convertApiVideoToNewsVideo(apiVideo: ApiNewsVideo, lang: string = '1'): NewsVideo {
  return {
    id: apiVideo.id,
    filename: apiVideo.filename,
    title: getVideoAlt(apiVideo, lang),
    description: getVideoDescription(apiVideo, lang),
    duration: apiVideo.duration || 0,
    fileSize: apiVideo.file_size || 0,
    mimeType: apiVideo.mime_type || 'video/mp4',
    videoType: apiVideo.video_type || 1,
    url: apiVideo.url || getVideoUrl(apiVideo.filename),
    thumbnailUrl: apiVideo.thumbnail_url || getVideoThumbnailUrl(apiVideo.filename)
  };
}
