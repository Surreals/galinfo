import Link from 'next/link';
import Image from 'next/image';
import { AccentSquare, ViewAllButton } from '@/app/shared';
import styles from './CategoryNews.module.css';

// Інтерфейси для типізації даних
export interface CategoryNewsItem {
  id: string;
  title: string;
  date: string;
  time: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
  isImportant?: boolean;
}

export interface CategoryNewsProps {
  category: string;
  news?: CategoryNewsItem[];
  isLoading?: boolean;
}

export default function CategoryNews({ 
  category = "КУЛЬТУРА", 
  news = [], 
  isLoading = false 
}: CategoryNewsProps) {
  // Мокові дані для прикладу (будуть замінені на реальні дані)
  const mockNews: CategoryNewsItem[] = [
    {
      id: '1',
      title: 'Війна на сході: як ІТ-інновації змінюють стратегію оборони',
      date: '04 липня 2025',
      time: '11:15',
      url: '/news/1',
      imageUrl: 'https://picsum.photos/300/200?random=1',
      imageAlt: 'Люди за столами на IT конференції'
    },
    {
      id: '2',
      title: 'Коли дрони стали частиною війни: нові технології в бою',
      date: '03 липня 2025',
      time: '09:30',
      url: '/news/2',
      imageUrl: 'https://picsum.photos/300/200?random=2',
      imageAlt: 'Військовий у формі посміхається'
    },
    {
      id: '3',
      title: 'Як "Голуб" із "Нової пошти" став "Голубом війни"',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/3',
      imageUrl: 'https://picsum.photos/300/200?random=3',
      imageAlt: 'Сцена з актором на театральній виставі',
      isImportant: true
    },
    {
      id: '4',
      title: 'Війна на сході: як ІТ-інновації змінюють стратегію оборони',
      date: '04 липня 2025',
      time: '11:15',
      url: '/news/4',
      imageUrl: 'https://picsum.photos/300/200?random=4',
      imageAlt: 'Люди за столами на IT конференції'
    },
    {
      id: '5',
      title: 'Смертельна аварія в Бутинах і масове ДТП на трасі Львів-Винники',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/5',
      imageUrl: 'https://picsum.photos/300/200?random=5',
      imageAlt: 'Дві машини в лобовому зіткненні на дорозі',
      isImportant: true
    },
    {
      id: '6',
      title: 'Міноборони кодифікувало та допустило до експлуатації бойовий модуль "Хижак"',
      date: '03 липня 2025',
      time: '09:30',
      url: '/news/6',
      imageUrl: 'https://picsum.photos/300/200?random=6',
      imageAlt: 'Металевий промисловий пристрій на цегляній стіні',
      isImportant: true
    },
    {
      id: '7',
      title: 'Смертельна аварія в Бутинах і масове ДТП на трасі Львів-Винники',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/7',
      imageUrl: 'https://picsum.photos/300/200?random=7',
      imageAlt: 'Дві машини в лобовому зіткненні на дорозі'
    },
    {
      id: '8',
      title: 'Міноборони кодифікувало та допустило до експлуатації бойовий модуль "Хижак"',
      date: '03 липня 2025',
      time: '09:30',
      url: '/news/8',
      imageUrl: 'https://picsum.photos/300/200?random=8',
      imageAlt: 'Металевий промисловий пристрій на цегляній стіні'
    }
  ];

  // Використовуємо реальні дані або мокові
  const displayNews = news.length > 0 ? news : mockNews;

  return (
    <section className={styles.categoryNewsSection}>
      <div className={styles.container}>
        {/* Заголовок секції */}
        <div className={styles.header}>
          <AccentSquare className={styles.titleAccent} />
          <h2 className={styles.title}>{category}</h2>
        </div>

        {/* Сітка новин */}
        <div className={styles.newsGrid}>
          {isLoading ? (
            // Скелетон для завантаження
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={styles.newsItem}>
                <div className={styles.skeletonImage}></div>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonDate}></div>
              </div>
            ))
          ) : (
            // Відображення новин
            displayNews.map((item) => (
              <article key={item.id} className={styles.newsItem}>
                <Link href={item.url} className={styles.newsLink}>
                  <div className={styles.imageContainer}>
                    <Image 
                      src={item.imageUrl} 
                      alt={item.imageAlt}
                      width={300}
                      height={200}
                      className={styles.newsImage}
                    />
                    {item.isImportant && (
                      <div className={styles.importantTag}>
                        ВАЖЛИВО
                      </div>
                    )}
                  </div>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                  <time className={styles.newsDate}>
                    {item.date}, {item.time}
                  </time>
                </Link>
              </article>
            ))
          )}
        </div>

        {/* Кнопка "Всі новини з рубрики" */}
        <ViewAllButton href={`/category/${category.toLowerCase()}`} />
        
        {/* Розділювальна лінія */}
        <div className={styles.separator}></div>
      </div>
    </section>
  );
}