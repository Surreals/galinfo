"use client";

import React, { useEffect, useState } from "react"
import Image from "next/image";
import Link from "next/link";

import {AccentSquare, ViewAllButton} from "@/app/shared";
import arrowRight from "@/assets/icons/arrowRight.svg";
import { useNewsByRubric } from '@/app/hooks/useNewsByRubric';
import { getImageUrlFromApi, getMainImageFromApi, type ApiNewsImage } from '@/app/lib/imageUtils';
import { getUniversalNewsImageThumbnail, formatFullNewsDate } from '@/app/lib/newsUtils';
import { getUrlFromCategoryId } from '@/app/lib/categoryMapper';
import galinfoLogo from '@/assets/logos/galInfoLogo.png';

import styles from "./listNews.module.scss";
import {Skeleton} from "antd";

type NewsItem = {
  id?: string;
  title: string;
  data: string; // Форматована дата з часом
  time?: string; // Залишаємо для сумісності
  imageUrl?: string | null;
  imageUrls?: string[]; // Масив всіх доступних зображень
  url?: string;
};

type NewsListProps = {
  loading?: boolean;
  data?: NewsItem[];
  showImagesAt?: number[];
  widthPercent?: number;
  title?: string;
  arrowRightIcon?: boolean;
  showMoreButton?: boolean;
  moreButtonUrl?: string;
  mobileLayout?: 'column' | 'horizontal';
  showSeparator?: boolean;
  noFallbackImages?: boolean;
  showAllImages?: boolean; // Показувати всі доступні зображення
  // Нові пропси для роботи з API
  categoryId?: number;
  useRealData?: boolean;
  config?: {
    apiParams?: {
      page?: number;
      limit?: number;
      lang?: string;
      approved?: boolean;
      type?: string;
    };
  };
};

