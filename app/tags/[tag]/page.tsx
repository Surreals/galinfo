import { CategoryPageClient } from "@/app/[category]/CategoryPageClient";
import { Metadata } from "next";
import styles from "@/app/[category]/page.module.css";

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Генерація метаданих для тегу
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag || '').trim();

  const title = decodedTag ? `${decodedTag} | Гал-Інфо` : 'Тег | Гал-Інфо';
  const description = decodedTag
    ? `Новини за тегом "${decodedTag}" від агенції інформації та аналітики "Гал-Інфо".`
    : 'Новини за тегами від агенції інформації та аналітики "Гал-Інфо".';
  const canonical = decodedTag
    ? `https://galinfo.com.ua/tags/${encodeURIComponent(decodedTag)}`
    : `https://galinfo.com.ua/tags`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Гал-Інфо',
      locale: 'uk_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical,
    },
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  
  // Перевіряємо, чи існує tag
  if (!tag) {
    return (
      <div className={styles.errorContainer}>
        <svg 
          className={styles.errorIcon}
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="#c7084f" strokeWidth="2"/>
          <path d="M12 8V12" stroke="#c7084f" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1" fill="#c7084f"/>
        </svg>
        <h1 className={styles.errorTitle}>Тег не знайдено</h1>
        <p className={styles.errorDescription}>
          Схоже, що цей тег не існує або був видалений. 
          Спробуйте повернутися на головну сторінку або використати пошук.
        </p>
        <a href="/" className={styles.errorButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Повернутися на головну
        </a>
      </div>
    );
  }
  
  // Використовуємо CategoryPageClient, який вже вміє обробляти теги
  return (
    <CategoryPageClient 
      category={tag}
    />
  );
}
