'use client';

import { CategoryNews, ColumnNews, Hero, AllNews } from '@/app/components';
import { desktopSchema, mobileSchema } from '@/app/lib/schema';
import { CATEGORY_IDS } from '@/app/lib/categoryUtils';
import { useMenuContext } from '@/app/contexts/MenuContext';
import { useIsMobile } from '@/app/hooks/useIsMobile';

interface HomePageRendererProps {
  schema?: typeof desktopSchema | typeof mobileSchema;
  useMockData?: boolean;
}

export default function HomePageRenderer({ 
  schema, 
  useMockData = true 
}: HomePageRendererProps) {
  const { getCategoryById } = useMenuContext();
  const isMobile = useIsMobile();

  // Визначаємо, яку схему використовувати
  const currentSchema = schema || (isMobile ? mobileSchema : desktopSchema);

  const renderBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'Hero':
        return <Hero key={`hero-${index}`} />;
      
      case 'CategoryNews':
        const category = getCategoryById(block.categoryId);
        return (
          <CategoryNews
            key={`category-news-${block.categoryId || 'custom'}-${index}`}
            categoryId={block.categoryId}
            category={block.config?.category || category?.title || 'Категорія'}
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
            category={mainCategory?.title || 'Категорія'}
            categoryId={block.categoryId}
            secondCategory={sideCategory?.title || 'Друга категорія'}
            secondCategoryId={block.sideCategoryId}
            isMobile={isMobile}
            useRealData={block.config?.useRealData || false}
            config={block.config}
            {...block.config}
          />
        );
      
      case 'AllNews':
        return <AllNews key={`all-news-${index}`} />;
      
      default:
        console.warn(`Unknown block type: ${block.type}`);
        return null;
    }
  };

  return (
    <>
      {currentSchema.blocks.map((block, index) => renderBlock(block, index))}
    </>
  );
}
