import { CATEGORY_IDS } from './categoryUtils';

// Константи для типів блоків
export const BREADCRUMBS = 'BREADCRUMBS';
export const CATEGORY_TITLE = 'CATEGORY_TITLE';
export const MAIN_NEWS = 'MAIN_NEWS';
export const CATEGORY_NEWS = 'CATEGORY_NEWS';
export const COLUMN_NEWS = 'COLUMN_NEWS';
export const NEWS_LIST = 'NEWS_LIST';
export const AD_BANNER = 'AD_BANNER';
export const CURRENCY_RATES = 'CURRENCY_RATES';
export const WEATHER_WIDGET = 'WEATHER_WIDGET';
export const ALL_NEWS = 'ALL_NEWS';
export const INFO_SECTION = 'INFO_SECTION';
export const BANNER_IMAGE = 'BANNER_IMAGE';
export const SEPARATOR = 'SEPARATOR';
export const RIGHT_SEPARATOR = 'RIGHT_SEPARATOR';

// Схема для десктопної версії сторінки категорії
export const categoryDesktopSchema = {
  blocks: [
    // Breadcrumbs (тільки для десктопу)
    {
      type: BREADCRUMBS,
      config: {
        show: true,
        items: [
          { label: 'ГОЛОВНА', href: '/' },
          { label: 'CATEGORY_TITLE' } // Буде замінено на реальну назву категорії
        ]
      }
    },
    
    // Заголовок категорії
    {
      type: CATEGORY_TITLE,
      config: {
        show: true,
        className: 'categoryTitleStandard'
      }
    },
    
    // Основна новина (перша новина з єдиного набору)
    {
      type: MAIN_NEWS,
      config: {
        show: true,
        className: 'mainNewsStandard',
        showSeparator: true,
        newsIndex: 0 // Індекс новини в єдиному наборі
      }
    },
    
    // Основна категорія новин (новини 1-8 з єдиного набору)
    {
      type: CATEGORY_NEWS,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        height: 133,
        hideHeader: true,
        className: 'categoryNewsStandard',
        showSeparator: true,
        newsRange: { start: 1, end: 8 } // Діапазон новин з єдиного набору
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

    // Колонка новин (новини 9-13 з єдиного набору)
    {
      type: COLUMN_NEWS,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        mobileLayout: "horizontal",
        newsQuantity: 5,
        smallImg: true,
        secondCategory: "",
        showNewsList: false,
        hideHeader: true,
        className: 'columnNewsStandard',
        showSeparator: true,
        newsRange: { start: 9, end: 13 } // Діапазон новин з єдиного набору
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
    
    // Колонка новин (новини 14-18 з єдиного набору)
    {
      type: COLUMN_NEWS,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        mobileLayout: "horizontal",
        newsQuantity: 5,
        secondCategory: "",
        showNewsList: false,
        hideHeader: true,
        className: 'columnNewsStandard',
        showSeparator: true,
        newsRange: { start: 14, end: 18 } // Діапазон новин з єдиного набору
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
    
    // Категорія новин (новини 19-26 з єдиного набору)
    {
      type: CATEGORY_NEWS,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        height: 133,
        hideHeader: true,
        className: 'categoryNewsStandard',
        showSeparator: true,
        newsRange: { start: 19, end: 26 } // Діапазон новин з єдиного набору
      }
    },
    
    // Колонка новин - Культура (новини 27-31 з єдиного набору, тільки для десктопу)
    {
      type: COLUMN_NEWS,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        desktopOnly: true,
        newsQuantity: 5,
        smallImg: true,
        secondCategory: "",
        showNewsList: false,
        hideHeader: true,
        className: 'columnNewsStandard',
        showSeparator: true,
        newsRange: { start: 27, end: 31 } // Діапазон новин з єдиного набору
      }
    },
    
    // Колонка новин - Кримінал (новини 32-36 з єдиного набору, тільки для десктопу)
    {
      type: COLUMN_NEWS,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        desktopOnly: true,
        newsQuantity: 5,
        secondCategory: "false",
        showNewsList: false,
        hideHeader: true,
        className: 'columnNewsStandard',
        showSeparator: true,
        newsRange: { start: 32, end: 36 } // Діапазон новин з єдиного набору
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
      },
      
      // Сепаратор
      {
        type: RIGHT_SEPARATOR,
        config: {
          show: true
        }
      },
      
      // NewsList - Економіка
      {
        type: NEWS_LIST,
        categoryId: CATEGORY_IDS.ECONOMICS,
        config: {
          show: true,
          mobileLayout: "horizontal",
          arrowRightIcon: true,
          title: "ЕКОНОМІКА",
          showImagesAt: [0, 1],
          showMoreButton: true,
          moreButtonUrl: "/economy",
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
        type: RIGHT_SEPARATOR,
        config: {
          show: true
        }
      },
      
      // NewsList - Спорт
      {
        type: NEWS_LIST,
        categoryId: CATEGORY_IDS.SPORT,
        config: {
          show: true,
          mobileLayout: "horizontal",
          arrowRightIcon: true,
          title: "СПОРТ",
          showImagesAt: [0, 1],
          showMoreButton: true,
          moreButtonUrl: "/sport",
          widthPercent: 100,
          apiParams: {
            page: 1,
            limit: 8,
            lang: '1',
            approved: true,
            type: null
          }
        }
      }
    ]
  },
  
  // Футер для десктопу
  footer: {
    blocks: [
      {
        type: ALL_NEWS,
        config: {
          show: true,
          customTitle: "Більше новин"
        }
      }
    ]
  }
};

// Схема для мобільної версії сторінки категорії
export const categoryMobileSchema = {
  blocks: [
    // Заголовок категорії
    {
      type: CATEGORY_TITLE,
      config: {
        show: true,
        className: 'categoryTitleStandard'
      }
    },
    
    // Основна новина (перша новина з єдиного набору)
    {
      type: MAIN_NEWS,
      config: {
        show: true,
        className: 'mainNewsStandard',
        showSeparator: true,
        newsIndex: 0 // Індекс новини в єдиному наборі
      }
    },
    
    // Основна категорія новин (новини 1-8 з єдиного набору)
    {
      type: CATEGORY_NEWS,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        height: 133,
        hideHeader: true,
        className: 'categoryNewsStandard',
        showSeparator: true,
        newsRange: { start: 1, end: 8 } // Діапазон новин з єдиного набору
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
    
    // Колонка новин (новини 9-12 з єдиного набору)
    {
      type: COLUMN_NEWS,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        mobileLayout: "horizontal",
        newsQuantity: 4,
        smallImg: true,
        secondCategory: "",
        showNewsList: false,
        hideHeader: true,
        className: 'columnNewsStandard',
        showSeparator: true,
        newsRange: { start: 9, end: 12 } // Діапазон новин з єдиного набору
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
    
    // Колонка новин (новини 13-20 з єдиного набору)
    {
      type: COLUMN_NEWS,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        mobileLayout: "horizontal",
        newsQuantity: 8,
        secondCategory: "",
        showNewsList: false,
        hideHeader: true,
        className: 'columnNewsStandard',
        showSeparator: true,
        newsRange: { start: 13, end: 20 } // Діапазон новин з єдиного набору
      }
    },
    
    // Рекламний банер
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
    
    // NewsList (новини 21-28 з єдиного набору, тільки для мобільної версії)
    {
      type: NEWS_LIST,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        mobileOnly: true,
        mobileLayout: "horizontal",
        arrowRightIcon: true,
        title: "CURRENT_CATEGORY_TITLE", // Буде замінено на реальну назву категорії
        showImagesAt: [0, 1],
        showMoreButton: true,
        moreButtonUrl: "CURRENT_CATEGORY_URL", // Буде замінено на реальний URL категорії
        widthPercent: 100,
        newsRange: { start: 21, end: 28 } // Діапазон новин з єдиного набору
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
    },
    
    // Категорія новин (новини 29-36 з єдиного набору)
    {
      type: CATEGORY_NEWS,
      categoryId: 'CURRENT_CATEGORY',
      config: {
        show: true,
        height: 133,
        hideHeader: true,
        className: 'categoryNewsStandard',
        showSeparator: true,
        newsRange: { start: 29, end: 36 } // Діапазон новин з єдиного набору
      }
    }
  ]
};
