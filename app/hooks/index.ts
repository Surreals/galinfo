// Експорт всіх хуків для зручного імпорту
export { useHeroNews } from './useHeroNews';
export { useHomePageData } from './useHomePageData';
export { useImportantNews, useImportantNewsByLevel, useTopImportantNews, useHighImportantNews, usePhotoNews, useIllustratedNews } from './useImportantNews';
export { useIsMobile } from './useIsMobile';
export { useMenuData } from './useMenuData';
export { useNewsByRubric } from './useNewsByRubric';
export { useNewsByRegion } from './useNewsByRegion';
export { useSingleNews } from './useSingleNews';
export { 
  useLatestNews,
  useLatestNewsFirstPage,
  useLatestNewsWithLimit
} from './useLatestNews';
export { 
  useImportantNewsByCategory,
  useLatestImportantNewsByCategory,
  useTopImportantNewsByCategory,
  usePhotoNewsByCategory,
  useIllustratedNewsByCategory,
  useAllImportantNewsByCategory
} from './useImportantNewsByCategory';
export { 
  useCompleteNewsData, 
  usePhotoNewsData, 
  useVideoNewsData, 
  useBlogPostData, 
  useArticleData, 
  useNewsData 
} from './useCompleteNewsData';
export { 
  useSpecialThemesNews,
  useLatestSpecialThemesNews,
  useSpecialThemesNewsWithImages,
  useSpecialThemesVideoNews,
  useAllSpecialThemesNews,
  useSpecialThemesNewsById,
  useLatestSpecialThemesNewsById,
  useAllSpecialThemesNewsById
} from './useSpecialThemesNews';

// Типи для експорту
export type { 
  NewsImage, 
  NewsRubric, 
  NewsTag, 
  RelatedNews, 
  NewsAuthor, 
  NewsStatistics, 
  NewsMeta, 
  NewsBreadcrumb, 
  CompleteNewsArticle, 
  CompleteNewsResponse, 
  UseCompleteNewsDataOptions, 
  UseCompleteNewsDataReturn 
} from './useCompleteNewsData';

export type {
  NewsByRegionItem,
  NewsByRegionResponse,
  UseNewsByRegionOptions,
  UseNewsByRegionReturn
} from './useNewsByRegion';

export type {
  LatestNewsItem,
  LatestNewsResponse,
  UseLatestNewsOptions,
  UseLatestNewsReturn
} from './useLatestNews';

export type {
  ImportantNewsByCategoryItem,
  ImportantNewsByCategoryResponse,
  UseImportantNewsByCategoryOptions,
  UseImportantNewsByCategoryReturn
} from './useImportantNewsByCategory';

export type {
  SpecialThemesNewsItem,
  SpecialThemesNewsResponse,
  UseSpecialThemesNewsOptions,
  UseSpecialThemesNewsReturn
} from './useSpecialThemesNews';
