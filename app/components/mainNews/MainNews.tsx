import Link from 'next/link';
import Image from 'next/image';
import styles from './MainNews.module.css';

export interface MainNewsProps {
  title: string;
  date: string;
  time?: string; // Опціональне поле, оскільки час тепер включений в date
  url: string;
  imageUrl: string;
  imageAlt: string;
  className?: string;
}

export default function MainNews({ 
  title,
  date,
  time,
  url,
  imageUrl,
  imageAlt,
  className = ""
}: MainNewsProps) {
  return (
    <section className={`${styles.mainNewsSection} ${className}`}>
      <div className={styles.container}>
        <article className={styles.newsItem}>
          <Link href={url} className={styles.newsLink}>
            <div className={styles.imageContainer}>
              <Image 
                src={imageUrl} 
                alt={imageAlt}
                width={800}
                height={500}
                className={styles.newsImage}
              />
            </div>
            <div className={styles.contentContainer}>
              <h1 className={styles.newsTitle}>{title}</h1>
              <time className={styles.newsDate}>
                {date}, {time}
              </time>
            </div>
          </Link>
        </article>
      </div>
    </section>
  );
}
