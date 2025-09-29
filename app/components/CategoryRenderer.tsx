'use client';

import React from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useMobileContext } from '@/app/contexts/MobileContext';
import { getCategoryIdFromUrl, isRegionCategory as isRegionCategoryFromMapper, isSpecialThemeCategory } from '@/app/lib/categoryMapper';
import { useNewsByRubric } from '@/app/hooks/useNewsByRubric';
import { useNewsByRegion } from '@/app/hooks/useNewsByRegion';
import { useImportantNews } from '@/app/hooks/useImportantNews';
import { useLatestNews } from '@/app/hooks/useLatestNews';
import { useSpecialThemesNewsById } from '@/app/hooks/useSpecialThemesNews';
import { useNewsByTag } from '@/app/hooks';
import { getCategoryTitle } from '@/assets/utils/getTranslateCategory';
import { formatFullNewsDate, generateArticleUrl, getNewsImage, hasNewsPhoto } from '@/app/lib/newsUtils';
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
import { Pagination } from 'antd';
import banner3 from '@/assets/images/banner3.png';
import adBannerIndfomo from '@/assets/images/Ad Banner black.png';

interface CategoryRendererProps {
  category: string;
}

const CategoryRenderer: React.FC<CategoryRendererProps> = ({ category }) => {
  const { isMobile } = useMobileContext();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const pageParam = searchParams.get('page');
  const currentPage = Math.max(1, Number(pageParam) || 1);
  
  // Стан для тегу
  const [tagData, setTagData] = React.useState<{ id: number; tag: string } | null>(null);
  
  // Отримуємо categoryId з URL параметра
  const categoryId = getCategoryIdFromUrl(category);
  
  // Перевіряємо, чи це тег (якщо categoryId не знайдено, можливо це тег)
  const isTag = categoryId === null;
  
  // Визначаємо, чи це регіональна категорія
  const isRegion = categoryId !== null ? isRegionCategoryFromMapper(categoryId) : false;
  
  // Визначаємо, чи це категорія "all" (всі новини)
  const isAllCategory = categoryId === 0;
  
  // Визначаємо, чи це категорія "important" (важливі новини)
  const isImportantCategory = categoryId === -1;

  // Визначаємо, чи це спеціальна тема, яка має використовувати useSpecialThemesNews
  const isSpecialTheme = categoryId !== null && isSpecialThemeCategory(categoryId);
  
  // Завантажуємо дані тегу, якщо це тег
  React.useEffect(() => {
    if (isTag) {
      const fetchTagData = async () => {
        try {
          const response = await fetch(`/api/tags/by-name/${encodeURIComponent(category)}`);
          if (response.ok) {
            const data = await response.json();
            setTagData(data.tag);
          }
        } catch (error) {
          console.error('Error fetching tag data:', error);
        }
      };
      fetchTagData();
    }
  }, [isTag, category]);
  

  // Використовуємо відповідний хук для поточної категорії (запитуємо на 1 новину більше для вибору головної)
  const rubricHook = useNewsByRubric({
    rubric: categoryId?.toString() || '',
    page: currentPage,
    limit: 38, // Було 37: +1 для головної новини
    lang: '1',
    approved: true,
    type: undefined,
    autoFetch: categoryId !== null && !isRegion && !isAllCategory && !isSpecialTheme
  });

  // Хук для спеціальних тем (коли categoryId є одним із зазначених спеціальних ID)
  const specialThemeHook = useSpecialThemesNewsById(categoryId ?? 0, {
    page: currentPage,
    limit: 38, // Було 37: +1 для головної новини
    lang: '1',
    approved: true,
    autoFetch: categoryId !== null && isSpecialTheme
  });

  const regionHook = useNewsByRegion({
    region: categoryId?.toString() || '',
    page: currentPage,
    limit: 38, // Було 37: +1 для головної новини
    lang: '1',
    approved: true,
    type: undefined,
    autoFetch: categoryId !== null && isRegion
  });

  // Хук для всіх новин (коли categoryId = 0) - завантажуємо на 1 більше (58)
  const allNewsHook = useLatestNews({
    page: currentPage,
    limit: 58, // Було 57: +1 для головної новини
    lang: '1',
    autoFetch: isAllCategory
  });

  // Хук для важливих новин (коли categoryId = -1) - завантажуємо на 1 більше (58)
  const importantNewsCategoryHook = useImportantNews({
    limit: 58, // Було 57: +1 для головної новини
    lang: '1',
    autoFetch: isImportantCategory
  });

  // Хуки для тегів - завжди викликаємо, але з умовною логікою
  const tagNewsHook = useNewsByTag({
    tagId: isTag ? undefined : undefined, // Не передаємо tagId
    tagName: isTag ? category : 'dummy', // Для звичайних категорій передаємо dummy значення
    page: currentPage,
    limit: 38, // Було 37: +1 для головної новини
    lang: '1',
    autoFetch: isTag && Boolean(category) // Автозавантаження тільки для тегів
  });


  // Вибираємо дані з відповідного хука
  const currentCategoryData = isTag ? tagNewsHook.data :
                             isAllCategory ? allNewsHook.data : 
                             isImportantCategory ? { news: importantNewsCategoryHook.importantNews } : 
                             (isRegion ? regionHook.data : (isSpecialTheme ? specialThemeHook.data : rubricHook.data));
  const currentCategoryLoading = isTag ? tagNewsHook.loading :
                                isAllCategory ? allNewsHook.loading : 
                                isImportantCategory ? importantNewsCategoryHook.loading : 
                                (isRegion ? regionHook.loading : (isSpecialTheme ? specialThemeHook.loading : rubricHook.loading));
  const currentCategoryError = isTag ? tagNewsHook.error :
                              isAllCategory ? allNewsHook.error : 
                              isImportantCategory ? importantNewsCategoryHook.error : 
                              (isRegion ? regionHook.error : (isSpecialTheme ? specialThemeHook.error : rubricHook.error));

  // Трансформуємо дані для поточної категорії (37 новин для звичайних категорій, 57 для "all" та "important")
  const transformedCurrentCategoryData = currentCategoryData?.news?.filter(item => item && item.id)?.map(item => ({
    id: item.id.toString(),
    title: item.nheader,
    date: formatFullNewsDate(item.ndate, item.ntime),
    url: generateArticleUrl(item as any),
    imageUrl: getNewsImage(item as any, 'full'),
    imageAlt: item.nheader,
    isImportant: item.ntype === 1 || (item as any).nweight > 0,
    important: (item as any).nweight > 0, // Додаємо поле important для ColumnNews
    nweight: (item as any).nweight || 0,
    summary: (item as any).nteaser || (item as any).nsubheader || '',
    hasPhoto: hasNewsPhoto(item)
  })) || [];

  // Використовуємо оригінальний порядок новин (за датою)
  const sortedCurrentCategoryData = transformedCurrentCategoryData;

  // Дані пагінації (якщо доступні з API)
  const paginationData = isTag ? tagNewsHook.data?.pagination :
                        isAllCategory ? allNewsHook.data?.pagination :
                        isImportantCategory ? undefined :
                        (isRegion ? regionHook.data?.pagination : (isSpecialTheme ? specialThemeHook.data?.pagination : rubricHook.data?.pagination));

  const totalItems = paginationData?.total || 0;
  const pageSize = paginationData?.limit || (isAllCategory ? 58 : 38);
  const totalPages = paginationData?.totalPages || 0;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Функція для отримання головної новини (пріоритет: nweight > 0 з фото → будь-яка з фото)
  const getMainNewsItem = () => {
    let mainNewsItem = null;

    // Шукаємо першу новину з фото та nweight > 0 з оригінального масиву (за датою)
    if (isAllCategory && allNewsHook.data?.news && allNewsHook.data.news.length > 0) {
      const importantNewsWithPhoto = allNewsHook.data.news.find(news =>
        hasNewsPhoto(news) && (news as any).nweight > 0
      );
      if (importantNewsWithPhoto) {
        mainNewsItem = {
          id: importantNewsWithPhoto.id.toString(),
          title: importantNewsWithPhoto.nheader,
          date: formatFullNewsDate(importantNewsWithPhoto.ndate, importantNewsWithPhoto.ntime),
          time: importantNewsWithPhoto.ntime,
          url: generateArticleUrl(importantNewsWithPhoto as any),
          imageUrl: getNewsImage(importantNewsWithPhoto as any, 'full'),
          imageAlt: importantNewsWithPhoto.nheader
        };
      } else {
        // Якщо немає важливих новин з фото, шукаємо будь-яку новину з фото
        const newsWithPhoto = allNewsHook.data.news.find(news => hasNewsPhoto(news));
        if (newsWithPhoto) {
          mainNewsItem = {
            id: newsWithPhoto.id.toString(),
            title: newsWithPhoto.nheader,
            date: formatFullNewsDate(newsWithPhoto.ndate, newsWithPhoto.ntime),
            time: newsWithPhoto.ntime,
            url: generateArticleUrl(newsWithPhoto as any),
            imageUrl: getNewsImage(newsWithPhoto as any, 'full'),
            imageAlt: newsWithPhoto.nheader
          };
        }
      }
    } else if (isImportantCategory && importantNewsCategoryHook.importantNews && importantNewsCategoryHook.importantNews.length > 0) {
      const importantNewsWithPhoto = importantNewsCategoryHook.importantNews.find(news =>
        hasNewsPhoto(news) && (news as any).nweight > 0
      );
      if (importantNewsWithPhoto) {
        mainNewsItem = {
          id: importantNewsWithPhoto.id.toString(),
          title: importantNewsWithPhoto.nheader,
          date: formatFullNewsDate(importantNewsWithPhoto.ndate, importantNewsWithPhoto.ntime),
          time: importantNewsWithPhoto.ntime,
          url: generateArticleUrl(importantNewsWithPhoto as any),
          imageUrl: getNewsImage(importantNewsWithPhoto as any, 'full'),
          imageAlt: importantNewsWithPhoto.nheader
        };
      } else {
        // Якщо немає важливих новин з фото, шукаємо будь-яку новину з фото
        const newsWithPhoto = importantNewsCategoryHook.importantNews.find(news => hasNewsPhoto(news));
        if (newsWithPhoto) {
          mainNewsItem = {
            id: newsWithPhoto.id.toString(),
            title: newsWithPhoto.nheader,
            date: formatFullNewsDate(newsWithPhoto.ndate, newsWithPhoto.ntime),
            time: newsWithPhoto.ntime,
            url: generateArticleUrl(newsWithPhoto as any),
            imageUrl: getNewsImage(newsWithPhoto as any, 'full'),
            imageAlt: newsWithPhoto.nheader
          };
        }
      }
    } else {
      // Для інших категорій: nweight > 0 → будь-яка з фото
      const importantNewsWithPhoto = sortedCurrentCategoryData.find(news => 
        news.hasPhoto && news.nweight > 0
      );
      if (importantNewsWithPhoto) {
        mainNewsItem = importantNewsWithPhoto;
      } else {
        const newsWithPhoto = sortedCurrentCategoryData.find(news => news.hasPhoto);
        if (newsWithPhoto) {
          mainNewsItem = newsWithPhoto;
        }
      }
    }

    // Fallback до першої новини (навіть без фото)
    if (!mainNewsItem) {
      if (isAllCategory && allNewsHook.data?.news && allNewsHook.data.news.length > 0) {
        const firstNews = allNewsHook.data.news[0];
        mainNewsItem = {
          id: firstNews.id.toString(),
          title: firstNews.nheader,
          date: formatFullNewsDate(firstNews.ndate, firstNews.ntime),
          time: firstNews.ntime,
          url: generateArticleUrl(firstNews as any),
          imageUrl: getNewsImage(firstNews as any, 'full'),
          imageAlt: firstNews.nheader
        };
      } else if (isImportantCategory && importantNewsCategoryHook.importantNews && importantNewsCategoryHook.importantNews.length > 0) {
        const firstNews = importantNewsCategoryHook.importantNews[0];
        mainNewsItem = {
          id: firstNews.id.toString(),
          title: firstNews.nheader,
          date: formatFullNewsDate(firstNews.ndate, firstNews.ntime),
          time: firstNews.ntime,
          url: generateArticleUrl(firstNews as any),
          imageUrl: getNewsImage(firstNews as any, 'full'),
          imageAlt: firstNews.nheader
        };
      } else if (sortedCurrentCategoryData.length > 0) {
        // Використовуємо першу новину з масиву
        mainNewsItem = sortedCurrentCategoryData[0];
      }
    }

    return mainNewsItem;
  };

  // Отримуємо головну новину один раз
  const mainNewsItem = getMainNewsItem();
  const mainNewsId = mainNewsItem?.id || null;

  // Функція для отримання новин без головної новини
  const getNewsWithoutMain = () => {
    if (!mainNewsId) return sortedCurrentCategoryData;
    return sortedCurrentCategoryData.filter(news => news.id !== mainNewsId);
  };

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
        const breadcrumbTitle = isTag ? (tagData?.tag || category) : getCategoryTitle(category);
        return (
          <Breadcrumbs 
            key={index}
            items={[
              { label: 'ГОЛОВНА', href: '/' },
              { label: breadcrumbTitle.toUpperCase() }
            ]} 
          />
        );

      case 'CATEGORY_TITLE':
        const categoryTitle = isTag ? (tagData?.tag || category) : getCategoryTitle(category);
        return (
          <CategoryTitle
            key={index}
            title={categoryTitle}
            className={styles[config.className]}
          />
        );

      case 'MAIN_NEWS':
        // Показуємо скелетон лоадинг якщо дані завантажуються або немає новин
        if (currentCategoryLoading || !mainNewsItem) {
          return (
            <MainNews
              key={index}
              isLoading={true}
              className={styles[config.className]}
            />
          );
        }

        return (
          <MainNews
            key={index}
            title={mainNewsItem.title}
            date={mainNewsItem.date}
            url={mainNewsItem.url}
            imageUrl={mainNewsItem.imageUrl || config.imageUrl}
            imageAlt={mainNewsItem.title}
            className={styles[config.className]}
          />
        );

      case 'CATEGORY_NEWS':
        // Отримуємо новини за діапазоном з єдиного набору (виключаючи головну новину)
        const categoryNewsRange = config.newsRange;
        const filteredCategoryNews = getNewsWithoutMain();
        const categoryNewsData = categoryNewsRange
          ? filteredCategoryNews.slice(categoryNewsRange.start - 1, categoryNewsRange.end)
          : filteredCategoryNews.slice(0, 8); // fallback до перших 8 новин
        const isCategoryNewsLoading = currentCategoryLoading;

        // Не рендеримо компонент, якщо новин менше 1 (не завантажуємо)
        if (!isCategoryNewsLoading && categoryNewsData.length < 1) {
          return null;
        }

        return (
          <CategoryNews
            key={index}
            isLoading={isCategoryNewsLoading}
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
        // Отримуємо новини за діапазоном з єдиного набору (виключаючи головну новину)
        const columnNewsRange = config.newsRange;
        const filteredColumnNews = getNewsWithoutMain();
        const columnNewsData = columnNewsRange 
          ? filteredColumnNews.slice(columnNewsRange.start - 1, columnNewsRange.end)
          : filteredColumnNews.slice(0, config.newsQuantity || 5); // fallback
        
        // Не рендеримо компонент, якщо новин менше 1 (не завантажуємо)
        if (!currentCategoryLoading && columnNewsData.length < 1) {
          return null;
        }
        
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
        
        // Для категорії "all" та "important" передаємо останні 20 новин (виключаючи головну новину)
        if (isAllCategory || isImportantCategory) {
          const filteredAllNews = getNewsWithoutMain();
          const allNewsData = filteredAllNews.slice(37, 57); // Останні 20 новин з 57
          
          // Не рендеримо компонент, якщо новин менше 1 (не завантажуємо)
          if (!currentCategoryLoading && allNewsData.length < 1) {
            return null;
          }
          
          return (
            <AllNews
              key={index}
              customTitle={config.customTitle || "Більше новин"}
              news={allNewsData}
              hideHeader={false}
              footer={(totalPages > 1) ? (
                <Pagination
                  current={currentPage}
                  total={totalItems}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  hideOnSinglePage
                  showLessItems
                />
              ) : null}
            />
          );
        }
        // Для інших категорій використовуємо стандартну логіку
        return (
          <AllNews
            key={index}
            customTitle={config.customTitle}
            footer={(totalPages > 1) ? (
              <Pagination
                current={currentPage}
                total={totalItems}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                hideOnSinglePage
                showLessItems
              />
            ) : null}
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
