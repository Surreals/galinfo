'use client';

import React from 'react';
import { useMobileContext } from '@/app/contexts/MobileContext';
import { getCategoryIdFromUrl } from '@/app/lib/categoryMapper';
import { isRegionCategory } from '@/app/lib/categoryUtils';
import { useNewsByRubric } from '@/app/hooks/useNewsByRubric';
import { useNewsByRegion } from '@/app/hooks/useNewsByRegion';
import { useImportantNewsByCategory } from '@/app/hooks/useImportantNewsByCategory';
import { useImportantNews } from '@/app/hooks/useImportantNews';
import { useLatestNews } from '@/app/hooks/useLatestNews';
import { getCategoryTitle } from '@/assets/utils/getTranslateCategory';
import { formatNewsDate, generateArticleUrl, getNewsImage } from '@/app/lib/newsUtils';
import { categoryDesktopSchema, categoryMobileSchema } from '@/app/lib/categorySchema';

// Імпорт компонентів
import { 
  AllNews, 
  CategoryNews, 
  ColumnNews, 
  MainNews, 
  CategoryTitle, 
  AdBanner, 
  Breadcrumbs 
} from "@/app/components";
import NewsList from "@/app/components/listNews/listNews";
import CurrencyRates from "@/app/components/hero/CurrencyRates";
import WeatherWidget from "@/app/components/hero/WeatherWidget";
import Image from "next/image";
import styles from "../[category]/page.module.css";
import banner3 from '@/assets/images/banner3.png';
import adBannerIndfomo from '@/assets/images/Ad Banner black.png';

interface CategoryRendererProps {
  category: string;
}

