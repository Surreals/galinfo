'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {Carousel, Skeleton} from 'antd';
import Image from 'next/image';
import NewsList from '@/app/components/listNews';
import CurrencyRates from './hero/CurrencyRates';
import WeatherWidget from './hero/WeatherWidget';
import { useHeroNews } from '@/app/hooks/useHeroNews';
import { useNewsByRubric, NewsItem as ApiNewsItem } from '@/app/hooks/useNewsByRubric';
import { useNewsByRegion } from '@/app/hooks/useNewsByRegion';
import { isRegionCategory } from '@/app/lib/categoryUtils';
import {
  formatNewsDate,
  formatFullNewsDate,
  generateArticleUrl,
  getUniversalNewsImageIntxt,
  getNewsTitle,
  getUniversalNewsImageFull,
  getAllNewsImages
} from '@/app/lib/newsUtils';
import { heroSchema, heroInfoSchema, heroInfoMobileSchema } from '@/app/lib/heroSchema';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';

import arrowRight from "@/assets/icons/arrowRight.svg";
import roundArrowRight from "@/assets/icons/roundArrowRight.svg";
import roundArrowLeft from "@/assets/icons/roundArrowLeft.svg";
import adBannerIndfomo from '@/assets/images/Ad Banner white.png';

import styles from './hero/Hero.module.scss';
import {log} from "next/dist/server/typescript/utils";

dayjs.locale('uk');

interface HeroRendererProps {
  schema?: any;
  infoSchema?: any;
  isMobile?: boolean;
}

export default function HeroRenderer({ 
  schema = heroSchema, 
  infoSchema,
}: HeroRendererProps) {
  const carouselRef = useRef<any>(null);
  const router = useRouter();
  const [isMobileResize, setIsMobile] = useState(false);

  // Визначаємо яку схему використовувати для info секції
  const currentInfoSchema = infoSchema || (isMobileResize ? heroInfoMobileSchema : heroInfoSchema);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Отримуємо дані для каруселі
  const carouselConfig = schema.blocks.find(block => block.type === 'Carousel')?.config;
  const { heroNews, loading: heroLoading, error: heroError } = useHeroNews();

  // Обробка каруселі
  const onChange = (currentSlide: number) => {
    // console.log(currentSlide);
  };

  const handleCarouselClick = (url: string) => {
    router.push(url);
  };

  console.log('heroNews', heroNews)

  // Transform hero news for carousel
  const carouselItems = heroNews?.slice(0, carouselConfig?.limit || 4).map((item) => ({
    src: getUniversalNewsImageFull(item),
    title: getNewsTitle(item),
    url: generateArticleUrl(item),
  })) || [];

  // Fallback carousel items if no hero news
  const fallbackCarouselItems = [
    {
      src: "",
      title: "У Львові запрацював сучасний центр реабілітації для онкопацієнтів",
      url: "/article/lviv-rehabilitation-center-hero",
    },
    {
      src: "",
      title: "Новий парк відкрили у центрі міста з унікальними зонами відпочинку",
      url: "/article/lviv-city-park-hero",
    },
    {
      src: "",
      title: "Архітектурний проект: реставрація історичних будівель Львова",
      url: "/article/lviv-architecture-restoration-hero",
    },
    {
      src: "",
      title: "Екологічна ініціатива: створення зелених зон у місті",
      url: "/article/lviv-eco-initiative-hero",
    },
  ];

  const finalCarouselItems = carouselItems.length > 0 ? carouselItems : fallbackCarouselItems;

  console.log('finalCarouselItems',finalCarouselItems)

  // Рендер компонентів на основі схеми
  const renderBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'Carousel':
        return (
          <div key={index} className={styles.carouselBox}>
            {
              heroLoading  ?
                <div style={{ width: '100%', height:'533px' }}>
                  <Skeleton.Input active style={{ width: '100%', height:'533px', marginBottom: 24 }} />
                </div> :
                <Carousel
                  afterChange={onChange}
                  autoplay={block.config?.autoplay}
                  ref={carouselRef}
                >
                  {finalCarouselItems.map((item, carouselIndex) => (
                    <div key={carouselIndex} className={styles.carouselItem}>
                      <div
                        onClick={() => handleCarouselClick(item.url)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img alt={'img'} src={item.src} loading="lazy" className={styles.heroImg}/>
                      </div>
                      <div
                        className={styles.carouselContent}
                        onClick={() => handleCarouselClick(item.url)}
                        style={{cursor: 'pointer'}}
                      >
                        <p className={styles.carouselTime}>
                          {heroNews?.[carouselIndex]
                            ? getTimeDifference(heroNews[carouselIndex].ndate)
                            : '15 хвилин тому'}
                        </p>
                        <h3 className={styles.carouselTitle}>{item.title}</h3>
                      </div>
                      {block.config?.showArrows && (
                        <>
                          <button
                            onClick={() => carouselRef.current?.next()}
                            className={styles.rightArrowButton}
                          >
                            <Image
                              src={roundArrowRight}
                              alt="Right arrow"
                              width={44}
                              height={44}
                            />
                          </button>
                          <button
                            onClick={() => carouselRef.current?.prev()}
                            className={styles.leftArrowButton}
                          >
                            <Image
                              src={roundArrowLeft}
                              alt="Left arrow"
                              width={44}
                              height={44}
                            />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </Carousel>
            }

          </div>
        );

      case 'CurrencyRates':
        return block.config?.show ? <CurrencyRates loading={heroLoading} key={index} /> : null;

      case 'WeatherWidget':
        return block.config?.show ? <WeatherWidget key={index} /> : null;

      case 'InfoSection':
        return block.config?.show ? (
          <div key={index} className={styles.infoSection}>
            {block.children?.map((child: any, childIndex: number) => renderBlock(child, childIndex))}
          </div>
        ) : null;

      case 'NewsList':
        return (
          <NewsListRenderer 
            key={index}
            block={block}
            isMobile={isMobileResize}
          />
        );

      case 'AdBanner':
        if (block.config?.mobileOnly && !isMobileResize) return null;
        return (
          <div key={index} className={styles.fomoLogo}>
            <Image 
              src={adBannerIndfomo} 
              alt={block.config?.alt || "Banner"} 
              width={block.config?.width || 600} 
              height={block.config?.height || 240} 
              priority={false}
            />
          </div>
        );

      default:
        return null;
    }
  };


  // Show error state
  if (heroError) {
    console.error('Hero news error:', heroError);
  }

  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.heroBox}>
          {schema.blocks.map((block, index) => renderBlock(block, index))}
        </div>
      </div>
      <div className={styles.containerHeroInfo}>
        {currentInfoSchema.blocks.map((block, index) => renderBlock(block, index))}
      </div>
    </section>
  );
}

// Допоміжна функція для обчислення різниці часу
function getTimeDifference(publishDate) {
  const now = new Date(); // Поточний час (12:56 AM EEST, 17 вересня 2025)
  const pubDate = new Date(publishDate); // Час публікації з об’єкта

  const diffMs = now - pubDate; // Різниця в мілісекундах
  const diffMinutes = Math.floor(diffMs / (1000 * 60)); // Різниця в хвилинах
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60)); // Різниця в годинах
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // Різниця в днях

  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'день' : 'дні'} тому`;
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? 'годину' : 'годин'} тому`;
  } else {
    return `${diffMinutes} ${diffMinutes === 1 ? 'хвилину' : 'хвилин'} тому`;
  }
}


