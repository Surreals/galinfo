import Link from 'next/link';
import Image from 'next/image';
import { AccentSquare, ViewAllButton } from '@/app/shared';
import NewsList from '../listNews/listNews';
import styles from './ColumnNews.module.css';
import arrowRight from "@/assets/icons/arrowRight.svg";

// Інтерфейси для типізації даних
export interface ColumnNewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  time: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
}

export interface ColumnNewsProps {
  category: string;
  news?: ColumnNewsItem[];
  isLoading?: boolean;
  isHomePage?: boolean;
  smallImg?: boolean;
  newsQuantity?: number;
  showNewsList?: boolean;
  hideHeader?: boolean;
  className?: string; // Додаємо можливість передавати додатковий CSS клас
}

export default function ColumnNews({ 
  category = "КРИМІНАЛ", 
  news = [], 
  isLoading = false,
  isHomePage = false,
  smallImg = false,
  newsQuantity = 4,
  showNewsList = true,
  hideHeader = false,
  className = ""
}: ColumnNewsProps) {
  // Мокові дані для прикладу (будуть замінені на реальні дані)
  const mockNews: ColumnNewsItem[] = [
    {
      id: '1',
      title: 'Львів\'янок запрошують на безплатну мамографію щосуботи у липні. Львів\'янок запрошують на безплатну мамографію щосуботи у липні',
      summary: 'Для мешканок Львівської громади у липні організовано безплатну скринінгову мамографію щосуботи, для проходження якої необхідне електронне скерування від сімейного лікаря та попередній запис. Про це повідомляє ЛМР. Для мешканок Львівської громади у липні організовано безплатну скринінгову мамографію щосуботи, для проходження якої необхідне електронне скерування від сімейного лікаря та попередній запис. Про це повідомляє ЛМР. Акція спрямована на раннє виявлення захворювань грудей та покращення якості життя жінок. Медичний персонал буде працювати в зручний для всіх час, а сама процедура займає не більше 15-20 хвилин.',
      date: '02 липня 2025',
      time: '14:54',
      url: '/news/1',
      imageUrl: 'https://picsum.photos/280/350?random=11',
      imageAlt: 'Мамографічний апарат з рожевими елементами'
    },
    {
      id: '2',
      title: 'Загальноукраїнська акція з безкоштовної перевірки здоров\'я жінок стартує у серпні. Медичні заклади готуються до масштабної кампанії',
      summary: 'У серпні 2025 року стартує загальноукраїнська кампанія з безкоштовних обстежень для жінок. Акція відкрита для всіх, хто попередньо зареєструється. У серпні 2025 року стартує загальноукраїнська кампанія з безкоштовних обстежень для жінок. Акція відкрита для всіх, хто попередньо зареєструється. Медичні заклади по всій Україні готуються до масштабної кампанії з профілактики захворювань грудей. Організатори очікують рекордну кількість учасниць та забезпечують високу якість обслуговування. Кожна жінка зможе пройти комплексне обстеження, включаючи консультацію лікаря-мамолога та необхідні лабораторні дослідження.',
      date: '15 липня 2025',
      time: '10:00',
      url: '/news/2',
      imageUrl: 'https://picsum.photos/200/150?random=12',
      imageAlt: 'Жінка робить самообстеження грудей'
    },
    {
      id: '3',
      title: 'У Львові відбудеться благодійний концерт на підтримку онкохворих. Місцеві таланти зіграють для важливої справи',
      summary: '15 липня 2025 року у Львові відбудеться благодійний концерт на підтримку онкохворих. Заходи відбуватимуться в центрі міста з участю місцевих талантів. 15 липня 2025 року у Львові відбудеться благодійний концерт на підтримку онкохворих. Заходи відбуватимуться в центрі міста з участю місцевих талантів. Організатори планують зібрати кошти для закупівлі сучасного медичного обладнання та підтримки пацієнтів. У програмі концерту - виступи відомих львівських музикантів, театральні постановки та виступи поетів. Всі кошти, зібрані під час заходу, будуть направлені на покращення умов лікування онкохворих у регіоні.',
      date: '10 липня 2025',
      time: '18:30',
      url: '/news/3',
      imageUrl: 'https://picsum.photos/200/150?random=13',
      imageAlt: 'Лікар у білому халаті дивиться в камеру'
    },
    {
      id: '4',
      title: 'Семінар для жінок про профілактику захворювань грудей. Експерти поділяться важливими знаннями',
      summary: 'На початку серпня у Львові відбудеться семінар для жінок, де можна дізнатися про профілактику захворювань грудей та важливість регулярних обстежень. Проводитимуть онкологи. На початку серпня у Львові відбудеться семінар для жінок, де можна дізнатися про профілактику захворювань грудей та важливість регулярних обстежень. Проводитимуть онкологи. У рамках семінару учасниці зможуть отримати практичні поради щодо самообстеження, дізнатися про фактори ризику та сучасні методи діагностики. Спеціалісти також розповідають про правильне харчування, фізичну активність та інші аспекти здорового способу життя, які допомагають зменшити ризик розвитку захворювань.',
      date: '05 серпня 2025',
      time: '10:00',
      url: '/news/4',
      imageUrl: 'https://picsum.photos/200/150?random=14',
      imageAlt: 'Лікар в окулярах у синьому халаті посміхається'
    },
    {
      id: '5',
      title: 'Лікарі закликають до регулярних профілактичних оглядів. Раннє виявлення - ключ до успішного лікування',
      summary: 'Експерти закликають жінок не забувати про регулярні профілактичні огляди, які допомагають виявити можливі захворювання на ранній стадії. Важливо щорічно відвідувати лікаря. Експерти закликають жінок не забувати про регулярні профілактичні огляди, які допомагають виявити можливі захворювання на ранній стадії. Важливо щорічно відвідувати лікаря. Статистика показує, що раннє виявлення захворювань грудей значно підвищує шанси на успішне лікування. Лікарі наголошують на важливості не тільки медичних обстежень, але й самообстеження, яке жінки можуть проводити самостійно в домашніх умовах. Регулярні візити до лікаря та уважне ставлення до свого здоров\'я - це запорука довголіття та якісного життя.',
      date: '20 серпня 2025',
      time: '09:45',
      url: '/news/5',
      imageUrl: 'https://picsum.photos/200/150?random=15',
      imageAlt: 'Лікар в окулярах у темному піджаку задумливо дивиться вбік'
    }
  ];

  const generateRandomNews = (count: number) => {
    const titles = [
      "Зеленський підписав новий закон",
      "В Україні прогнозують грози",
      "Трамп дав нове інтерв'ю",
      "На Львівщині відкрили парк",
      "Вчені винайшли новий велосипед",
      "Новий арт-проєкт у центрі Києва",
    ];

    return Array.from({ length: count }, () => ({
      title: titles[Math.floor(Math.random() * titles.length)],
      time: new Date(
        Date.now() - Math.floor(Math.random() * 1e8)
      ).toLocaleString("uk-UA", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      imageUrl: `https://picsum.photos/seed/${Math.random()}/300/200`,
    }));
  };

  // Мокові дані для listNews
  const newsData = generateRandomNews(newsQuantity);

  // Використовуємо реальні дані або мокові
  const displayNews = news.length > 0 ? news : mockNews;

  return (
    <section className={`${styles.columnNewsSection} ${className}`}>
      <div className={styles.container}>
        {/* Заголовок секції */}
        {!hideHeader && (
          <div className={styles.header}>
            <AccentSquare className={styles.titleAccent} />
            <h2 className={styles.title}>{category}</h2>
          </div>
        )}

        {/* Основний контент з новинами */}
        <div className={styles.mainContent}>
          {/* Список новин у колонці */}
          <div className={styles.newsList}>
            {isLoading ? (
              // Скелетон для завантаження
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className={styles.newsItem}>
                  <div className={smallImg ? styles.skeletonImageSmall : styles.skeletonImage}></div>
                  <div className={smallImg ? styles.skeletonContentSmall : styles.skeletonContent}>
                    <div className={smallImg ? styles.skeletonTitleSmall : styles.skeletonTitle}></div>
                    <div className={smallImg ? styles.skeletonSummarySmall : styles.skeletonSummary}></div>
                    <div className={styles.skeletonDate}></div>
                  </div>
                </div>
              ))
            ) : (
              // Відображення новин
              displayNews.map((item) => (
                <article key={item.id} className={styles.newsItem}>
                  <Link href={item.url} className={styles.newsLink}>
                    <div className={smallImg ? styles.imageContainerSmall : styles.imageContainer}>
                      <Image 
                        src={item.imageUrl} 
                        alt={item.imageAlt}
                        width={280}
                        height={350}
                        className={styles.newsImage}
                      />
                    </div>
                    <div className={smallImg ? styles.contentSmall : styles.content}>
                      <h3 className={smallImg ? styles.newsTitleSmall : styles.newsTitle}>{item.title}</h3>
                      <p className={smallImg ? styles.newsSummarySmall : styles.newsSummary}>{item.summary}</p>
                      <time className={smallImg ? styles.newsDateSmall : styles.newsDate}>
                        {item.date}, {item.time}
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
                title="НОВИНИ ЛЬВОВА"
                titleIcon={<Image
                  src={arrowRight}
                  alt={'Arrow right'}
                  width={10}
                  height={8}
                />}
                data={newsData}
                showImagesAt={[0, 1]}
                showMoreButton={true}
                moreButtonUrl="/all-news"
                widthPercent={100}
              />
            </div>
          )}
        </div>

        {/* Кнопка "Всі новини з рубрики" */}
        {!hideHeader && (
          <>
            <ViewAllButton href={`/category/${category.toLowerCase()}`} />
            
          </>
        )}
         {/* Розділювальна лінія */}
        <div className={styles.separator}></div>
      </div>
    </section>
  );
}