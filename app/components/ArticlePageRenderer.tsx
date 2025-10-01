'use client';

import React, {useRef} from 'react';
import {Carousel, Skeleton} from 'antd';
import { useState, useEffect } from "react";
import { useMobileContext } from '@/app/contexts/MobileContext';
import { useLatestNews } from '@/app/hooks/useLatestNews';
import { useImportantNews } from '@/app/hooks/useImportantNews';
import { useTemplateSchemas } from '@/app/hooks/useTemplateSchemas';
import {
  formatFullNewsDate,
  generateArticleUrl,
  getNewsImage,
  getUniversalNewsImage,
  getImageFromImageData
} from '@/app/lib/newsUtils';
import { highlightUrlsInHtml } from '@/app/lib/urlUtils';
import { articlePageDesktopSchema, articlePageMobileSchema } from '@/app/lib/articlePageSchema';
import placeholderImage from '@/assets/images/Gal-info logo v13.png';

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
import roundArrowRight from "@/assets/icons/roundArrowRight.svg";
import roundArrowLeft from "@/assets/icons/roundArrowLeft.svg";
import closeIcon from "@/assets/icons/closeIcon.svg";

interface ArticlePageRendererProps {
  article: any;
  loading: boolean;
}

// Компонент для зображення з автоматичним визначенням орієнтації
const SmartImage: React.FC<{
  src: string | any;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  onClick?: () => void;
}> = ({ src, alt, width, height, priority, onClick }) => {
  const [imageOrientation, setImageOrientation] = useState<'horizontal' | 'vertical' | null>(null);

  useEffect(() => {
    const img = document.createElement('img');
    img.onload = () => {
      const isHorizontal = img.naturalWidth > img.naturalHeight;
      setImageOrientation(isHorizontal ? 'horizontal' : 'vertical');
    };
    img.src = typeof src === 'string' ? src : src.src || '';
  }, [src]);

  const getImageClassName = () => {
    const baseClass = styles.mainImage;
    if (imageOrientation === 'horizontal') {
      return `${baseClass} ${styles.mainImageHorizontal}`;
    } else if (imageOrientation === 'vertical') {
      return `${baseClass} ${styles.mainImageVertical}`;
    }
    return baseClass;
  };

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={getImageClassName()}
      priority={priority}
      onClick={onClick}
    />
  );
};

const parseNbody = (nbody: string) => {
  const regex = /\{\{([\d,]+)\}\}/g;
  let lastIndex = 0;
  const blocks: { type: 'text' | 'images'; content: string | number[] }[] = [];
  let match;

  while ((match = regex.exec(nbody)) !== null) {
    const indexStart = match.index;

    if (indexStart > lastIndex) {
      blocks.push({ type: 'text', content: nbody.slice(lastIndex, indexStart) });
    }

    const indices = match[1].split(',').map(num => parseInt(num.trim(), 10) - 1); // -1 для 0-based
    blocks.push({ type: 'images', content: indices });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < nbody.length) {
    blocks.push({ type: 'text', content: nbody.slice(lastIndex) });
  }

  return blocks;
};

