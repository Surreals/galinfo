'use client';

import React from 'react';
import { Skeleton } from "antd";
import { useMobileContext } from '@/app/contexts/MobileContext';
import { useLatestNews } from '@/app/hooks/useLatestNews';
import { useImportantNews } from '@/app/hooks/useImportantNews';
import { formatNewsDate, generateArticleUrl, getNewsImage, getUniversalNewsImage } from '@/app/lib/newsUtils';
import { articlePageDesktopSchema, articlePageMobileSchema } from '@/app/lib/articlePageSchema';

// Імпорт компонентів
import { 
  CategoryNews, 
  ColumnNews, 
  AdBanner, 
  Breadcrumbs,
  ArticleMeta
} from "@/app/components";
import NewsList from "@/app/components/listNews/listNews";
import CurrencyRates from "@/app/components/hero/CurrencyRates";
import WeatherWidget from "@/app/components/hero/WeatherWidget";
import Image from "next/image";
import styles from "../news/[id]/page.module.css";
import banner3 from '@/assets/images/banner3.png';
import adBannerIndfomo from '@/assets/images/Ad Banner black.png';

interface ArticlePageRendererProps {
  article: any;
  loading: boolean;
}

const ArticlePageRenderer: React.FC<ArticlePageRendererProps> = ({ article, loading }) => {
  const { isMobile } = useMobileContext();
  
  // Хук для свіжих новин (СВІЖІ НОВИНИ)
  const latestNewsHook = useLatestNews({
    page: 1,
    limit: 4,
    lang: '1',
    autoFetch: true
  });

  // Хук для важливих новин (ТОП НОВИНИ)
  const importantNewsHook = useImportantNews({
    limit: 8,
    lang: '1',
    autoFetch: true
  });

  // Трансформуємо дані для свіжих новин
  const transformedLatestNews = latestNewsHook.data?.news?.filter(item => item && item.id)?.map(item => ({
    id: item.id.toString(),
    title: item.nheader,
    date: formatNewsDate(item.ndate, Date.now() / 1000),
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

  // Трансформуємо дані для важливих новин
  const transformedImportantNews = importantNewsHook.importantNews?.filter(item => item && item.id)?.map(item => ({
    id: item.id.toString(),
    title: item.nheader,
    date: formatNewsDate(item.ndate, Date.now() / 1000),
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
              ...(article?.breadcrumbs?.map(
                (item: { title: string; link: string }, index: number, arr: any[]) => {
                  if (index === arr.length - 1) {
                    return { label: item.title };
                  }
                  return { label: item.title, href: item.link };
                }
              ) || []),
            ]} 
          />
        );

      case 'ARTICLE_META':
        return (
          <ArticleMeta 
            key={index}
            date={article?.ndate} 
            time={article?.ntime} 
            isMobile={isMobile} 
          />
        );

      case 'ARTICLE_HEADER':
        if (loading) {
          return (
            <div key={index} className={styles.articleHeader}>
              <Skeleton.Input
                active
                style={{ width: '80%', height: 40, marginBottom: 16 }}
              />
              <Skeleton.Input
                active
                style={{ width: '60%', height: 24, marginBottom: 24 }}
              />
            </div>
          );
        }
        
        return (
          <div key={index} className={styles.articleHeader}>
            <h1 className={styles.articleTitle}>{article?.nheader}</h1>
            {article?.nteaser && (
              <p className={styles.articleLead}>{article?.nteaser}</p>
            )}
          </div>
        );

      case 'ARTICLE_IMAGE':
        if (loading) {
          return (
            <div key={index} className={styles.articleImage}>
              <Skeleton.Input
                style={{ width: '100%', height: 400, marginBottom: 24 }}
                active
              />
            </div>
          );
        }

        if (!article?.images_data?.length) return null;

        const imageUrl = getUniversalNewsImage(article, 'full') || getUniversalNewsImage(article);
        
        return (
          <div key={index} className={styles.articleImage}>
            <Image
              src={imageUrl}
              alt={imageUrl}
              width={800}
              height={500}
              className={styles.mainImage}
              priority={true}
            />
            <div className={styles.imageCredits}>
              {article?.images_data?.[0]?.title && (
                <span className={styles.photoCredit}>
                  {article?.images_data?.[0]?.title}
                </span>
              )}
            </div>
          </div>
        );

      case 'ARTICLE_CONTENT':
        if (loading) {
          return (
            <Skeleton key={index} active paragraph={{ rows: 6 }} />
          );
        }

        return (
          <div
            key={index}
            className={styles.paragraph}
            dangerouslySetInnerHTML={{ __html: article?.nbody || '' }}
          />
        );

      case 'ARTICLE_TAGS':
        if (loading) {
          return (
            <div key={index} className={styles.articleMetadata}>
              <Skeleton.Input
                active
                style={{ width: 120, height: 20, marginTop: 16 }}
              />
            </div>
          );
        }

        return (
          <div key={index} className={styles.articleMetadata}>
            <div className={styles.tags}>
              {article?.tags?.map((tag: any, index: number) => (
                <span key={tag.id || index} className={styles.tag}>
                  {tag.tag}
                </span>
              ))}
            </div>
            {article?.author_name && (
              <div className={styles.authorInfo}>
                Автор: {article?.author_name}
              </div>
            )}
          </div>
        );

      case 'COLUMN_NEWS':
        // Визначаємо дані на основі типу хука
        let columnNewsData = [];
        let viewAllButtonHref = '';
        if (block.categoryId === 'LATEST_NEWS') {
          columnNewsData = transformedLatestNews;
          viewAllButtonHref = '/all'; // Для СВІЖІ НОВИНИ веде на /all
        } else {
          columnNewsData = transformedImportantNews;
          viewAllButtonHref = '/important'; // Для ТОП НОВИНИ веде на /important
        }
        
        return (
          <ColumnNews 
            key={index}
            mobileLayout={config.mobileLayout}
            newsQuantity={columnNewsData.length}
            smallImg={config.smallImg}
            category={config.category}
            secondCategory={config.secondCategory}
            showNewsList={config.showNewsList}
            hideHeader={config.hideHeader}
            className={styles[config.className]}
            categoryId={block.categoryId}
            useRealData={false} // Вимикаємо API запит, оскільки передаємо готові дані
            config={config}
            news={columnNewsData} // Передаємо готові дані через проп news
            viewAllButtonHref={viewAllButtonHref} // Передаємо href для ViewAllButton
          />
        );

      case 'CATEGORY_NEWS':
        // Визначаємо дані на основі типу хука
        let categoryNewsData = [];
        let categoryViewAllButtonHref = '';
        if (block.categoryId === 'IMPORTANT_NEWS') {
          categoryNewsData = transformedImportantNews;
          categoryViewAllButtonHref = '/important'; // Для ТОП НОВИНИ веде на /important
        } else {
          categoryNewsData = transformedLatestNews;
          categoryViewAllButtonHref = '/all'; // Для СВІЖІ НОВИНИ веде на /all
        }
        
        return (
          <CategoryNews 
            key={index}
            height={config.height}
            category={config.category}
            hideHeader={config.hideHeader}
            className={styles[config.className]}
            categoryId={block.categoryId}
            useRealData={false} // Вимикаємо API запит, оскільки передаємо готові дані
            limit={categoryNewsData.length}
            config={config}
            news={categoryNewsData} // Передаємо готові дані через проп news
            viewAllButtonHref={categoryViewAllButtonHref} // Передаємо href для ViewAllButton
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
  const schema = isMobile ? articlePageMobileSchema : articlePageDesktopSchema;

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
    </>
  );
};

export default ArticlePageRenderer;