const CategoryRenderer: React.FC<CategoryRendererProps> = ({ category }) => {
  const { isMobile } = useMobileContext();
  
  // Отримуємо categoryId з URL параметра
  const categoryId = getCategoryIdFromUrl(category);
  
  // Визначаємо, чи це регіональна категорія
  const isRegion = categoryId !== null ? isRegionCategory(categoryId) : false;
  
  // Визначаємо, чи це категорія "all" (всі новини)
  const isAllCategory = categoryId === 0;
  
  // Визначаємо, чи це категорія "important" (важливі новини)
  const isImportantCategory = categoryId === -1;
  
  // Хук для важливих новин (для головної новини)
  const importantNewsHook = useImportantNewsByCategory({
    rubric: categoryId?.toString() || '',
    limit: 1,
    lang: '1',
    level: 1, // Найважливіші новини
    autoFetch: categoryId !== null && !isRegion && !isAllCategory
  });

  // Використовуємо відповідний хук для поточної категорії (єдиний запит на 36 новин)
  const rubricHook = useNewsByRubric({
    rubric: categoryId?.toString() || '',
    page: 1,
    limit: 36, // Запитуємо 36 новин одразу
    lang: '1',
    approved: true,
    type: undefined,
    autoFetch: categoryId !== null && !isRegion && !isAllCategory
  });

  const regionHook = useNewsByRegion({
    region: categoryId?.toString() || '',
    page: 1,
    limit: 36, // Запитуємо 36 новин одразу
    lang: '1',
    approved: true,
    type: undefined,
    autoFetch: categoryId !== null && isRegion
  });

  // Хук для всіх новин (коли categoryId = 0) - завантажуємо 56 новин
  const allNewsHook = useLatestNews({
    page: 1,
    limit: 56, // Запитуємо 56 новин одразу для категорії "all"
    lang: '1',
    autoFetch: isAllCategory
  });

  // Хук для важливих новин (коли categoryId = -1) - завантажуємо 56 новин
  const importantNewsCategoryHook = useImportantNews({
    limit: 56, // Запитуємо 56 новин одразу для категорії "important" (як і для "all")
    lang: '1',
    autoFetch: isImportantCategory
  });

  // Вибираємо дані з відповідного хука
  const currentCategoryData = isAllCategory ? allNewsHook.data : 
                             isImportantCategory ? { news: importantNewsCategoryHook.importantNews } : 
                             (isRegion ? regionHook.data : rubricHook.data);
  const currentCategoryLoading = isAllCategory ? allNewsHook.loading : 
                                isImportantCategory ? importantNewsCategoryHook.loading : 
                                (isRegion ? regionHook.loading : rubricHook.loading);
  const currentCategoryError = isAllCategory ? allNewsHook.error : 
                              isImportantCategory ? importantNewsCategoryHook.error : 
                              (isRegion ? regionHook.error : rubricHook.error);

  // Трансформуємо дані для поточної категорії (36 новин для звичайних категорій, 56 для "all" та "important")
  const transformedCurrentCategoryData = currentCategoryData?.news?.filter(item => item && item.id)?.map(item => ({
    id: item.id.toString(),
    title: item.nheader,
    date: formatNewsDate(item.ndate, (item as any).udate || Date.now() / 1000),
    time: item.ndate ? new Date(item.ndate).toLocaleTimeString('uk-UA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '',
    url: generateArticleUrl(item as any),
    imageUrl: getNewsImage(item as any) || 'https://picsum.photos/300/200?random=1',
    imageAlt: item.nheader,
    isImportant: item.ntype === 1 || (item as any).nweight > 0,
    nweight: (item as any).nweight || 0,
    summary: (item as any).nteaser || (item as any).nsubheader || ''
  })) || [];

  // Функція для рендерингу блоку
  const renderBlock = (block: any, index: number) => {
    const config = block.config;
    const blockCategoryId = block.categoryId === 'CURRENT_CATEGORY' ? categoryId : block.categoryId;
    
    
    
    if (!config?.show) return null;

    // Перевірка на мобільну/десктопну версію
    if (config.mobileOnly && !isMobile) return null;
    if (config.desktopOnly && isMobile) return null;

    switch (block.type) {
      case 'BREADCRUMBS':
        return (
          <Breadcrumbs 
            key={index}
            items={[
              { label: 'ГОЛОВНА', href: '/' },
              { label: getCategoryTitle(category).toUpperCase() }
            ]} 
          />
        );

      case 'CATEGORY_TITLE':
        return (
          <CategoryTitle
            key={index}
            title={getCategoryTitle(category)}
            className={styles[config.className]}
          />
        );

      case 'MAIN_NEWS':
        // Використовуємо важливі новини для головної новини
        let mainNewsItem = null;
        
        if (isImportantCategory && importantNewsCategoryHook.importantNews && importantNewsCategoryHook.importantNews.length > 0) {
          // Для категорії important використовуємо першу важливу новину
          const importantNews = importantNewsCategoryHook.importantNews[0];
          mainNewsItem = {
            title: importantNews.nheader,
            date: formatNewsDate(importantNews.ndate, Date.now() / 1000),
            time: importantNews.ntime,
            url: generateArticleUrl(importantNews as any),
            imageUrl: getNewsImage(importantNews as any) || 'https://picsum.photos/300/200?random=1',
            imageAlt: importantNews.nheader
          };
        } else if (!isRegion && !isImportantCategory && importantNewsHook.data?.importantNews && importantNewsHook.data.importantNews.length > 0) {
          // Використовуємо важливу новину якщо є (для звичайних категорій)
          const importantNews = importantNewsHook.data.importantNews[0];
          mainNewsItem = {
            title: importantNews.nheader,
            date: formatNewsDate(importantNews.ndate, Date.now() / 1000),
            time: importantNews.ntime,
            url: generateArticleUrl(importantNews as any),
            imageUrl: getNewsImage(importantNews as any) || 'https://picsum.photos/300/200?random=1',
            imageAlt: importantNews.nheader
          };
        } else {
          // Fallback до звичайних новин
          const mainNewsIndex = config.newsIndex || 0;
          mainNewsItem = transformedCurrentCategoryData[mainNewsIndex];
        }
        
        if (!mainNewsItem) {
          return null; // Якщо немає новин, не показуємо MainNews
        }
        
        return (
          <MainNews 
            key={index}
            title={mainNewsItem.title}
            date={mainNewsItem.date}
            time={mainNewsItem.time}
            url={mainNewsItem.url}
            imageUrl={mainNewsItem.imageUrl || config.imageUrl}
            imageAlt={mainNewsItem.title}
            className={styles[config.className]}
          />
        );

      case 'CATEGORY_NEWS':
        // Отримуємо новини за діапазоном з єдиного набору
        const categoryNewsRange = config.newsRange;
        const categoryNewsData = categoryNewsRange 
          ? transformedCurrentCategoryData.slice(categoryNewsRange.start - 1, categoryNewsRange.end)
          : transformedCurrentCategoryData.slice(0, 8); // fallback до перших 8 новин
        
        return (
          <CategoryNews 
            key={index}
            height={config.height}
            category={getCategoryTitle(category).toUpperCase()}
            hideHeader={config.hideHeader}
            className={styles[config.className]}
            categoryId={blockCategoryId}
            useRealData={false} // Вимикаємо API запит, оскільки передаємо готові дані
            limit={categoryNewsData.length}
            config={config}
            news={categoryNewsData} // Передаємо готові дані через проп news
            isCategoryPage={true} // Встановлюємо висоту фото 133px для сторінок категорій
          />
        );

      case 'COLUMN_NEWS':
        // Отримуємо новини за діапазоном з єдиного набору
        const columnNewsRange = config.newsRange;
        const columnNewsData = columnNewsRange 
          ? transformedCurrentCategoryData.slice(columnNewsRange.start - 1, columnNewsRange.end)
          : transformedCurrentCategoryData.slice(0, config.newsQuantity || 5); // fallback
        
        return (
          <ColumnNews 
            key={index}
            mobileLayout={config.mobileLayout}
            newsQuantity={columnNewsData.length}
            smallImg={config.smallImg}
            category={getCategoryTitle(blockCategoryId?.toString() || '').toUpperCase()}
            secondCategory={config.secondCategory}
            showNewsList={config.showNewsList}
            hideHeader={config.hideHeader}
            className={styles[config.className]}
            categoryId={blockCategoryId}
            useRealData={false} // Вимикаємо API запит, оскільки передаємо готові дані
            config={config}
            news={columnNewsData} // Передаємо готові дані через проп news
          />
        );

      case 'NEWS_LIST':
        const newsListConfig = block.config;
        const newsListBlockCategoryId = block.categoryId;
        
        return (
          <NewsList
            key={index}
            mobileLayout={newsListConfig.mobileLayout}
            arrowRightIcon={newsListConfig.arrowRightIcon}
            title={newsListConfig.title}
            showImagesAt={newsListConfig.showImagesAt}
            showMoreButton={newsListConfig.showMoreButton}
            moreButtonUrl={newsListConfig.moreButtonUrl}
            widthPercent={newsListConfig.widthPercent}
            categoryId={newsListBlockCategoryId}
            useRealData={true}
            config={newsListConfig}
          />
        );

      case 'AD_BANNER':
        return (
          <AdBanner 
            key={index}
            className={styles[config.className]}
          />
        );

      case 'BANNER_IMAGE':
        // Визначаємо правильне зображення на основі src
        let imageSrc;
        if (config.src?.includes('banner3.png')) {
          imageSrc = banner3;
        } else if (config.src?.includes('Ad Banner black.png')) {
          imageSrc = adBannerIndfomo;
        } else {
          imageSrc = config.src;
        }
        
        return (
          <div key={index} className={styles.newsColumn}>
            <Image 
              src={imageSrc}
              alt={config.alt}
              width={config.width}
              height={config.height}
              className={styles[config.className]}
              priority={false}
              style={config.style}
            />
          </div>
        );

      case 'INFO_SECTION':
        return (
          <div key={index} className={styles.infoSection}>
            {block.children?.map((child: any, childIndex: number) => renderBlock(child, childIndex))}
          </div>
        );

      case 'CURRENCY_RATES':
        return <CurrencyRates key={index} loading={false} />;

      case 'WEATHER_WIDGET':
        return <WeatherWidget key={index} />;

      case 'ALL_NEWS':
        // Перевіряємо, чи цей блок призначений тільки для категорії "all"
        if (config.onlyForAllCategory && !isAllCategory) {
          return null; // Не показуємо блок для інших категорій
        }
        
        // Для категорії "all" та "important" передаємо останні 20 новин
        if (isAllCategory || isImportantCategory) {
          const allNewsData = transformedCurrentCategoryData.slice(36, 56); // Останні 20 новин з 56
          return (
            <AllNews
              key={index}
              customTitle={config.customTitle || "Більше новин"}
              news={allNewsData}
              hideHeader={false}
            />
          );
        }
        // Для інших категорій використовуємо стандартну логіку
        return (
          <AllNews
            key={index}
            customTitle={config.customTitle}
          />
        );

      case 'SEPARATOR':
        return (
          <div key={index} className={styles.separator}></div>
        );

      case 'RIGHT_SEPARATOR':
        return (
          <div key={index} className={styles.rightSeparator}></div>
        );

      default:
        return null;
    }
  };


  // Вибираємо схему залежно від пристрою
  const schema = isMobile ? categoryMobileSchema : categoryDesktopSchema;

  return (
    <>
      <div className={styles.container}>
        {/* Основний контент - ліва частина */}
        <div className={styles.mainContent}>
          {schema.blocks.map((block, index) => renderBlock(block, index))}
        </div>

        {/* Бокова панель для десктопу */}
        {!isMobile && (schema as any).sidebar && (
          <div className={styles.sidebar}>
            {(schema as any).sidebar.blocks.map((block: any, index: number) => renderBlock(block, index))}
          </div>
        )}
      </div>

      {/* Футер для десктопу */}
      {!isMobile && (schema as any).footer && (
        <div className={styles.containerAllNews}>
          {(schema as any).footer.blocks.map((block: any, index: number) => renderBlock(block, index))}
        </div>
      )}
    </>
  );
};

export default CategoryRenderer;