// Компонент для рендерингу NewsList з підтримкою API
function NewsListRenderer({ block, isMobile }: { block: any; isMobile: boolean }) {
  const config = block.config;
  const categoryId = block.categoryId;

  const isRegion = categoryId && categoryId !== 'all'
    ? isRegionCategory(Number(categoryId))
    : false;

  const rubricHook = useNewsByRubric({
    rubric: categoryId?.toString() || '',
    page: config.apiParams?.page || 1,
    limit: config.apiParams?.limit || 8,
    lang: config.apiParams?.lang || '1',
    approved: config.apiParams?.approved !== undefined ? config.apiParams.approved : true,
    type: config.apiParams?.type,
    autoFetch: config.useRealData && !!categoryId && !isRegion
  });

  const regionHook = useNewsByRegion({
    region: categoryId?.toString() || '',
    page: config.apiParams?.page || 1,
    limit: config.apiParams?.limit || 8,
    lang: config.apiParams?.lang || '1',
    approved: config.apiParams?.approved !== undefined ? config.apiParams.approved : true,
    type: config.apiParams?.type,
    autoFetch: config.useRealData && !!categoryId && isRegion
  });

  const apiData = isRegion ? regionHook.data : rubricHook.data;
  const apiLoading = isRegion ? regionHook.loading : rubricHook.loading;

  // ⬇️ додаємо локальний прапор, який покаже скелетон тільки з першого рендера
  const [initial, setInitial] = React.useState(true);

  React.useEffect(() => {
    if (!apiLoading) {
      setInitial(false);
    }
  }, [apiLoading]);

  if (initial) {
    // повністю біла сторінка або ваш скелетон
    return (
      <div style={{ height: '400px' }}>
      </div>
    );
  }

  // готуємо дані, як раніше
  const newsData = apiData?.news?.filter(i => i && i.id)?.map((item: ApiNewsItem) => {
    // Отримуємо всі доступні зображення
    const allImages = getAllNewsImages(item as any);
    const imageUrls = allImages.map(img => img.urls.full).filter(Boolean);
    
    return {
      id: item.id.toString(),
      title: item.nheader,
      data: formatFullNewsDate(item.ndate, item.ntime),
      time: item.ntime, // Залишаємо для сумісності
      imageUrl: getUniversalNewsImageFull(item as any),
      imageUrls: imageUrls, // Всі доступні зображення
      url: generateArticleUrl(item as any),
    };
  }) || [];


  return (
    <NewsList
      loading={apiLoading}
      title={config.title}
      moreButtonUrl={config.moreButtonUrl}
      data={newsData}
      showSeparator={config.showSeparator}
      showImagesAt={isMobile ? (config.showImagesAt || []) : (config.showImagesAt || [])}
      widthPercent={isMobile ? 100 : (config.widthPercent || 45)}
      showMoreButton={config.showMoreButton}
      arrowRightIcon={config.arrowRightIcon}
      mobileLayout={config.mobileLayout}
      noFallbackImages={config.noFallbackImages || false}
      // showAllImages={true} // Показуємо всі доступні зображення в Hero секції
    />
  );
}

