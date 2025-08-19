import { AllNews, CategoryNews, ColumnNews, MainNews, CategoryTitle, AdBanner, Breadcrumbs } from "@/app/components";
import NewsList from "@/app/components/listNews/listNews";
import Image from "next/image";
import arrowRight from "@/assets/icons/arrowRight.svg";
import styles from "./page.module.css";
import {getCategoryTitle} from "@/assets/utils/getTranslateCategory";
import CurrencyRates from "@/app/components/hero/CurrencyRates";
import WeatherWidget from "@/app/components/hero/WeatherWidget";
import adBannerIndfomo from '@/assets/images/Ad Banner black.png';
import banner3 from '@/assets/images/banner3.png';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  
  // Перевіряємо, чи існує category
  if (!category) {
    return <div>Категорія не знайдена</div>;
  }
  
  // Функція для генерації випадкових новин для NewsList
  const generateRandomNews = (count: number) => {
    const titles = [
      "Зеленський підписав новий закон",
      "В Україні прогнозують грози",
      "Трамп дав нове інтерв'ю",
      "На Львівщині відкрили парк",
      "Вчені винайшли новий велосипед",
      "Новий арт-проєкт у центрі Києва",
      "Економічні новини та аналітика",
      "Спортивні події та досягнення",
      "Культурні заходи та фестивалі",
      "Медичні новини та здоров'я",
    ];

    const articleIds = [
      "zelensky-new-law",
      "ukraine-thunderstorms",
      "trump-interview",
      "lviv-region-park",
      "scientists-bicycle",
      "kyiv-art-project",
      "economic-news",
      "sports-events",
      "cultural-events",
      "medical-news"
    ];

    return Array.from({ length: count }, (_, index) => ({
      id: `category-${index + 1}`,
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
      url: `/article/${articleIds[Math.floor(Math.random() * articleIds.length)]}-${index + 1}`,
    }));
  };



  // Генеруємо дані для трьох колонок NewsList
  const newsData1 = generateRandomNews(8);
  const newsData2 = generateRandomNews(8);
  const newsData3 = generateRandomNews(8);



  return (
    <>
      <div className={styles.container}>
        {/* Основний контент - ліва частина */}
        <div className={styles.mainContent}>
          {/* Breadcrumbs навігація */}
        <Breadcrumbs 
          items={[
            { label: 'ГОЛОВНА', href: '/' },
            { label: getCategoryTitle(category).toUpperCase() }
          ]} 
        />
          {/* Тайтл кСатегорії */}
          <CategoryTitle
            title={getCategoryTitle(category)}
            className={styles.categoryTitleStandard}
          />
          
          
          {/* Основна новина */}
          <MainNews 
            title="На фронті від початку доби - 101 зіткнення, бої точаться на семи напрямках"
            date="02 липня 2025"
            time="14:54"
            url="/article/front-news-101"
            imageUrl="https://picsum.photos/800/500?random=main"
            imageAlt="Військові дії на фронті"
            className={styles.mainNewsStandard}
          />
          
          
          
          {/* Основна категорія - без заголовка */}
          <CategoryNews 
            height={133}
            category={category.toUpperCase()} 
            hideHeader={true} 
            className={styles.categoryNewsStandard}
          />
          
          {/* Рекламний банер */}
          <AdBanner className={styles.adBannerStandard} />
          
          
          {/* Колонка новин - без заголовка */}
          <ColumnNews 
            newsQuantity={4} 
            smallImg={true} 
            category="ПОЛІТИКА" 
            secondCategory=""
            showNewsList={false} 
            hideHeader={true} 
            className={styles.columnNewsStandard}
          />
          
          {/* Рекламний банер */}
          <AdBanner className={styles.adBannerStandard} />
          
          {/* Колонка новин - без заголовка */}
          <ColumnNews 
            newsQuantity={8} 
            category="ЕВРОПА" 
            secondCategory=""
            showNewsList={false} 
            hideHeader={true} 
            className={styles.columnNewsStandard}
          />
          
            {/* Рекламний банер */}
            <AdBanner className={styles.adBannerStandard} />
          
          {/* Категорія новин - без заголовка */}
          <CategoryNews 
            height={133}
            category="ЗДОРОВ'Я" 
            hideHeader={true} 
            className={styles.categoryNewsStandard}
          />
          
         
          
          {/* Колонка новин - без заголовка */}
          <ColumnNews 
            newsQuantity={8} 
            category="КРИМІНАЛ" 
            secondCategory="false" 
            showNewsList={false} 
            hideHeader={true} 
            className={styles.columnNewsStandard}
          />
          
        
          
          {/* Колонка новин - без заголовка */}
          <ColumnNews 
            newsQuantity={4} 
            smallImg={true} 
            category="КУЛЬТУРА" 
            secondCategory=""
            showNewsList={false} 
            hideHeader={true} 
            className={styles.columnNewsStandard}
          />
          
          
        </div>

        {/* Права частина - три колонки NewsList */}
        <div className={styles.sidebar}>
        <div className={styles.newsColumn}>
            <Image 
                src={banner3} 
                alt="banner3" 
                width={600} 
                height={240} 
                className={styles.banner3}
                priority={false}
              />
          </div>
          <div className={styles.infoSection}>
            <CurrencyRates />
            <WeatherWidget />
          </div>
          <div className={styles.rightSeparator}></div>
          
          <div className={styles.newsColumn}>
            <NewsList
            arrowRightIcon
              title="ПОЛІТИКА"
              data={newsData1}
              showImagesAt={[0, 1]}
              showMoreButton={true}
              moreButtonUrl="/category/politics"
              widthPercent={100}
            />
          </div>
          
          {/* Сепаратор між правими компонентами */}
          <div className={styles.rightSeparator}></div>
          <div className={styles.newsColumn}>
            <Image 
                src={adBannerIndfomo} 
                alt="IN-FOMO Banner" 
                width={600} 
                height={240} 
                className={styles.fomoLogo}
                priority={false}
              />
          </div>
          <div className={styles.rightSeparator}></div>
          
          <div className={styles.newsColumn}>
            <NewsList
            arrowRightIcon
              title="ЕКОНОМІКА"
              data={newsData2}
              showImagesAt={[0, 1]}
              showMoreButton={true}
              moreButtonUrl="/category/economy"
              widthPercent={100}
            />
          </div>
          
          {/* Сепаратор між правими компонентами */}
          <div className={styles.rightSeparator}></div>
          
          <div className={styles.newsColumn}>
            <NewsList
            arrowRightIcon
              title="СПОРТ"
              data={newsData3}
              showImagesAt={[0, 1]}
              showMoreButton={true}
              moreButtonUrl="/category/sport"
              widthPercent={100}
            />
          </div>
        </div>
      </div>
      <div className={styles.containerAllNews}>
        <AllNews
          customTitle="Більше новин"
        />
      </div>
    </>
  );
}
