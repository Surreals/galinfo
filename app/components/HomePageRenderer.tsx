'use client';

import { CategoryNews, ColumnNews, Hero, AllNews, HeroRenderer, AdBanner } from '@/app/components';
import { desktopSchema, mobileSchema } from '@/app/lib/schema';
import { heroSchema, heroInfoSchema, heroInfoMobileSchema } from '@/app/lib/heroSchema';
import { useMenuContext } from '@/app/contexts/MenuContext';
import { useIsMobile } from '@/app/hooks/useIsMobile';
import { useTemplateSchemas } from '@/app/hooks/useTemplateSchemas';

interface HomePageRendererProps {
  schema?: typeof desktopSchema | typeof mobileSchema;
  useMockData?: boolean;
}

export default function HomePageRenderer({ 
  schema
}: HomePageRendererProps) {
  const { getCategoryById } = useMenuContext();
  const isMobile = useIsMobile();
  const { getSchema } = useTemplateSchemas();

  // Отримуємо схему з API (якщо є)
  const apiDesktopSchema = getSchema('main-desktop');
  const apiMobileSchema = getSchema('main-mobile');
  
  // Визначаємо, яку схему використовувати
  // Пріоритет: переданий schema -> API schema -> дефолтний schema
  const defaultSchema = isMobile ? mobileSchema : desktopSchema;
  const apiSchema = isMobile ? apiMobileSchema : apiDesktopSchema;
  const currentSchema = schema || apiSchema || defaultSchema;

  const renderBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'Hero':
        // Отримуємо схеми Hero з API (якщо є)
        const apiHeroSchema = getSchema('hero');
        const apiHeroInfoDesktopSchema = getSchema('hero-info-desktop');
        const apiHeroInfoMobileSchema = getSchema('hero-info-mobile');
        
        // Використовуємо API схему або дефолтну
        const heroSchemaToUse = apiHeroSchema || heroSchema;
        const infoSchemaToUse = isMobile 
          ? (apiHeroInfoMobileSchema || heroInfoMobileSchema)
          : (apiHeroInfoDesktopSchema || heroInfoSchema);
        
        return (
          <HeroRenderer
            key={`hero-${index}`}
            schema={heroSchemaToUse}
            infoSchema={infoSchemaToUse}
            isMobile={isMobile}
          />
        );

      case 'CategoryNews':
        const category = getCategoryById(block.categoryId);
        return (
          <CategoryNews
            key={`category-news-${block.categoryId || 'custom'}-${index}`}
            categoryId={block.categoryId}
            category={(block.config?.category || category?.title || 'Категорія').toUpperCase()}
            config={block.config}
            useRealData={block.config?.useRealData || false}
            limit={block.config?.limit || 8}
            isMobile={isMobile}
          />
        );

      case 'ColumnNews':
        const mainCategory = getCategoryById(block.categoryId);
        const sideCategory = getCategoryById(block.sideCategoryId);
        return (
          <ColumnNews
            key={`column-news-${block.categoryId}-${index}`}
            category={(mainCategory?.title || 'Категорія').toUpperCase()}
            categoryId={block.categoryId}
            secondCategory={(sideCategory?.title || 'Друга категорія').toUpperCase()}
            secondCategoryId={block.sideCategoryId}
            isMobile={isMobile}
            useRealData={block.config?.useRealData || false}
            config={block.config}
            {...block.config}
          />
        );

      case 'AllNews':
        return <AllNews key={`all-news-${index}`} />;

      case 'AdBanner':
      case 'AD_BANNER':
        return (
          <AdBanner
            key={`ad-banner-${index}`}
            className={block.config?.className}
            advertisementId={block.config?.advertisementId}
            placement={block.config?.placement}
          />
        );
      
      default:
        console.warn(`Unknown block type: ${block.type}`);
        return null;
    }
  };

  // Перевіряємо наявність схеми та blocks
  if (!currentSchema || !currentSchema.blocks) {
    return null;
  }

  return (
    <>
      {currentSchema.blocks.map((block: any, index: number) => renderBlock(block, index))}
    </>
  );
}
