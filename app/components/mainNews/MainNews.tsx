import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from 'antd';
import styles from './MainNews.module.css';

export interface MainNewsProps {
  title?: string;
  date?: string;
  time?: string; // Опціональне поле, оскільки час тепер включений в date
  url?: string;
  imageUrl?: string;
  imageAlt?: string;
  className?: string;
  isLoading?: boolean;
}

export default function MainNews({ 
  title,
  date,
  time,
  url,
  imageUrl,
  imageAlt,
  className = "",
  isLoading = false
}: MainNewsProps) {
  return (
    <section className={`${styles.mainNewsSection} ${className}`}>
      <div className={styles.container}>
        <article className={styles.newsItem}>
          {isLoading ? (
            // Скелетон лоадинг
            <Skeleton 
              active 
              avatar={{ shape: 'square', size: 'large' }}
              paragraph={{ rows: 2 }}
              title={{ width: '80%' }}
            />
          ) : (
            // Звичайний контент
            url ? (
              <Link href={url} className={styles.newsLink}>
                {imageUrl && (
                  <div className={styles.imageContainer}>
                    <Image 
                      src={imageUrl} 
                      alt={imageAlt || ''}
                      width={800}
                      height={500}
                      className={styles.newsImage}
                    />
                  </div>
                )}
                <div className={styles.contentContainer}>
                  <h1 className={styles.newsTitle}>{title}</h1>
                  <time className={styles.newsDate}>
                    {date}
                  </time>
                </div>
              </Link>
            ) : (
              // Відображення без посилання
              <>
                {imageUrl && (
                  <div className={styles.imageContainer}>
                    <Image 
                      src={imageUrl} 
                      alt={imageAlt || ''}
                      width={800}
                      height={500}
                      className={styles.newsImage}
                    />
                  </div>
                )}
                <div className={styles.contentContainer}>
                  <h1 className={styles.newsTitle}>{title}</h1>
                  <time className={styles.newsDate}>
                    {date}
                  </time>
                </div>
              </>
            )
          )}
        </article>
      </div>
    </section>
  );
}
