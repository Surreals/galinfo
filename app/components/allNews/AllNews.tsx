import Link from 'next/link';
import { AccentSquare, ViewAllButton } from '@/app/shared';
import { useLatestNews } from '@/app/hooks/useLatestNews';
import { formatNewsDate, generateArticleUrl } from '@/app/lib/newsUtils';
import styles from './AllNews.module.css';

// Інтерфейси для типізації даних
export interface NewsItem {
  id: string;
  title: string;
  date: string;
  time: string;
  url: string;
}

export interface AllNewsProps {
  news?: NewsItem[];
  isLoading?: boolean;
  hideHeader?: boolean;
  className?: string; // Додаємо можливість передавати додатковий CSS клас
  customTitle?: string; // Додаємо можливість змінювати заголовок
}

export default function AllNews({ news = [], isLoading = false, hideHeader = false, className = "", customTitle }: AllNewsProps) {
  // Використовуємо хук для отримання останніх новин
  const {
    data: apiData,
    loading: apiLoading,
    error: apiError
  } = useLatestNews({
    page: 1,
    limit: 20, // Така сама кількість як в мокових даних
    lang: '1',
    autoFetch: true
  });

  // Трансформуємо дані з API
  const transformedNews: NewsItem[] = apiData?.news?.map(item => ({
    id: item.id.toString(),
    title: item.nheader,
    date: formatNewsDate(item.ndate, Date.now() / 1000),
    time: item.ntime,
    url: generateArticleUrl(item as any)
  })) || [];

  // Мокові дані для fallback (будуть замінені на реальні дані)
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'Дзеркала біля моря: як одеська фотографиня перетворює пляжі на арт-простір',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/1'
    },
    {
      id: '2',
      title: 'Зеленський підписав закон про множинне громадянство та ратифікацію угоди про Спецтрибунал',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/2'
    },
    {
      id: '3',
      title: 'У Львові оштрафували ресторан за рекламу сигарет',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/3'
    },
    {
      id: '4',
      title: 'Вибори через Дію, або Місія (не)можлива?',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/4'
    },
    {
      id: '5',
      title: 'Новини про економіку та розвиток регіонів',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/5'
    },
    {
      id: '6',
      title: 'Культурні події та фестивалі у Львові',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/6'
    },
    {
      id: '7',
      title: 'Спортивні досягнення українських атлетів',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/7'
    },
    {
      id: '8',
      title: 'Технологічні інновації та стартапи',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/8'
    },
    {
      id: '9',
      title: 'Медичні новини та здоров\'я нації',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/9'
    },
    {
      id: '10',
      title: 'Освітні ініціативи та реформи',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/10'
    },
    {
      id: '11',
      title: 'Екологічні проекти та захист довкілля',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/11'
    },
    {
      id: '12',
      title: 'Міжнародні відносини та дипломатія',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/12'
    },
    {
      id: '13',
      title: 'Новини про транспорт та інфраструктуру',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/13'
    },
    {
      id: '14',
      title: 'Події у сфері науки та досліджень',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/14'
    },
    {
      id: '15',
      title: 'Новини про туризм та відпочинок',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/15'
    },
    {
      id: '16',
      title: 'Події у сфері мистецтва та архітектури',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/16'
    },
    {
      id: '17',
      title: 'Новини про сільське господарство',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/17'
    },
    {
      id: '18',
      title: 'Події у сфері фінансів та банків',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/18'
    },
    {
      id: '19',
      title: 'Новини про енергетику та комунальні послуги',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/19'
    },
    {
      id: '20',
      title: 'Події у сфері безпеки та оборони',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/20'
    }
  ];

  // Використовуємо реальні дані або мокові
  const displayNews = news.length > 0 ? news : (transformedNews.length > 0 ? transformedNews : mockNews);
  const displayLoading = isLoading || apiLoading;

  return (
    <section className={`${styles.allNewsSection} ${className}`}>
      <div className={styles.container}>
        {/* Заголовок секції */}
        {!hideHeader && (
          <div className={styles.header}>
            <AccentSquare className={styles.titleAccent} />
            <h2 className={styles.title}>{customTitle || 'ВСІ НОВИНИ'}</h2>
          </div>
        )}

        {/* Сітка новин */}
        <div className={styles.newsGrid}>
          {displayLoading ? (
            // Скелетон для завантаження
            Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className={styles.newsItem}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonDate}></div>
              </div>
            ))
          ) : (
            // Відображення новин
            displayNews.map((item) => (
              <article key={item.id} className={styles.newsItem}>
                <Link href={item.url} className={styles.newsLink}>
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
        {!hideHeader && (
          <ViewAllButton href="/all-news" />
        )}
      </div>
    </section>
  );
} 