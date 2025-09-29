import Link from 'next/link';
import Image from 'next/image';
import { AccentSquare, ViewAllButton } from '@/app/shared';
import NewsList from '../listNews/listNews';
import styles from './ColumnNews.module.css';
import arrowRight from "@/assets/icons/arrowRight.svg";
import adBannerIndfomo from '@/assets/images/Ad Banner white.png';
import { useState, useEffect } from 'react';
import { Skeleton } from 'antd';
import { useNewsByRubric } from '@/app/hooks/useNewsByRubric';
import { getUniversalNewsImageIntxt, formatFullNewsDate } from '@/app/lib/newsUtils';
import { getUrlFromCategoryId } from '@/app/lib/categoryMapper';
import placeholderImage from '@/assets/images/Gal-info logo v13.png';

// Інтерфейси для типізації даних
export interface ColumnNewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  time?: string; // Опціональне поле, оскільки час тепер включений в date
  url: string;
  imageUrl: string | null;
  imageAlt: string;
  important?: boolean; // Чи є новина важливою
}

export interface ColumnNewsProps {
  category: string;
  secondCategory: string;
  categoryId?: number | string;
  secondCategoryId?: number;
  news?: ColumnNewsItem[];
  isLoading?: boolean;
  isHomePage?: boolean;
  smallImg?: boolean;
  arrowRightIcon?: boolean;
  newsQuantity?: number;
  showNewsList?: boolean;
  hideHeader?: boolean;
  className?: string; // Додаємо можливість передавати додатковий CSS клас
  isMobile?: boolean;
  mobileLayout?: 'column' | 'horizontal'; // Новий пропс для контролю мобільного відображення
  showSeparator?: boolean;
  // Нові пропси для роботи з API
  useRealData?: boolean;
  viewAllButtonHref?: string; // Новий пропс для ViewAllButton href
  config?: {
    apiParams?: {
      page?: number;
      limit?: number;
      lang?: string;
      approved?: boolean;
      type?: string;
    };
    secondCategoryApiParams?: {
      page?: number;
      limit?: number;
      lang?: string;
      approved?: boolean;
      type?: string;
    };
  };
}

