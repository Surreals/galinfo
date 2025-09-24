import { CATEGORY_IDS } from "./categoryUtils";

const NEWS_LIST = 'NewsList'
const CURRENCY_RATES = 'CurrencyRates'
const WEATHER_WIDGET = 'WeatherWidget'
const AD_BANNER = 'AdBanner'

// Схема для Hero секції
export const heroSchema = {
  blocks: [
    {
      type: 'Carousel',
      config: {
        autoplay: true,
        showArrows: true,
        limit: 4,
        useRealData: true,
        apiParams: {
          page: 1,
          limit: 4,
          lang: '1',
          approved: true,
          type: 'news' // Тільки новини для каруселі
        }
      }
    },
    {
      type: 'InfoSection', // Контейнер для CurrencyRates та WeatherWidget
      config: {
        show: true
      },
      children: [
        {
          type: CURRENCY_RATES,
          config: {
            show: true
          }
        },
        {
          type: WEATHER_WIDGET,
          config: {
            show: true
          }
        }
      ]
    }
  ]
}

// Схема для Hero Info секції (під каруселлю)
export const heroInfoSchema = {
  blocks: [
    {
      type: NEWS_LIST,
      categoryId: 'all', // Використовуємо 'all' для отримання всіх новин
      config: {
        title: null, // Без заголовка
        showSeparator: true,
        showImagesAt: [3], // Показувати зображення на 3-й позиції
        widthPercent: 45,
        showMoreButton: false,
        useRealData: true,
        // noFallbackImages: true, // Не показувати fallback зображення для першого блоку
        apiParams: {
          page: 1,
          limit: 11,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: NEWS_LIST,
      categoryId: CATEGORY_IDS.ECONOMICS,
      config: {
        title: "ЕКОНОМІКА",
        moreButtonUrl: "/economics",
        arrowRightIcon: true,
        showImagesAt: [0, 1], // Показувати зображення на 0 і 1 позиціях
        widthPercent: 25,
        showMoreButton: true,
        useRealData: true,
        apiParams: {
          page: 1,
          limit: 7,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: AD_BANNER,
      config: {
        show: true,
        mobileOnly: true, // Показувати тільки на мобільних
        image: '/assets/images/Ad Banner white.png',
        alt: 'IN-FOMO Banner',
        width: 600,
        height: 240
      }
    },
    {
      type: NEWS_LIST,
      categoryId: CATEGORY_IDS.LVIV,
      config: {
        title: "НОВИНИ ЛЬВОВА",
        moreButtonUrl: "/lviv-news",
        mobileLayout: "horizontal",
        showImagesAt: [0, 1],
        widthPercent: 25,
        showMoreButton: true,
        arrowRightIcon: true,
        useRealData: true,
        apiParams: {
          page: 1,
          limit: 7,
          lang: '1',
          approved: true
        }
      }
    }
  ]
}

// Мобільна схема для Hero Info (адаптована під мобільні)
export const heroInfoMobileSchema = {
  blocks: [
    {
      type: NEWS_LIST,
      categoryId: 'all', // Використовуємо 'all' для отримання всіх новин
      config: {
        title: null,
        showSeparator: true,
        showImagesAt: [], // На мобільних не показуємо зображення
        widthPercent: 100,
        showMoreButton: false,
        useRealData: true,
        noFallbackImages: true, // Не показувати fallback зображення для першого блоку
        apiParams: {
          page: 1,
          limit: 8,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: NEWS_LIST,
      categoryId: CATEGORY_IDS.ECONOMICS,
      config: {
        title: "ЕКОНОМІКА",
        moreButtonUrl: "/economics",
        arrowRightIcon: true,
        showImagesAt: [0, 1],
        widthPercent: 100,
        showMoreButton: true,
        useRealData: true,
        apiParams: {
          page: 1,
          limit: 6,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: AD_BANNER,
      config: {
        show: true,
        mobileOnly: true,
        image: '/assets/images/Ad Banner white.png',
        alt: 'IN-FOMO Banner',
        width: 600,
        height: 240
      }
    },
    {
      type: NEWS_LIST,
      categoryId: CATEGORY_IDS.LVIV,
      config: {
        title: "НОВИНИ ЛЬВОВА",
        moreButtonUrl: "/lviv-news",
        mobileLayout: "horizontal",
        showImagesAt: [0, 1],
        widthPercent: 100,
        showMoreButton: true,
        arrowRightIcon: true,
        useRealData: true,
        apiParams: {
          page: 1,
          limit: 6,
          lang: '1',
          approved: true
        }
      }
    }
  ]
}

// Експорт за замовчуванням - десктопна схема
export default heroSchema;
