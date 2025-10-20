'use client';

import React from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useMobileContext } from '@/app/contexts/MobileContext';
import { useMenuContext } from '@/app/contexts/MenuContext';
import { getCategoryIdFromUrl, isRegionCategory as isRegionCategoryFromMapper, isSpecialThemeCategory } from '@/app/lib/categoryMapper';
import { getCategoryType, getCategoryFromMenuData } from '@/app/lib/categoryUtils';
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
import AdImage from "@/app/components/AdImage";
import Image from "next/image";
import styles from "../[category]/page.module.css";
import { Pagination } from 'antd';
import adBannerIndfomo from '@/assets/images/Ad Banner black.png';
import { filterSidebarCategoryBlocks } from '@/app/lib/sidebarUtils';

interface CategoryRendererProps {
  category: string;
  apiDesktopSchema?: any;
  apiMobileSchema?: any;
}

const CategoryRenderer: React.FC<CategoryRendererProps> = ({ 
  category,
  apiDesktopSchema,
  apiMobileSchema 
}) => {
  const { isMobile } = useMobileContext();
  const { menuData, loading: menuLoading } = useMenuContext();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const pageParam = searchParams.get('page');
  const currentPage = Math.max(1, Number(pageParam) || 1);
  
  // Стан для тегу
  const [tagData, setTagData] = React.useState<{ id: number; tag: string } | null>(null);
  
  // ВАЖЛИВО: Чекаємо завантаження menuData перед визначенням типу категорії
  // Визначаємо тип категорії динамічно через menuData (тільки якщо menuData завантажилося)
  const categoryType = !menuLoading ? getCategoryType(category, menuData) : undefined;
  
  // Отримуємо categoryId з URL параметра (спочатку з menuData, потім статично)
  const categoryFromMenu = !menuLoading ? getCategoryFromMenuData(category, menuData) : null;
  const categoryId = categoryFromMenu?.id ?? getCategoryIdFromUrl(category, menuData);
  
  // Перевіряємо, чи це тег: тільки якщо menuData завантажилося і не знайдено ні в menuData, ні в статичному маппері
  const isTag = categoryType !== undefined && categoryType === null && categoryId === null;
  
  // Визначаємо, чи це регіональна категорія (через categoryType або fallback до статичного маппера)
  const isRegion = categoryType === 'region' || (categoryId !== null ? isRegionCategoryFromMapper(categoryId) : false);
  
  // Визначаємо, чи це категорія "all" (всі новини)
  const isAllCategory = categoryId === 0;
  
  // Визначаємо, чи це категорія "important" (важливі новини)
  const isImportantCategory = categoryId === -1;
  
  // Визначаємо, чи це категорія "news" (новини)
  const isNewsCategory = categoryId === -2;
  
  // Визначаємо, чи це категорія "articles" (статті)
  const isArticlesCategory = categoryId === -3;

  // Визначаємо, чи це спеціальна тема (через categoryType або fallback до статичного маппера)
  const isSpecialTheme = categoryType === 'special' || (categoryId !== null && isSpecialThemeCategory(categoryId));
  
  // DEBUG: виводимо інформацію про категорію
  React.useEffect(() => {
    console.log(`[CategoryRenderer] Category: ${category}`, {
      menuLoading,
      categoryType: categoryType || 'undefined (ще завантажується)',
      categoryId,
      isTag,
      isRegion,
      isSpecialTheme
    });
  }, [category, categoryType, categoryId, isTag, isRegion, isSpecialTheme, menuLoading]);
  
  // Завантажуємо дані тегу, тільки якщо menuData завантажилося і це точно тег
  React.useEffect(() => {
    // Чекаємо завантаження menuData перед визначенням тегу
    if (menuLoading) {
      return;
    }
    
    // Тепер можна перевірити чи це тег
    if (isTag && !tagData) {
      const fetchTagData = async () => {
        try {
          console.log(`[CategoryRenderer] Fetching tag data for: ${category}`);
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
  }, [isTag, category, menuLoading, tagData]);
  

  // Використовуємо відповідний хук для поточної категорії (запитуємо на 1 новину більше для вибору головної)
  const rubricHook = useNewsByRubric({
    rubric: categoryId?.toString() || '',
    page: currentPage,
    limit: 38, // Було 37: +1 для головної новини
    lang: '1',
    approved: true,
    type: isNewsCategory ? '1' : isArticlesCategory ? '2' : undefined,
    autoFetch: categoryId !== null && !isRegion && !isAllCategory && !isSpecialTheme && !isNewsCategory && !isArticlesCategory
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

  // Хук для новин (коли categoryId = -2) - використовуємо useLatestNews з фільтром по типу
  const newsCategoryHook = useLatestNews({
    page: currentPage,
    limit: 58, // +1 для головної новини (як для all)
    lang: '1',
    type: '1', // ntype = 1 для новин
    autoFetch: isNewsCategory
  });

  // Хук для статей (коли categoryId = -3) - використовуємо useLatestNews з фільтром по типу
  const articlesCategoryHook = useLatestNews({
    page: currentPage,
    limit: 58, // +1 для головної новини (як для all)
    lang: '1',
    type: '2', // ntype = 2 для статей
    autoFetch: isArticlesCategory
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
                             isNewsCategory ? newsCategoryHook.data :
                             isArticlesCategory ? articlesCategoryHook.data :
                             (isRegion ? regionHook.data : (isSpecialTheme ? specialThemeHook.data : rubricHook.data));
  const currentCategoryLoading = isTag ? tagNewsHook.loading :
                                isAllCategory ? allNewsHook.loading : 
                                isImportantCategory ? importantNewsCategoryHook.loading : 
                                isNewsCategory ? newsCategoryHook.loading :
                                isArticlesCategory ? articlesCategoryHook.loading :
                                (isRegion ? regionHook.loading : (isSpecialTheme ? specialThemeHook.loading : rubricHook.loading));
  const currentCategoryError = isTag ? tagNewsHook.error :
                              isAllCategory ? allNewsHook.error : 
                              isImportantCategory ? importantNewsCategoryHook.error : 
                              isNewsCategory ? newsCategoryHook.error :
                              isArticlesCategory ? articlesCategoryHook.error :
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
                        isNewsCategory ? newsCategoryHook.data?.pagination :
                        isArticlesCategory ? articlesCategoryHook.data?.pagination :
                        (isRegion ? regionHook.data?.pagination : (isSpecialTheme ? specialThemeHook.data?.pagination : rubricHook.data?.pagination));

  const totalItems = paginationData?.total || 0;
  const pageSize = paginationData?.limit || (isAllCategory || isImportantCategory ? 58 : 38);
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
    } else if (isNewsCategory && newsCategoryHook.data?.news && newsCategoryHook.data.news.length > 0) {
      // Шукаємо першу новину з фото та nweight > 0 з оригінального масиву (за датою)
      const importantNewsWithPhoto = newsCategoryHook.data.news.find(news =>
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
        const newsWithPhoto = newsCategoryHook.data.news.find(news => hasNewsPhoto(news));
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
    } else if (isArticlesCategory && articlesCategoryHook.data?.news && articlesCategoryHook.data.news.length > 0) {
      // Шукаємо першу статтю з фото та nweight > 0 з оригінального масиву (за датою)
      const importantArticleWithPhoto = articlesCategoryHook.data.news.find(news =>
        hasNewsPhoto(news) && (news as any).nweight > 0
      );
      if (importantArticleWithPhoto) {
        mainNewsItem = {
          id: importantArticleWithPhoto.id.toString(),
          title: importantArticleWithPhoto.nheader,
          date: formatFullNewsDate(importantArticleWithPhoto.ndate, importantArticleWithPhoto.ntime),
          time: importantArticleWithPhoto.ntime,
          url: generateArticleUrl(importantArticleWithPhoto as any),
          imageUrl: getNewsImage(importantArticleWithPhoto as any, 'full'),
          imageAlt: importantArticleWithPhoto.nheader
        };
      } else {
        // Якщо немає важливих статей з фото, шукаємо будь-яку статтю з фото
        const articleWithPhoto = articlesCategoryHook.data.news.find(news => hasNewsPhoto(news));
        if (articleWithPhoto) {
          mainNewsItem = {
            id: articleWithPhoto.id.toString(),
            title: articleWithPhoto.nheader,
            date: formatFullNewsDate(articleWithPhoto.ndate, articleWithPhoto.ntime),
            time: articleWithPhoto.ntime,
            url: generateArticleUrl(articleWithPhoto as any),
            imageUrl: getNewsImage(articleWithPhoto as any, 'full'),
            imageAlt: articleWithPhoto.nheader
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
      } else if (isNewsCategory && newsCategoryHook.data?.news && newsCategoryHook.data.news.length > 0) {
        const firstNews = newsCategoryHook.data.news[0];
        mainNewsItem = {
          id: firstNews.id.toString(),
          title: firstNews.nheader,
          date: formatFullNewsDate(firstNews.ndate, firstNews.ntime),
          time: firstNews.ntime,
          url: generateArticleUrl(firstNews as any),
          imageUrl: getNewsImage(firstNews as any, 'full'),
          imageAlt: firstNews.nheader
        };
      } else if (isArticlesCategory && articlesCategoryHook.data?.news && articlesCategoryHook.data.news.length > 0) {
        const firstArticle = articlesCategoryHook.data.news[0];
        mainNewsItem = {
          id: firstArticle.id.toString(),
          title: firstArticle.nheader,
          date: formatFullNewsDate(firstArticle.ndate, firstArticle.ntime),
          time: firstArticle.ntime,
          url: generateArticleUrl(firstArticle as any),
          imageUrl: getNewsImage(firstArticle as any, 'full'),
          imageAlt: firstArticle.nheader
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

  // Функція для перевірки, чи є новини в блоці перед банером
  const hasNewsInPreviousBlocks = (currentIndex: number, blocks: any[]) => {
    const filteredNews = getNewsWithoutMain();
    
    for (let i = 0; i < currentIndex; i++) {
      const block = blocks[i];
      if (!block.config?.show) continue;
      
      // Перевіряємо тільки блоки з новинами
      if (block.type === 'CATEGORY_NEWS' || block.type === 'COLUMN_NEWS') {
        const newsRange = block.config.newsRange;
        if (newsRange) {
          const blockNews = filteredNews.slice(newsRange.start - 1, newsRange.end);
          if (blockNews.length > 0) {
            return true; // Знайшли блок з новинами перед банером
          }
        }
      }
    }
    return false; // Не знайшли блоків з новинами перед банером
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
        // Вимикаємо рендер під час завантаження
        if (currentCategoryLoading) {
          return null;
        }

        // Кількість новин без головної
        const availableNewsCount = getNewsWithoutMain().length;

        // Порядковий номер банера серед уже зустрінутих у схемі до поточного індексу
        const bannersBeforeOrAtIndex = schema.blocks
          .slice(0, index + 1)
          .filter((b: any) => b.type === 'AD_BANNER').length;

        const currentBannerOrder = Math.max(1, bannersBeforeOrAtIndex); // 1, 2, 3...

        // Пороги для відображення банерів залежно від кількості доступних новин (без головної)
        // 1-й банер — 0+, 2-й — від 8, 3-й — від 13, 4-й — від 18 (на майбутнє)
        const bannerThresholds = [0, 9, 14, 19];
        const requiredNews = bannerThresholds[currentBannerOrder - 1] ?? bannerThresholds[bannerThresholds.length - 1];

        if (availableNewsCount < requiredNews) {
          return null;
        }

        return (
          <AdBanner 
            key={index}
            className={styles[config.className]}
            advertisementId={config.advertisementId}
            placement={config.placement}
          />
        );

      case 'BANNER_IMAGE':
        // Захардкодена реклама Infomo Black (за alt)
        if (config.alt === 'IN-FOMO Banner') {
          return (
            <div key={index} className={styles.newsColumn}>
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => window.open('https://in-fomo.com/uk', '_blank')}
              >
                <Image
                  src={adBannerIndfomo}
                  alt="IN-FOMO Banner"
                  width={config.width || 600}
                  height={config.height || 240}
                  className={styles[config.className]}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </div>
          );
        }

        // Інші реклами (sidebar та general) - використовуємо AdImage
        let placement: 'sidebar' | 'general' = 'general';
        if (config.src?.includes('banner3.png')) {
          placement = 'sidebar';
        }

        return (
          <div key={index} className={styles.newsColumn}>
            <AdImage
              advertisementId={config.advertisementId}
              placement={placement}
              width={config.width}
              height={config.height}
              className={styles[config.className]}
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
        
        // Рендеримо пагінацію над компонентом AllNews, якщо є більше однієї сторінки
        const paginationElement = (totalPages > 1) ? (
          <div className={styles.paginationContainer}>
            <Pagination
              current={currentPage}
              total={totalItems}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              hideOnSinglePage
              showLessItems
            />
          </div>
        ) : null;
        
        // Для категорії "all", "important", "news" та "articles" передаємо останні 20 новин (виключаючи головну новину)
        if (isAllCategory || isImportantCategory || isNewsCategory || isArticlesCategory) {
          const filteredAllNews = getNewsWithoutMain();
          const allNewsData = filteredAllNews.slice(37, 57); // Останні 20 новин з 57 (для всіх цих категорій)
          
          // Не рендеримо компонент, якщо новин менше 1 (не завантажуємо)
          if (!currentCategoryLoading && allNewsData.length < 1) {
            return null;
          }
          
          return (
            <div key={index}>
              {paginationElement}
              <AllNews
                customTitle={config.customTitle || "Більше новин"}
                news={allNewsData}
                hideHeader={false}
              />
            </div>
          );
        }
        // Для інших категорій використовуємо стандартну логіку
        return (
          <div key={index}>
            {paginationElement}
            <AllNews
              customTitle={config.customTitle}
            />
          </div>
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
  // Пріоритет: API schema -> дефолтний schema
  const defaultSchema = isMobile ? categoryMobileSchema : categoryDesktopSchema;
  const apiSchema = isMobile ? apiMobileSchema : apiDesktopSchema;
  const schema = apiSchema || defaultSchema;

  // Перевіряємо наявність схеми та blocks
  if (!schema || !schema.blocks) {
    return null;
  }

  // Фільтруємо sidebar блоки: пропускаємо категорію яка співпадає з поточною та обмежуємо до 3
  const filteredSidebarBlocks = (schema as any).sidebar?.blocks 
    ? filterSidebarCategoryBlocks((schema as any).sidebar.blocks, categoryId, 3)
    : [];

  return (
    <>
      <div className={styles.container}>
        {/* Основний контент - ліва частина */}
        <div className={styles.mainContent}>
          {schema.blocks.map((block: any, index: number) => renderBlock(block, index))}
        </div>

        {/* Бокова панель для десктопу */}
        {/* Sidebar завжди показується якщо є блоки (навіть якщо немає категорійних - є банери, валюта, погода) */}
        {!isMobile && (schema as any).sidebar && (
          <div className={styles.sidebar}>
            {filteredSidebarBlocks.map((block: any, index: number) => renderBlock(block, index))}
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
