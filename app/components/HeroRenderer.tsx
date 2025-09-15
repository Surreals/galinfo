'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {Carousel, Skeleton} from 'antd';
import Image from 'next/image';
import NewsList from '@/app/components/listNews';
import CurrencyRates from './hero/CurrencyRates';
import WeatherWidget from './hero/WeatherWidget';
import { useHeroNews } from '@/app/hooks/useHeroNews';
import { useNewsByRubric } from '@/app/hooks/useNewsByRubric';
import { useNewsByRegion } from '@/app/hooks/useNewsByRegion';
import { isRegionCategory } from '@/app/lib/categoryUtils';
import {
  formatNewsDate,
  generateArticleUrl,
  getUniversalNewsImageIntxt,
  getNewsTitle,
  getUniversalNewsImageFull
} from '@/app/lib/newsUtils';
import { heroSchema, heroInfoSchema, heroInfoMobileSchema } from '@/app/lib/heroSchema';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';

import arrowRight from "@/assets/icons/arrowRight.svg";
import roundArrowRight from "@/assets/icons/roundArrowRight.svg";
import roundArrowLeft from "@/assets/icons/roundArrowLeft.svg";
import adBannerIndfomo from '@/assets/images/Ad Banner white.png';

import styles from './hero/Hero.module.scss';

dayjs.locale('uk');

interface HeroRendererProps {
  schema?: any;
  infoSchema?: any;
  isMobile?: boolean;
}

export default function HeroRenderer({ 
  schema = heroSchema, 
  infoSchema,
  isMobile = false 
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

  // Transform hero news for carousel
  const carouselItems = heroNews?.slice(0, carouselConfig?.limit || 4).map((item) => ({
    src: getUniversalNewsImageFull(item) || "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    title: getNewsTitle(item),
    url: generateArticleUrl(item),
  })) || [];

  // Fallback carousel items if no hero news
  const fallbackCarouselItems = [
    {
      src: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      title: "У Львові запрацював сучасний центр реабілітації для онкопацієнтів",
      url: "/article/lviv-rehabilitation-center-hero",
    },
    {
      src: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      title: "Новий парк відкрили у центрі міста з унікальними зонами відпочинку",
      url: "/article/lviv-city-park-hero",
    },
    {
      src: "https://images.pexels.com/photos/1679646/pexels-photo-1679646.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      title: "Архітектурний проект: реставрація історичних будівель Львова",
      url: "/article/lviv-architecture-restoration-hero",
    },
    {
      src: "https://images.pexels.com/photos/2356040/pexels-photo-2356040.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      title: "Екологічна ініціатива: створення зелених зон у місті",
      url: "/article/lviv-eco-initiative-hero",
    },
  ];

  const finalCarouselItems = carouselItems.length > 0 ? carouselItems : fallbackCarouselItems;


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
                        <img alt={'img'} src={item.src} className={styles.heroImg}/>
                      </div>
                      <div
                        className={styles.carouselContent}
                        onClick={() => handleCarouselClick(item.url)}
                        style={{ cursor: 'pointer' }}
                      >
                        <p className={styles.carouselTime}>
                          {heroNews?.[carouselIndex] ? formatNewsDate(heroNews[carouselIndex].ndate, heroNews[carouselIndex].udate) : '15 хвилин тому'}
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Компонент для рендерингу NewsList з підтримкою API
function NewsListRenderer({ block, isMobile }: { block: any, isMobile: boolean }) {
  const config = block.config;
  const categoryId = block.categoryId; // Отримуємо categoryId з верхнього рівня
  
  // Визначаємо, чи це регіональна категорія
  const isRegion = categoryId && categoryId !== 'all' ? isRegionCategory(Number(categoryId)) : false;
  
  // Використовуємо відповідний хук залежно від типу категорії
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

  // Вибираємо дані з відповідного хука
  const apiData = isRegion ? regionHook.data : rubricHook.data;
  const apiLoading = isRegion ? regionHook.loading : rubricHook.loading;
  const apiError = isRegion ? regionHook.error : rubricHook.error;


  // Трансформуємо дані для NewsList
  const newsData = apiData?.news?.filter(item => item && item.id)?.map(item => ({
    id: item.id.toString(),
    title: item.nheader,
    date: new Date(item.ndate).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    time: item.ntime,
    imageUrl: getUniversalNewsImageFull(item) || `https://picsum.photos/seed/${item.id || 'default'}/300/200`,
    url: generateArticleUrl(item),
  })) || [];

  // Генеруємо додаткові новини якщо потрібно
  const additionalNews = Array.from({ length: Math.max(0, (config.apiParams?.limit || 8) - newsData.length) }, (_, index) => ({
    id: `additional-${index + 1}`,
    title: `Додаткова новина ${index + 1}`,
    time: dayjs().subtract(index + 1, 'hour').format('HH:mm'),
    imageUrl: `https://picsum.photos/seed/additional-${index + 1}/300/200`,
    url: `/news/additional-${index + 1}`,
  }));

  const finalNewsData = [...newsData, ...additionalNews];


  if (apiLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <p>Завантаження новин...</p>
      </div>
    );
  }

  return (
    <NewsList
      title={config.title}
      moreButtonUrl={config.moreButtonUrl}
      data={finalNewsData}
      showSeparator={config.showSeparator}
      showImagesAt={isMobile ? (config.showImagesAt || []) : (config.showImagesAt || [])}
      widthPercent={isMobile ? 100 : (config.widthPercent || 45)}
      showMoreButton={config.showMoreButton}
      arrowRightIcon={config.arrowRightIcon}
      mobileLayout={config.mobileLayout}
    />
  );
}