export default function ColumnNews({ 
  category = "КРИМІНАЛ", 
  news = [],
  secondCategory = '',
  categoryId,
  secondCategoryId,
  isLoading = false,
  isHomePage = false,
  arrowRightIcon = false,
  smallImg = false,
  newsQuantity = 4,
  showNewsList = true,
  hideHeader = false,
  className = "",
  isMobile = false,
  mobileLayout = 'column',
  showSeparator = false,
  useRealData = false,
  viewAllButtonHref,
  config
}: ColumnNewsProps) {
  // Визначаємо, чи потрібно показувати горизонтальне відображення
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth < 1000);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Використовуємо хук для отримання реальних даних
  const {
    data: apiData,
    loading: apiLoading,
    error: apiError
  } = useNewsByRubric({
    rubric: categoryId?.toString() || '',
    page: config?.apiParams?.page || 1,
    limit: config?.apiParams?.limit || newsQuantity,
    lang: config?.apiParams?.lang || '1',
    approved: config?.apiParams?.approved !== undefined ? config.apiParams.approved : true,
    type: config?.apiParams?.type,
    autoFetch: useRealData && !!categoryId
  });

  // Горизонтальне відображення застосовується на мобільних пристроях
  const shouldShowHorizontal = isMobileDevice && mobileLayout === 'horizontal';

  // Мокові дані для прикладу (будуть замінені на реальні дані)
  const mockNews: ColumnNewsItem[] = [
    {
      id: '1',
      title: 'Львів\'янок запрошують на безплатну мамографію щосуботи у липні. Львів\'янок запрошують на безплатну мамографію щосуботи у липні',
      summary: 'Для мешканок Львівської громади у липні організовано безплатну скринінгову мамографію щосуботи, для проходження якої необхідне електронне скерування від сімейного лікаря та попередній запис. Про це повідомляє ЛМР. Для мешканок Львівської громади у липні організовано безплатну скринінгову мамографію щосуботи, для проходження якої необхідне електронне скерування від сімейного лікаря та попередній запис. Про це повідомляє ЛМР. Акція спрямована на раннє виявлення захворювань грудей та покращення якості життя жінок. Медичний персонал буде працювати в зручний для всіх час, а сама процедура займає не більше 15-20 хвилин.',
      date: '02 липня 2025',
      time: '14:54',
      url: '/article/mamography-lviv-july',
      imageUrl: '',
      imageAlt: 'Мамографічний апарат з рожевими елементами'
    },
    {
      id: '2',
      title: 'Загальноукраїнська акція з безкоштовної перевірки здоров\'я жінок стартує у серпні. Медичні заклади готуються до масштабної кампанії',
      summary: 'У серпні 2025 року стартує загальноукраїнська кампанія з безкоштовних обстежень для жінок. Акція відкрита для всіх, хто попередньо зареєструється. У серпні 2025 року стартує загальноукраїнська кампанія з безкоштовних обстежень для жінок. Акція відкрита для всіх, хто попередньо зареєструється. Медичні заклади по всій Україні готуються до масштабної кампанії з профілактики захворювань грудей. Організатори очікують рекордну кількість учасниць та забезпечують високу якість обслуговування. Кожна жінка зможе пройти комплексне обстеження, включаючи консультацію лікаря-мамолога та необхідні лабораторні дослідження.',
      date: '15 липня 2025',
      time: '10:00',
      url: '/article/ukraine-health-campaign-august',
      imageUrl: '',
      imageAlt: 'Жінка робить самообстеження грудей'
    },
    {
      id: '3',
      title: 'У Львові відбудеться благодійний концерт на підтримку онкохворих. Місцеві таланти зіграють для важливої справи',
      summary: '15 липня 2025 року у Львові відбудеться благодійний концерт на підтримку онкохворих. Заходи відбуватимуться в центрі міста з участю місцевих талантів. 15 липня 2025 року у Львові відбудеться благодійний концерт на підтримку онкохворих. Заходи відбуватимуться в центрі міста з участю місцевих талантів. Організатори планують зібрати кошти для закупівлі сучасного медичного обладнання та підтримки пацієнтів. У програмі концерту - виступи відомих львівських музикантів, театральні постановки та виступи поетів. Всі кошти, зібрані під час заходу, будуть направлені на покращення умов лікування онкохворих у регіоні.',
      date: '10 липня 2025',
      time: '18:30',
      url: '/article/charity-concert-lviv-cancer',
      imageUrl: '',
      imageAlt: 'Лікар у білому халаті дивиться в камеру'
    },
    {
      id: '4',
      title: 'Семінар для жінок про профілактику захворювань грудей. Експерти поділяться важливими знаннями',
      summary: 'На початку серпня у Львові відбудеться семінар для жінок, де можна дізнатися про профілактику захворювань грудей та важливість регулярних обстежень. Проводитимуть онкологи. На початку серпня у Львові відбудеться семінар для жінок, де можна дізнатися про профілактику захворювань грудей та важливість регулярних обстежень. Проводитимуть онкологи. У рамках семінару учасниці зможуть отримати практичні поради щодо самообстеження, дізнатися про фактори ризику та сучасні методи діагностики. Спеціалісти також розповідають про правильне харчування, фізичну активність та інші аспекти здорового способу життя, які допомагають зменшити ризик розвитку захворювань.',
      date: '05 серпня 2025',
      time: '10:00',
      url: '/article/seminar-breast-cancer-prevention',
      imageUrl: '',
      imageAlt: 'Лікар в окулярах у синьому халаті посміхається'
    },
    {
      id: '5',
      title: 'Лікарі закликають до регулярних профілактичних оглядів. Раннє виявлення - ключ до успішного лікування',
      summary: 'Експерти закликають жінок не забувати про регулярні профілактичні огляди, які допомагають виявити можливі захворювання на ранній стадії. Важливо щорічно відвідувати лікаря. Експерти закликають жінок не забувати про регулярні профілактичні огляди, які допомагають виявити можливі захворювання на ранній стадії. Важливо щорічно відвідувати лікаря. Статистика показує, що раннє виявлення захворювань грудей значно підвищує шанси на успішне лікування. Лікарі наголошують на важливості не тільки медичних обстежень, але й самообстеження, яке жінки можуть проводити самостійно в домашніх умовах. Регулярні візити до лікаря та уважне ставлення до свого здоров\'я - це запорука довголіття та якісного життя.',
      date: '20 серпня 2025',
      time: '09:45',
      url: '/article/doctors-preventive-exams',
      imageUrl: '',
      imageAlt: 'Лікар в окулярах у темному піджаку задумливо дивиться вбік'
    }
  ];

  // Використовуємо порожній масив замість генерації випадкових новин
  const newsData: any[] = [];

  // Визначаємо, які дані використовувати
  let displayNews: ColumnNewsItem[] = [];
  let displayLoading = isLoading;

  if (useRealData && apiData?.news) {
    // Використовуємо реальні дані з API
    displayNews = apiData.news.filter(item => item && item.id).map(item => ({
      
      id: item.id.toString(),
      title: item.nheader,
      summary: item.nteaser || item.nsubheader || '',
      date: formatFullNewsDate(item.ndate, item.ntime),
      url: `/news/${item.urlkey}_${item.id}`,
      imageUrl: getUniversalNewsImageIntxt(item),
      imageAlt: item.nheader,
      // Прапорець важливості для бейджа
      important: ((item as any).nweight ?? 0) > 0
    }));
    displayLoading = apiLoading;
  } else if (news.length > 0) {
    // Використовуємо передані дані
    displayNews = news;
  } else {
    // Якщо немає даних та не використовуємо реальні дані, показуємо скелетон
    displayLoading = true;
    displayNews = [];
  }

  // Не рендеримо компонент, якщо новин менше 1 (не завантажуємо)
  if (!displayLoading && displayNews.length < 1) {
    return null;
  }

  return (
    <section className={`${styles.columnNewsSection} ${className}`}>
      <div className={styles.container}>
        {/* Заголовок секції */}
        {/* {!hideHeader && (
          <div className={styles.header}>
            <AccentSquare className={styles.titleAccent} />
            <h2 className={styles.title}>{category}</h2>
          </div>
        )} */}

        {/* Основний контент з новинами */}
        <div className={styles.mainContent}>
                  {/* Список новин у колонці */}
            {!hideHeader && isMobile && (
            <div className={styles.header}>
              <AccentSquare className={styles.titleAccent}/>
              {categoryId && getUrlFromCategoryId(categoryId) ? (
                <Link href={`/${getUrlFromCategoryId(categoryId)}`} className={styles.titleLink}>
                  <h2 className={styles.title}>{category}</h2>
                </Link>
              ) : (
                <h2 className={styles.title}>{category}</h2>
              )}
            </div>
            )}
        <div className={`${styles.newsList} ${shouldShowHorizontal ? styles.newsListHorizontal : ''}`}>
        {!hideHeader && !isMobile && (
            <div className={styles.header}>
              <AccentSquare className={styles.titleAccent}/>
              {categoryId && getUrlFromCategoryId(categoryId) ? (
                <Link href={`/${getUrlFromCategoryId(categoryId)}`} className={styles.titleLink}>
                  <h2 className={styles.title}>{category}</h2>
                </Link>
              ) : (
                <h2 className={styles.title}>{category}</h2>
              )}
            </div>
            )}
            {displayLoading ? (
              // Скелетон для завантаження
              Array.from({length: 5}).map((_, index) => (
                <div key={index} className={`${styles.newsItem} ${shouldShowHorizontal ? styles.newsItemHorizontal : ''}`}>
                  <Skeleton 
                    active
                    paragraph={{ rows: 5 }}
                    title={{ width: '85%' }}
                  />
                </div>
              ))
            ) : (
              // Відображення новин
              displayNews.map((item) => (
                <article key={item.id} className={`${styles.newsItem} ${shouldShowHorizontal ? styles.newsItemHorizontal : ''}`}>
                  <Link href={item.url} className={styles.newsLink}>
                    <div className={smallImg ? styles.imageContainerSmall : styles.imageContainer}>
                      <Image
                        src={item.imageUrl || placeholderImage}
                        alt={item.imageAlt || 'GalInfo Logo'}
                        width={280}
                        height={350}
                        className={`${styles.newsImage} ${!item.imageUrl ? styles.placeholderImage : ''}`}
                      />
                      {/* Мітка "Важливо" для важливих новин */}
                      {item.important && (
                        <div className={styles.importantTag}>
                          ВАЖЛИВО
                        </div>
                      )}
                    </div>
                    <div className={smallImg ? styles.contentSmall : styles.content}>
                      <h3 className={smallImg ? styles.newsTitleSmall : styles.newsTitle}>{item.title}</h3>
                      <p className={smallImg ? styles.newsSummarySmall : styles.newsSummary}>{item.summary}</p>
                      <time className={smallImg ? styles.newsDateSmall : styles.newsDate}>
                        {item.date}
                      </time>
                    </div>
                  </Link>
                </article>
              ))
            )}
          </div>

          {/* ListNews компонент - тільки коли showNewsList=true */}
          {showNewsList && (
            <div className={styles.listNewsContainer}>
              <NewsList
                // loading={}
                showSeparator={showSeparator}
                mobileLayout={mobileLayout}
                arrowRightIcon={arrowRightIcon}
                title={secondCategory}
                categoryId={secondCategoryId}
                useRealData={useRealData}
                config={{
                  apiParams: config?.secondCategoryApiParams || config?.apiParams
                }}
                data={newsData}
                showImagesAt={[0, 1]}
                showMoreButton={true}
                moreButtonUrl="/all-news"
                widthPercent={100}
              />
                {!smallImg && !isMobile &&
                <>
                  <div className={styles.rightSeparator}></div>              
                    <Image 
                    src={adBannerIndfomo} 
                    alt="IN-FOMO Banner" 
                    width={600} 
                    height={240} 
                    className={styles.fomoLogo}
                    priority={false}
                  />
              </>
                }
            </div>
          )}
        </div>

        {/* Кнопка "Всі новини з рубрики" */}
        {!hideHeader && (
          <>
            <ViewAllButton href={viewAllButtonHref || (categoryId && getUrlFromCategoryId(categoryId) ? `/${getUrlFromCategoryId(categoryId)}` : '/all-news')} />
            
          </>
        )}
         {/* Розділювальна лінія */}
        <div className={styles.separator}></div>
      </div>
    </section>
  );
}