import { CATEGORY_IDS } from './categoryUtils';

// Константи для типів блоків
export const BREADCRUMBS = 'BREADCRUMBS';
export const ARTICLE_META = 'ARTICLE_META';
export const ARTICLE_HEADER = 'ARTICLE_HEADER';
export const ARTICLE_IMAGE = 'ARTICLE_IMAGE';
export const ARTICLE_CONTENT = 'ARTICLE_CONTENT';
export const ARTICLE_TAGS = 'ARTICLE_TAGS';
export const COLUMN_NEWS = 'COLUMN_NEWS';
export const CATEGORY_NEWS = 'CATEGORY_NEWS';
export const NEWS_LIST = 'NEWS_LIST';
export const AD_BANNER = 'AD_BANNER';
export const CURRENCY_RATES = 'CURRENCY_RATES';
export const WEATHER_WIDGET = 'WEATHER_WIDGET';
export const INFO_SECTION = 'INFO_SECTION';
export const BANNER_IMAGE = 'BANNER_IMAGE';
export const SEPARATOR = 'SEPARATOR';
export const RIGHT_SEPARATOR = 'RIGHT_SEPARATOR';

// Схема для десктопної версії сторінки статті
export const articlePageDesktopSchema = {
  blocks: [
    // Breadcrumbs (тільки для десктопу)
    {
      type: BREADCRUMBS,
      config: {
        show: true,
        desktopOnly: true
      }
    },
    
    // Рекламний банер
    {
      type: AD_BANNER,
      config: {
        show: true,
        className: 'adBannerStandard'
      }
    },
    
    // Метадані статті (дата, час)
    {
      type: ARTICLE_META,
      config: {
        show: true
      }
    },
    
    // Заголовок та лід статті
    {
      type: ARTICLE_HEADER,
      config: {
        show: true
      }
    },
    
    // Зображення статті
    {
      type: ARTICLE_IMAGE,
      config: {
        show: true
      }
    },
    
    // Контент статті
    {
      type: ARTICLE_CONTENT,
      config: {
        show: true
      }
    },
    
    // Теги та автор статті
    {
      type: ARTICLE_TAGS,
      config: {
        show: true
      }
    },
    
    // Рекламний банер
    {
      type: AD_BANNER,
      config: {
        show: true,
        className: 'adBannerStandard'
      }
    },
    
    // Колонка новин - СВІЖІ НОВИНИ (використовуємо useLatestNews)
    {
      type: COLUMN_NEWS,
      categoryId: 'LATEST_NEWS',
      config: {
        show: true,
        mobileLayout: "horizontal",
        newsQuantity: 4,
        smallImg: true,
        category: "СВІЖІ НОВИНИ",
        secondCategory: "СВІЖІ НОВИНИ",
        showNewsList: false,
        hideHeader: false,
        className: 'columnNewsStandard',
        useHook: 'useLatestNews', // Вказуємо, що використовуємо хук useLatestNews
        hookParams: {
          page: 1,
          limit: 4,
          lang: '1',
          autoFetch: true
        }
      }
    },
    
    // Рекламний банер
    {
      type: AD_BANNER,
      config: {
        show: true,
        className: 'adBannerStandard'
      }
    }
  ],
  
  // Бокова панель для десктопу
  sidebar: {
    blocks: [
      // Банер
      {
        type: BANNER_IMAGE,
        config: {
          show: true,
          src: '/assets/images/banner3.png',
          alt: 'banner3',
          width: 600,
          height: 240,
          className: 'banner3'
        }
      },
      
      // Секція з курсами валют та погодою
      {
        type: INFO_SECTION,
        config: {
          show: true
        },
        children: [
          {
            type: CURRENCY_RATES,
            config: { show: true }
          },
          {
            type: WEATHER_WIDGET,
            config: { show: true }
          }
        ]
      },
      
      // Сепаратор
      {
        type: RIGHT_SEPARATOR,
        config: {
          show: true
        }
      },
      
      // NewsList - Політика
      {
        type: NEWS_LIST,
        categoryId: CATEGORY_IDS.POLITICS,
        config: {
          show: true,
          mobileLayout: "horizontal",
          arrowRightIcon: true,
          title: "ПОЛІТИКА",
          showImagesAt: [0, 1],
          showMoreButton: true,
          moreButtonUrl: "/politics",
          widthPercent: 100,
          apiParams: {
            page: 1,
            limit: 8,
            lang: '1',
            approved: true,
            type: null
          }
        }
      },

      {
        type: RIGHT_SEPARATOR,
        config: {
          show: true
        }
      },
      
      // Банер IN-FOMO
      {
        type: BANNER_IMAGE,
        config: {
          show: true,
          src: '/assets/images/Ad Banner black.png',
          alt: 'IN-FOMO Banner',
          width: 600,
          height: 240,
          className: 'fomoLogo'
        }
      }
    ]
  },
  
  // Футер для десктопу (ТОП НОВИНИ на всю ширину)
  footer: {
    blocks: [
      {
        type: CATEGORY_NEWS,
        categoryId: 'IMPORTANT_NEWS',
        config: {
          show: true,
          height: 133,
          category: "ТОП НОВИНИ",
          hideHeader: false,
          className: 'categoryNewsStandard',
          useHook: 'useImportantNews', // Вказуємо, що використовуємо хук useImportantNews
          hookParams: {
            limit: 8,
            lang: '1',
            autoFetch: true
          }
        }
      }
    ]
  }
};