export default function NewsList({
   data,
   loading,
   showImagesAt = [],
   widthPercent = 100,
   title,
   arrowRightIcon = false,
   showMoreButton = false,
   moreButtonUrl = "#",
   mobileLayout = 'column', // За замовчуванням - колонка
   showSeparator = false,
   noFallbackImages = false,
   showAllImages = false, // За замовчуванням - показувати тільки перше зображення
   categoryId,
   useRealData = false,
   config
 }: NewsListProps) {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Функція перевірки ширини
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  // Використовуємо хук для отримання реальних даних
  const {
    data: apiData,
    loading: apiLoading,
  } = useNewsByRubric({
    rubric: categoryId?.toString() || '',
    page: config?.apiParams?.page || 1,
    limit: config?.apiParams?.limit || 5,
    lang: config?.apiParams?.lang || '1',
    approved: config?.apiParams?.approved !== undefined ? config.apiParams.approved : true,
    type: config?.apiParams?.type,
    autoFetch: useRealData && !!categoryId
  });

  // Визначаємо, які дані використовувати
  let displayData: NewsItem[] = [];
  let displayLoading = loading;

  if (useRealData && apiData?.news) {
    // Використовуємо реальні дані з API
    displayData = apiData.news.map(item => {
      // Використовуємо універсальну функцію getUniversalNewsImageThumbnail з newsUtils
      const imageUrl = getUniversalNewsImageThumbnail(item);

      return {
        id: item.id.toString(),
        title: item.nheader,
        data: formatFullNewsDate(item.ndate, item.ntime),
        time: item.ntime, // Залишаємо для сумісності, але використовуємо data
        imageUrl: imageUrl,
        url: `/news/${item.urlkey}_${item.id}`,
      };
    });
    displayLoading = apiLoading;
  } else if (data && data.length > 0) {
    // Використовуємо передані дані
    displayData = data;
  } else {
    // Якщо немає даних та не використовуємо реальні дані, показуємо скелетон
    displayLoading = true;
    displayData = [];
  }

  // Визначаємо, чи потрібно показувати горизонтальне відображення
  const shouldShowHorizontal = isMobile && mobileLayout === 'horizontal';



  return (
    <div style={{ width: `${widthPercent}%` }} className={styles.container}>
      {
        displayLoading ?
            <div className={styles.skeletonBox}>
              {Array.from({ length: 9 }).map((_, index) => (
                <Skeleton.Input
                  key={index}
                  active
                  style={{width: '100%', height: 30}}
                />
              ))}
            </div>
          :
          <>
            {title && (
              <div className={styles.header}>
                <div className={styles.titleContainer}>
                  {isMobile ? <AccentSquare className={styles.titleAccent}/> : null}
                  {categoryId ? (
                    <Link href={`/${getUrlFromCategoryId(categoryId)}`} className={styles.titleLink}>
                      <h2 className={isMobile ? styles.titleMobile : styles.title}>{title}</h2>
                    </Link>
                  ) : (
                    <h2 className={isMobile ? styles.titleMobile : styles.title}>{title}</h2>
                  )}
                </div>
                {arrowRightIcon && categoryId && <span className={styles.titleIcon}>
          <Link href={`/${getUrlFromCategoryId(categoryId)}`} className={styles.titleLink}>
              <Image
                  src={arrowRight}
                  alt={'Arrow right'}
                  width={10}
                  height={8}
              />
             </Link>
          </span>}
              </div>
            )}

            <ul className={`${styles.list} ${shouldShowHorizontal ? styles.listHorizontal : ''}`}>
              {displayData.map((item, index) => (
                <li key={item.id || index}
                    className={`${styles.item} ${shouldShowHorizontal ? styles.itemHorizontal : ''}`}>
                  {item.url ? (
                    <a href={item.url}
                       className={`${styles.itemLink} ${shouldShowHorizontal ? styles.itemLinkHorizontal : ''}`}>
                      {/* Показуємо зображення на мобільних для кожної новини при горизонтальному відображенні, або за параметром showImagesAt */}
                      {(shouldShowHorizontal || showImagesAt.includes(index)) && (
                        <>
                          {showAllImages && item.imageUrls && item.imageUrls.length > 0 ? (
                            // Показуємо всі доступні зображення (без fallback)
                            <div className={styles.imagesContainer}>
                              {item.imageUrls.map((imageUrl, imgIndex) => (
                                <Image
                                  key={imgIndex}
                                  src={imageUrl}
                                  alt={`${item.title} - зображення ${imgIndex + 1}`}
                                  width={200}
                                  height={150}
                                  className={styles.image}
                                />
                              ))}
                            </div>
                          ) : showAllImages ? (
                            // Якщо showAllImages=true але немає зображень, не показуємо нічого
                            null
                          ) : noFallbackImages && !item.imageUrl ? (
                            // Якщо noFallbackImages=true і немає зображення, не показуємо нічого
                            null
                          ) : (
                            // Показуємо тільки перше зображення (як раніше)
                            <Image
                              src={item.imageUrl || galinfoLogo}
                              alt={item.title || 'GalInfo Logo'}
                              width={200}
                              height={150}
                              className={`${styles.image} ${!item.imageUrl ? styles.placeholderImage : ''}`}
                            />
                          )}
                        </>
                      )}
                      <div className={styles.textBlock}>
                        <p className={styles.itemTitle}>{item.title}</p>
                        <p className={styles.itemTime}>{item.data}</p>
                      </div>
                    </a>
                  ) : (
                    <>
                      {/* Показуємо зображення на мобільних для кожної новини при горизонтальному відображенні, або за параметром showImagesAt */}
                      {(shouldShowHorizontal || showImagesAt.includes(index)) && (
                        <>
                          {showAllImages && item.imageUrls && item.imageUrls.length > 0 ? (
                            // Показуємо всі доступні зображення (без fallback)
                            <div className={styles.imagesContainer}>
                              {item.imageUrls.map((imageUrl, imgIndex) => (
                                <Image
                                  key={imgIndex}
                                  src={imageUrl}
                                  alt={`${item.title} - зображення ${imgIndex + 1}`}
                                  width={200}
                                  height={150}
                                  className={styles.image}
                                />
                              ))}
                            </div>
                          ) : showAllImages ? (
                            // Якщо showAllImages=true але немає зображень, не показуємо нічого
                            null
                          ) : noFallbackImages && !item.imageUrl ? (
                            // Якщо noFallbackImages=true і немає зображення, не показуємо нічого
                            null
                          ) : (
                            // Показуємо тільки перше зображення (як раніше)
                            <Image
                              src={item.imageUrl || galinfoLogo}
                              alt={item.title || 'GalInfo Logo'}
                              width={200}
                              height={150}
                              className={`${styles.image} ${!item.imageUrl ? styles.placeholderImage : ''}`}
                            />
                          )}
                        </>
                      )}
                      <div className={styles.textBlock}>
                        <p className={styles.itemTitle}>{item.title}</p>
                        <p className={styles.itemTime}>{item.data}</p>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {showMoreButton && (
              <div className={styles.moreBtnWrapper}>
                <ViewAllButton
                  href={categoryId && getUrlFromCategoryId(categoryId) ? `/${getUrlFromCategoryId(categoryId)}` : (moreButtonUrl || '/all-news')}/>
              </div>
            )}
            {isMobile && showSeparator && (
              <div className={styles.separator}></div>
            )}
          </>
      }

    </div>
  );
}