const ArticlePageRenderer: React.FC<ArticlePageRendererProps> = ({ article, loading }) => {
  const [allImages, setAllImages] = useState<string[]>([]);
  const [isShowCarousel, setIsShowCarousel] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [modalImages, setModalImages] = useState<string[] | null>(null);
  const [currentMainImageIndex, setCurrentMainImageIndex] = useState<number>(0);

  const carouselRef = useRef<any>(null);
  const { isMobile } = useMobileContext();
  const { getSchema } = useTemplateSchemas();

  // Handle Escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isShowCarousel) {
        setIsShowCarousel(false);
        setModalImages(null);
      }
    };

    if (isShowCarousel) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isShowCarousel]);

  React.useEffect(() => {
    if (!article?.images_data || !article?.images) return;

    // Отримуємо масив ID зображень з article.images (comma-separated string)
    const imageIds = article.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
    
    // Створюємо масив URL в правильному порядку
    const urls: string[] = imageIds
      .map((imageId: number) => {
        const img = article.images_data.find((imgData: any) => imgData.id === imageId);
        return img ? getImageFromImageData(img, 'full') : null;
      })
      .filter((u: string | null): u is string => Boolean(u));

    setAllImages(urls);
  }, [article]);

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
    date: formatFullNewsDate(item.ndate, item.ntime),
    url: generateArticleUrl(item as any),
    imageUrl: getNewsImage(item as any),
    imageAlt: item.nheader,
    isImportant: item.ntype === 1 || (item as any).nweight > 0,
    important: (item as any).nweight > 0, // Додаємо поле important для ColumnNews
    nweight: (item as any).nweight || 0,
    summary: (item as any).nteaser || (item as any).nsubheader || ''
  })) || [];

  // Трансформуємо дані для важливих новин
  const transformedImportantNews = importantNewsHook.importantNews?.filter(item => item && item.id)?.map(item => ({
    id: item.id.toString(),
    title: item.nheader,
    date: formatFullNewsDate(item.ndate, item.ntime),
    url: generateArticleUrl(item as any),
    imageUrl: getNewsImage(item as any),
    imageAlt: item.nheader,
    isImportant: item.ntype === 1 || (item as any).nweight > 0,
    important: (item as any).nweight > 0, // Додаємо поле important для ColumnNews
    nweight: (item as any).nweight || 0,
    summary: (item as any).nteaser || (item as any).nsubheader || ''
  })) || [];

  // Локальна галерея для групи зображень (відповідає одному плейсхолдеру у nbody)
  const ImageGroupGallery: React.FC<{
    zeroBasedIndexes: number[];
    groupKey: string;
  }> = ({ zeroBasedIndexes, groupKey }) => {
    const [activeZeroBasedIndex, setActiveZeroBasedIndex] = useState<number>(
      zeroBasedIndexes?.[0] ?? 0
    );

    // Отримуємо масив ID зображень з article.images (comma-separated string)
    const imageIds = article?.images ? article.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)) : [];

    const getUrlByZeroBased = (zeroBasedIndex: number) => {
      const imageId = imageIds[zeroBasedIndex];
      if (!imageId) return undefined;
      
      // Знаходимо відповідне зображення в images_data за ID
      const img = article?.images_data?.find((imgData: any) => imgData.id === imageId);
      return img ? getImageFromImageData(img, 'full') : undefined;
    };

    const activeUrl = getUrlByZeroBased(activeZeroBasedIndex) ?? placeholderImage;
    const activeImageId = imageIds[activeZeroBasedIndex];
    const activeImg = article?.images_data?.find((imgData: any) => imgData.id === activeImageId);
    const activeTitle = activeImg?.title;

    return (
      <div key={`${groupKey}-gallery`} className={styles.articleImage}>
        <div className={styles.imageContainer}>
          <SmartImage
            src={activeUrl}
            alt={activeTitle || 'Image'}
            width={800}
            height={500}
            priority={true}
            onClick={() => {
              // Відкриваємо модалку з ВСІМА фото статті
              setModalImages(null); // null означає використовувати allImages
              // Знаходимо позицію поточного зображення в загальному масиві
              const imageIds = article?.images ? article.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)) : [];
              const globalIndex = imageIds.indexOf(imageIds[activeZeroBasedIndex]);
              setStartIndex(Math.max(0, globalIndex));
              setIsShowCarousel(true);
            }}
          />
          {zeroBasedIndexes.length > 1 && (
            <>
              <button 
                onClick={() => {
                  const currentIndex = zeroBasedIndexes.indexOf(activeZeroBasedIndex);
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : zeroBasedIndexes.length - 1;
                  setActiveZeroBasedIndex(zeroBasedIndexes[prevIndex]);
                }}
                className={styles.imageNavButtonLeft}
              >
                <Image src={roundArrowLeft} alt="Previous" width={44} height={44} />
              </button>
              <button 
                onClick={() => {
                  const currentIndex = zeroBasedIndexes.indexOf(activeZeroBasedIndex);
                  const nextIndex = currentIndex < zeroBasedIndexes.length - 1 ? currentIndex + 1 : 0;
                  setActiveZeroBasedIndex(zeroBasedIndexes[nextIndex]);
                }}
                className={styles.imageNavButtonRight}
              >
                <Image src={roundArrowRight} alt="Next" width={44} height={44} />
              </button>
            </>
          )}
        </div>
        {(activeTitle || null) && (
          <div className={styles.imageCredits}>{activeTitle}</div>
        )}
        {zeroBasedIndexes.length > 1 && (
          <div className={styles.galleryThumbs}>
            {zeroBasedIndexes.map((zeroBasedIdx: number, tIdx: number) => {
              const url = getUrlByZeroBased(zeroBasedIdx);
              if (!url) return null;
              const isActive = zeroBasedIdx === activeZeroBasedIndex;
              return (
                <img
                  key={`thumb-${groupKey}-${tIdx}`}
                  src={url}
                  alt={(() => {
                    const imgId = imageIds[zeroBasedIdx];
                    const img = article?.images_data?.find((imgData: any) => imgData.id === imgId);
                    return img?.title || 'thumb';
                  })()}
                  className={`${styles.galleryThumb} ${isActive ? styles.galleryThumbActive : ''}`}
                  onClick={() => setActiveZeroBasedIndex(zeroBasedIdx)}
                  loading="lazy"
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

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
                (item: { title: string; link: string }, breadcrumbIndex: number, arr: any[]) => {
                  if (breadcrumbIndex === arr.length - 1) {
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

      case 'ARTICLE_CONTENT':
        if (loading) {
          return (
            <div key={index} className={styles.articleImage}>
              <Skeleton.Input style={{ width: '100%', height: 400, marginBottom: 24 }} active />
            </div>
          );
        }

        // Якщо масив зображень відсутній або порожній — лише текст
        if(!article?.images_data || article?.images_data.length === 0) {
          return (
            <div
              key={index}
              className={styles.paragraph}
              dangerouslySetInnerHTML={{__html: highlightUrlsInHtml(article?.nbody || '')}}
            />
          )
        } else if (article?.images_data?.length === 1) {
          const imageUrl = getUniversalNewsImage(article, 'full') || getUniversalNewsImage(article);
          return (
            <>
              <div key={`${index}-image`} className={styles.articleImage}>
                <SmartImage
                  src={imageUrl ?? placeholderImage}
                  alt={imageUrl || 'Article image'}
                  width={800}
                  height={500}
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
              <div
                key={`${index}-content`}
                className={styles.paragraph}
                dangerouslySetInnerHTML={{__html: highlightUrlsInHtml(article?.nbody || '')}}
              />
            </>

          )
            ;
        } else {
          const blocks = parseNbody(article?.nbody || '');
          const imageBlocks = blocks.filter((b: any) => b.type === 'images');

          // Якщо немає плейсхолдерів-індексів у nbody — повертаємось до дефолтного відображення: перше фото + весь текст
          if (!imageBlocks.length) {
            // Отримуємо масив зображень з article.images
            const imageIds = article?.images ? article.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)) : [];
            const currentImageId = imageIds[currentMainImageIndex];
            const currentImg = currentImageId ? article?.images_data?.find((imgData: any) => imgData.id === currentImageId) : null;
            const currentImageUrl = currentImg ? getImageFromImageData(currentImg, 'full') : undefined;
            
            return (
              <>
                {currentImageUrl && (
                  <div key={`${index}-image`} className={styles.articleImage}>
                    <div className={styles.imageContainer}>
                      <SmartImage
                        src={currentImageUrl ?? placeholderImage}
                        alt={currentImg?.title || 'Article image'}
                        width={800}
                        height={500}
                        priority={true}
                        onClick={() => {
                          setModalImages(null); // null означає використовувати allImages
                          setStartIndex(currentMainImageIndex);
                          setIsShowCarousel(true);
                        }}
                      />
                      {imageIds.length > 1 && (
                        <>
                          <button 
                            onClick={() => {
                              setCurrentMainImageIndex(prev => 
                                prev > 0 ? prev - 1 : imageIds.length - 1
                              );
                            }}
                            className={styles.imageNavButtonLeft}
                          >
                            <Image src={roundArrowLeft} alt="Previous" width={44} height={44} />
                          </button>
                          <button 
                            onClick={() => {
                              setCurrentMainImageIndex(prev => 
                                prev < imageIds.length - 1 ? prev + 1 : 0
                              );
                            }}
                            className={styles.imageNavButtonRight}
                          >
                            <Image src={roundArrowRight} alt="Next" width={44} height={44} />
                          </button>
                        </>
                      )}
                    </div>
                    <div className={styles.imageCredits}>
                      {currentImg?.title && (
                        <span className={styles.photoCredit}>
                          {currentImg?.title}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div
                  key={`${index}-content`}
                  className={styles.paragraph}
                  dangerouslySetInnerHTML={{ __html: highlightUrlsInHtml(article?.nbody || '') }}
                />

                {isShowCarousel && (
                  <div
                    className={styles.backDrop}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setIsShowCarousel(false);
                        setModalImages(null);
                      }
                    }}
                  >
                    <div className={styles.carouselBox}>
                      <button 
                        onClick={() => {
                          setIsShowCarousel(false);
                          setModalImages(null);
                        }} 
                        className={styles.closeButton}
                      >
                        <Image src={closeIcon} alt="Close" width={44} height={44} />
                      </button>
                      <Carousel ref={carouselRef} dots={false} initialSlide={startIndex}>
                        {(modalImages ?? allImages).map((url, idx) => (
                          <div key={idx} className={styles.carouselItem}>
                            <img alt={'img'} src={url} loading="lazy" />
                          </div>
                        ))}
                      </Carousel>
                      <button onClick={() => carouselRef.current?.next()} className={styles.rightArrowButton}>
                        <Image src={roundArrowRight} alt="Right arrow" width={44} height={44} />
                      </button>
                      <button onClick={() => carouselRef.current?.prev()} className={styles.leftArrowButton}>
                        <Image src={roundArrowLeft} alt="Left arrow" width={44} height={44} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          }

          // Є плейсхолдери — рендеримо контент послідовно: текстові блоки та групові галереї зображень
          return (
            <>
              {blocks.map((b: any, bIdx: number) => {
                if (b.type === 'text') {
                  return (
                    <div
                      key={`${index}-text-${bIdx}`}
                      className={styles.paragraph}
                      dangerouslySetInnerHTML={{ __html: highlightUrlsInHtml(b.content as string) }}
                    />
                  );
                }
                // images
                const group = b.content as number[];
                return (
                  <ImageGroupGallery
                    key={`${index}-imgs-${bIdx}`}
                    zeroBasedIndexes={group}
                    groupKey={`${index}-${bIdx}`}
                  />
                );
              })}

              {isShowCarousel && (
                <div
                  className={styles.backDrop}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsShowCarousel(false);
                      setModalImages(null);
                    }
                  }}
                >
                  <div className={styles.carouselBox}>
                    <button 
                      onClick={() => {
                        setIsShowCarousel(false);
                        setModalImages(null);
                      }} 
                      className={styles.closeButton}
                    >
                      <Image src={closeIcon} alt="Close" width={44} height={44} />
                    </button>
                    <Carousel ref={carouselRef} dots={false} initialSlide={startIndex}>
                      {(modalImages ?? allImages).map((url, idx) => (
                        <div key={idx} className={styles.carouselItem}>
                          <img alt={'img'} src={url} loading="lazy" />
                        </div>
                      ))}
                    </Carousel>
                    <button onClick={() => carouselRef.current?.next()} className={styles.rightArrowButton}>
                      <Image src={roundArrowRight} alt="Right arrow" width={44} height={44} />
                    </button>
                    <button onClick={() => carouselRef.current?.prev()} className={styles.leftArrowButton}>
                      <Image src={roundArrowLeft} alt="Left arrow" width={44} height={44} />
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        }

      case 'ARTICLE_TAGS':
        if (loading) {
          return (
            <div key={index} className={styles.articleMetadata}>
              <Skeleton.Input
                active
                style={{width: 120, height: 20, marginTop: 16}}
              />
            </div>
          );
        }

        return (
          <div key={index} className={styles.articleMetadata}>
            <div className={styles.tags}>
              {article?.tags?.map((tag: any, index: number) => (
                <a
                  key={tag.id || index}
                  href={`/tags/${encodeURIComponent(tag.tag)}`}
                  className={styles.tag}
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/tags/${encodeURIComponent(tag.tag)}`;
                  }}
                >
                  {tag.tag}
                </a>
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
            isMobile={isMobile}
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
            {block.children?.map((child: any, childIndex: number) => (
              <React.Fragment key={`${index}-${childIndex}`}>
                {renderBlock(child, childIndex)}
              </React.Fragment>
            ))}
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

  // Отримуємо схему з API (якщо є)
  const apiArticleDesktopSchema = getSchema('article-desktop');
  const apiArticleMobileSchema = getSchema('article-mobile');
  
  // Вибираємо схему залежно від пристрою
  // Пріоритет: API schema -> дефолтний schema
  const defaultSchema = isMobile ? articlePageMobileSchema : articlePageDesktopSchema;
  const apiSchema = isMobile ? apiArticleMobileSchema : apiArticleDesktopSchema;
  const schema = apiSchema || defaultSchema;

  // Перевіряємо наявність схеми та blocks
  if (!schema || !schema.blocks) {
    return null;
  }

  return (
    <>
      <div className={styles.container}>
        {/* Основний контент - ліва частина */}
        <div className={styles.mainContent}>
          {schema.blocks.map((block: any, index: number) => (
            <React.Fragment key={`main-${index}`}>
              {renderBlock(block, index)}
            </React.Fragment>
          ))}
        </div>

        {/* Бокова панель для десктопу */}
        {!isMobile && (schema as any).sidebar && (
          <div className={styles.sidebar}>
            {(schema as any).sidebar.blocks.map((block: any, index: number) => (
              <React.Fragment key={`sidebar-${index}`}>
                {renderBlock(block, index)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Футер (ТОП НОВИНИ на всю ширину екрана) */}
      {(schema as any).footer && (
        <div className={styles.containerAllNews}>
          {(schema as any).footer.blocks.map((block: any, index: number) => (
            <React.Fragment key={`footer-${index}`}>
              {renderBlock(block, index)}
            </React.Fragment>
          ))}
        </div>
      )}

    </>
  );
};

export default ArticlePageRenderer;
