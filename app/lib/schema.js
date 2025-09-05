import { CATEGORY_IDS } from "./categoryUtils";

const COLUMN_NEWS = 'ColumnNews'
const CATEGORY_NEWS = 'CategoryNews'
const HERO = 'Hero'
const ALL_NEWS = 'AllNews'

// Схема для десктопної версії
export const desktopSchema = {
  blocks: [
    {
      type: HERO,
      config: {}
    },
    {
      type: COLUMN_NEWS,
      categoryId: CATEGORY_IDS.POLITICS,
      sideCategoryId: CATEGORY_IDS.ATO,
      config: {
        mobileLayout: "horizontal",
        newsQuantity: 5,
        smallImg: true,
        arrowRightIcon: true,
        isHomePage: true,
        showNewsList: true,
        useRealData: true,
        apiParams: {
          page: 1,
          limit: 5,
          lang: '1',
          approved: true
        },
        // Параметри для NewsList (друга категорія)
        secondCategoryApiParams: {
          page: 1,
          limit: 4,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: CATEGORY_NEWS,
      categoryId: CATEGORY_IDS.EVROPA,
      config: {
        mobileLayout: "horizontal",
        useRealData: true,
        limit: 8,
        // Параметри для useNewsByRubric
        apiParams: {
          page: 1,
          limit: 8,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: COLUMN_NEWS,
      categoryId: CATEGORY_IDS.HEALTH,
      sideCategoryId: CATEGORY_IDS.SOCIETY,
      config: {
        mobileLayout: "horizontal",
        newsQuantity: 5,
        arrowRightIcon: true,
        isHomePage: true,
        showNewsList: true,
        useRealData: true,
        apiParams: {
          page: 1,
          limit: 5,
          lang: '1',
          approved: true
        },
        // Параметри для NewsList (друга категорія)
        secondCategoryApiParams: {
          page: 1,
          limit: 5,
          lang: '1',
          approved: true
        }
      }
    },
    {
        type: CATEGORY_NEWS,
        categoryId: CATEGORY_IDS.SVIT,
        config: {
            mobileLayout: "horizontal",
            useRealData: true,
            limit: 8,
            // Параметри для useNewsByRubric
            apiParams: {
            page: 1,
            limit: 8,
            lang: '1',
            approved: true
            }
        }
    },
    {
      type: COLUMN_NEWS,
      categoryId: CATEGORY_IDS.CRIME,
      sideCategoryId: CATEGORY_IDS.SPORT,
      config: {
        mobileLayout: "horizontal",
        newsQuantity: 5,
        arrowRightIcon: true,
        isHomePage: true,
        useRealData: true,
        apiParams: {
          page: 1,
          limit: 5,
          lang: '1',
          approved: true
        },
        // Параметри для NewsList (друга категорія)
        secondCategoryApiParams: {
          page: 1,
          limit: 5,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: CATEGORY_NEWS,
      categoryId: CATEGORY_IDS.CULTURE,
      config: {
        mobileLayout: "column",
        useRealData: true,
        limit: 8,
        // Параметри для useNewsByRubric
        apiParams: {
          page: 1,
          limit: 8,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: ALL_NEWS,
      config: {}
    }
  ]
};

// Схема для мобільної версії
export const mobileSchema = {
  blocks: [
    {
      type: HERO,
      config: {}
    },
    {
      type: COLUMN_NEWS,
      categoryId: CATEGORY_IDS.POLITICS,
      sideCategoryId: CATEGORY_IDS.ATO,
      config: {
        showSeparator: true,
        isMobile: true,
        mobileLayout: "horizontal",
        newsQuantity: 5,
        smallImg: true,
        isHomePage: true,
        showNewsList: true,
        useRealData: true,
        apiParams: {
          page: 1,
          limit: 5,
          lang: '1',
          approved: true
        },
        // Параметри для NewsList (друга категорія)
        secondCategoryApiParams: {
          page: 1,
          limit: 5,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: CATEGORY_NEWS,
      categoryId: CATEGORY_IDS.EVROPA,
      config: {
        mobileLayout: "horizontal",
        useRealData: true,
        limit: 8,
        // Параметри для useNewsByRubric
        apiParams: {
          page: 1,
          limit: 8,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: COLUMN_NEWS,
      categoryId: CATEGORY_IDS.HEALTH,
      sideCategoryId: CATEGORY_IDS.SOCIETY,
      config: {
        showSeparator: true,
        isMobile: true,
        mobileLayout: "horizontal",
        newsQuantity: 5,
        arrowRightIcon: true,
        isHomePage: true,
        showNewsList: true
      }
    },
    {
        type: CATEGORY_NEWS,
        categoryId: CATEGORY_IDS.SVIT,
        config: {
            mobileLayout: "horizontal",
            useRealData: true,
            limit: 8,
            // Параметри для useNewsByRubric
            apiParams: {
            page: 1,
            limit: 8,
            lang: '1',
            approved: true
            }
        }
    },
    {
      type: COLUMN_NEWS,
      categoryId: CATEGORY_IDS.CRIME,
      sideCategoryId: CATEGORY_IDS.SPORT,
      config: {
        showSeparator: true,
        isMobile: true,
        mobileLayout: "horizontal",
        newsQuantity: 5,
        arrowRightIcon: true,
        isHomePage: true
      }
    },
    {
      type: CATEGORY_NEWS,
      categoryId: CATEGORY_IDS.CULTURE,
      config: {
        mobileLayout: "horizontal",
        useRealData: true,
        limit: 6,
        // Параметри для useNewsByRubric
        apiParams: {
          page: 1,
          limit: 6,
          lang: '1',
          approved: true
        }
      }
    },
    {
      type: ALL_NEWS,
      config: {}
    }
  ]
};

// Основна схема (за замовчуванням десктопна)
export const mainPageSchema = desktopSchema;

export const categoryPageSiderMap = {
    [CATEGORY_IDS.SOCIETY]: [CATEGORY_IDS.POLITICS, CATEGORY_IDS.ECONOMICS, CATEGORY_IDS.CULTURE,  CATEGORY_IDS.SPORT],
}