// Схема для мобільної версії сторінки статті
export const articlePageMobileSchema = {
  blocks: [
    // Метадані статті (дата, час)
    {
      type: ARTICLE_META,
      config: {
        show: true
      }
    },
    
    // Заголовок та лід статті
    {
      type: ARTICLE_HEADER,
      config: {
        show: true
      }
    },
    
    // Зображення статті
    {
      type: ARTICLE_IMAGE,
      config: {
        show: true
      }
    },
    
    // Контент статті
    {
      type: ARTICLE_CONTENT,
      config: {
        show: true
      }
    },
    
    // Теги та автор статті
    {
      type: ARTICLE_TAGS,
      config: {
        show: true
      }
    },
    
    // NewsList - НОВИНИ ЛЬВОВА (тільки для мобільної версії)
    {
      type: NEWS_LIST,
      categoryId: CATEGORY_IDS.LVIV,
      config: {
        show: true,
        mobileOnly: true,
        mobileLayout: "horizontal",
        arrowRightIcon: true,
        title: "НОВИНИ ЛЬВОВА",
        showImagesAt: [0, 1],
        showMoreButton: true,
        moreButtonUrl: "/lviv",
        widthPercent: 100,
        apiParams: {
          page: 1,
          limit: 8,
          lang: '1',
          approved: true,
          type: null
        }
      }
    },
    
    // Сепаратор
    {
      type: SEPARATOR,
      config: {
        show: true,
        mobileOnly: true
      }
    },
    
    // Банер (тільки для мобільної версії)
    {
      type: BANNER_IMAGE,
      config: {
        show: true,
        mobileOnly: true,
        src: '/assets/images/banner3.png',
        alt: 'banner3',
        width: 600,
        height: 240,
        className: 'banner3'
      }
    },
    
    // Колонка новин - СВІЖІ НОВИНИ (використовуємо useLatestNews)
    {
      type: COLUMN_NEWS,
      categoryId: 'LATEST_NEWS',
      config: {
        show: true,
        mobileLayout: "horizontal",
        newsQuantity: 4,
        smallImg: true,
        category: "СВІЖІ НОВИНИ",
        secondCategory: "СВІЖІ НОВИНИ",
        showNewsList: false,
        hideHeader: false,
        className: 'columnNewsStandard',
        useHook: 'useLatestNews', // Вказуємо, що використовуємо хук useLatestNews
        hookParams: {
          page: 1,
          limit: 4,
          lang: '1',
          autoFetch: true
        }
      }
    },
    
    // Рекламний банер
    {
      type: AD_BANNER,
      config: {
        show: true,
        className: 'adBannerStandard'
      }
    },
    
    // Банер IN-FOMO (тільки для мобільної версії)
    {
      type: BANNER_IMAGE,
      config: {
        show: true,
        mobileOnly: true,
        src: '/assets/images/Ad Banner black.png',
        alt: 'IN-FOMO Banner',
        width: 600,
        height: 240,
        className: 'fomoLogo'
      }
    }
  ],
  
  // Футер для мобільної версії (ТОП НОВИНИ на всю ширину)
  footer: {
    blocks: [
      {
        type: CATEGORY_NEWS,
        categoryId: 'IMPORTANT_NEWS',
        config: {
          show: true,
          height: 133,
          category: "ТОП НОВИНИ",
          hideHeader: false,
          className: 'categoryNewsStandard',
          useHook: 'useImportantNews', // Вказуємо, що використовуємо хук useImportantNews
          hookParams: {
            limit: 8,
            lang: '1',
            autoFetch: true
          }
        }
      }
    ]
  }
};
