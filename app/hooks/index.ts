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
  useCompleteNewsData, 
  usePhotoNewsData, 
  useVideoNewsData, 
  useBlogPostData, 
  useArticleData, 
  useNewsData 
} from './useCompleteNewsData';

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
