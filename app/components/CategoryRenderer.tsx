'use client';

import React from 'react';
import { useMobileContext } from '@/app/contexts/MobileContext';
import { getCategoryIdFromUrl } from '@/app/lib/categoryMapper';
import { isRegionCategory } from '@/app/lib/categoryUtils';
import { useNewsByRubric } from '@/app/hooks/useNewsByRubric';
import { useNewsByRegion } from '@/app/hooks/useNewsByRegion';
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
  const isRegion = categoryId ? isRegionCategory(categoryId) : false;
  
  // Використовуємо відповідний хук для поточної категорії (тільки для MAIN_NEWS)
  const rubricHook = useNewsByRubric({
    rubric: categoryId?.toString() || '',
    page: 1,
    limit: 8,
    lang: '1',
    approved: true,
    type: undefined,
    autoFetch: !!categoryId && !isRegion
  });

  const regionHook = useNewsByRegion({
    region: categoryId?.toString() || '',
    page: 1,
    limit: 8,
    lang: '1',
    approved: true,
    type: undefined,
    autoFetch: !!categoryId && isRegion
  });

  // Вибираємо дані з відповідного хука
  const currentCategoryData = isRegion ? regionHook.data : rubricHook.data;
  const currentCategoryLoading = isRegion ? regionHook.loading : rubricHook.loading;
  const currentCategoryError = isRegion ? regionHook.error : rubricHook.error;

  // Трансформуємо дані для поточної категорії
  const transformedCurrentCategoryData = currentCategoryData?.news?.map(item => ({
    id: item.id.toString(),
    title: item.nheader,
    date: formatNewsDate(item.ndate, (item as any).udate || Date.now() / 1000),
    time: item.ndate ? new Date(item.ndate).toLocaleTimeString('uk-UA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '',
    url: generateArticleUrl(item as any),
    imageUrl: getNewsImage(item as any) || undefined,
    isImportant: item.ntype === 1 || (item as any).nweight > 0
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
        // Отримуємо першу новину з поточної категорії
        const mainNewsItem = transformedCurrentCategoryData[0];
        
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
        return (
          <CategoryNews 
            key={index}
            height={config.height}
            category={getCategoryTitle(category).toUpperCase()}
            hideHeader={config.hideHeader}
            className={styles[config.className]}
            categoryId={blockCategoryId}
            useRealData={true}
            limit={config.apiParams?.limit}
            config={config}
          />
        );

      case 'COLUMN_NEWS':
        return (
          <ColumnNews 
            key={index}
            mobileLayout={config.mobileLayout}
            newsQuantity={config.newsQuantity}
            smallImg={config.smallImg}
            category={getCategoryTitle(blockCategoryId?.toString() || '').toUpperCase()}
            secondCategory={config.secondCategory}
            showNewsList={config.showNewsList}
            hideHeader={config.hideHeader}
            className={styles[config.className]}
            categoryId={blockCategoryId}
            useRealData={true}
            config={config}
          />
        );

      case 'NEWS_LIST':
        return (
          <NewsListRenderer 
            key={index}
            block={block}
            isMobile={isMobile}
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
        return <CurrencyRates key={index} />;

      case 'WEATHER_WIDGET':
        return <WeatherWidget key={index} />;

      case 'ALL_NEWS':
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

  // Компонент для рендерингу NewsList з підтримкою API
  function NewsListRenderer({ block, isMobile }: { block: any, isMobile: boolean }) {
    const config = block.config;
    const blockCategoryId = block.categoryId;
    
    // Визначаємо, чи це регіональна категорія
    const isBlockRegion = blockCategoryId && blockCategoryId !== 'all' ? isRegionCategory(Number(blockCategoryId)) : false;
    
    // Використовуємо відповідний хук залежно від типу категорії
    const rubricHook = useNewsByRubric({
      rubric: blockCategoryId?.toString() || '',
      page: config.apiParams?.page || 1,
      limit: config.apiParams?.limit || 8,
      lang: config.apiParams?.lang || '1',
      approved: config.apiParams?.approved !== undefined ? config.apiParams.approved : true,
      type: config.apiParams?.type,
      autoFetch: !!blockCategoryId && !isBlockRegion
    });

    const regionHook = useNewsByRegion({
      region: blockCategoryId?.toString() || '',
      page: config.apiParams?.page || 1,
      limit: config.apiParams?.limit || 8,
      lang: config.apiParams?.lang || '1',
      approved: config.apiParams?.approved !== undefined ? config.apiParams.approved : true,
      type: config.apiParams?.type,
      autoFetch: !!blockCategoryId && isBlockRegion
    });

    // Вибираємо дані з відповідного хука
    const apiData = isBlockRegion ? regionHook.data : rubricHook.data;
    const apiLoading = isBlockRegion ? regionHook.loading : rubricHook.loading;
    const apiError = isBlockRegion ? regionHook.error : rubricHook.error;

    // Трансформуємо дані для NewsList
    const newsData = apiData?.news?.map(item => ({
      id: item.id.toString(),
      title: item.nheader,
      date: formatNewsDate(item.ndate, (item as any).udate || Date.now() / 1000),
      time: new Date(item.ndate).toLocaleTimeString('uk-UA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      url: generateArticleUrl(item as any),
      imageUrl: getNewsImage(item as any) || undefined,
      isImportant: item.ntype === 1 || (item as any).nweight > 0
    })) || [];

    return (
      <div className={styles.newsColumn}>
        <NewsList
          mobileLayout={config.mobileLayout}
          arrowRightIcon={config.arrowRightIcon}
          title={config.title}
          data={newsData}
          showImagesAt={config.showImagesAt}
          showMoreButton={config.showMoreButton}
          moreButtonUrl={config.moreButtonUrl}
          widthPercent={config.widthPercent}
        />
      </div>
    );
  }

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
