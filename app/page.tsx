'use client';

import { AllNews, CategoryNews, ColumnNews, Hero, ArticleLink } from "@/app/components";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { useMenuContext } from "@/app/contexts/MenuContext";
import { CATEGORY_IDS, getCategoryDisplayName } from "@/app/lib/categoryUtils";

import styles from "./page.module.css";

export default function HomePage() {
  const isMobile = useIsMobile();
  const { menuData, getCategoryById } = useMenuContext();

  // Get category objects by ID
  const politicsCategory = getCategoryById(CATEGORY_IDS.POLITICS);
  const atoCategory = getCategoryById(CATEGORY_IDS.ATO);
  const evropaCategory = getCategoryById(CATEGORY_IDS.EVROPA);
  const healthCategory = getCategoryById(CATEGORY_IDS.HEALTH);
  const societyCategory = getCategoryById(CATEGORY_IDS.SOCIETY);
  const crimeCategory = getCategoryById(CATEGORY_IDS.CRIME);
  const sportCategory = getCategoryById(CATEGORY_IDS.SPORT);
  const cultureCategory = getCategoryById(CATEGORY_IDS.CULTURE);

  return (
    <>
      <div className={styles.container}>
      {!isMobile ? (
        <>
          <Hero />
          <ColumnNews
            mobileLayout="horizontal"
            newsQuantity={4}
            smallImg={true}
            category={politicsCategory?.title || "ПОЛІТИКА"}
            categoryId={CATEGORY_IDS.POLITICS}
            arrowRightIcon
            secondCategory={atoCategory?.title || "ВІЙНА З РОСІЄЮ"}
            secondCategoryId={CATEGORY_IDS.ATO}
            isHomePage={true}
            showNewsList={true}
          />
          <CategoryNews 
            mobileLayout="horizontal" 
            category={evropaCategory?.title || "ЄВРОПА"}
            categoryId={CATEGORY_IDS.EVROPA}
          />
          <ColumnNews
            mobileLayout="horizontal"
            newsQuantity={5}
            category={healthCategory?.title || "ЗДОРОВʼЯ"}
            categoryId={CATEGORY_IDS.HEALTH}
            secondCategory={societyCategory?.title || "СУСПІЛЬСТВО"}
            secondCategoryId={CATEGORY_IDS.SOCIETY}
            arrowRightIcon
            showNewsList={true}
            isHomePage={true}
          />
          <CategoryNews mobileLayout="horizontal" category="ІСТОРІЯ"/>
          <ColumnNews
            mobileLayout="horizontal"
            newsQuantity={5}
            category={crimeCategory?.title || "КРИМІНАЛ"}
            categoryId={CATEGORY_IDS.CRIME}
            secondCategory={sportCategory?.title || "СПОРТ"}
            secondCategoryId={CATEGORY_IDS.SPORT}
            arrowRightIcon
            isHomePage={true}
          />
          <CategoryNews 
            category={cultureCategory?.title || "КУЛЬТУРА"}
            categoryId={CATEGORY_IDS.CULTURE}
          />
          <AllNews/>
        </>
      ) : (
        // Десктопна версія - збільшена кількість новин
        <>
          <Hero />
          <ColumnNews
          showSeparator={true}
            isMobile={isMobile}
            mobileLayout="horizontal"
            newsQuantity={4}
            smallImg={true}
            category={politicsCategory?.title || "ПОЛІТИКА"}
            categoryId={CATEGORY_IDS.POLITICS}
            secondCategory={atoCategory?.title || "ВІЙНА З РОСІЄЮ"}
            secondCategoryId={CATEGORY_IDS.ATO}
            isHomePage={true}
            showNewsList={true}
          />
          <CategoryNews 
            mobileLayout="horizontal" 
            category={evropaCategory?.title || "ЄВРОПА"}
            categoryId={CATEGORY_IDS.EVROPA}
          />
          <ColumnNews
          showSeparator={true}
            isMobile={isMobile}
            mobileLayout="horizontal"
            newsQuantity={5}
            category={healthCategory?.title || "ЗДОРОВʼЯ"}
            categoryId={CATEGORY_IDS.HEALTH}
            secondCategory={societyCategory?.title || "СУСПІЛЬСТВО"}
            secondCategoryId={CATEGORY_IDS.SOCIETY}
            arrowRightIcon
            showNewsList={true}
            isHomePage={true}
          />
          <CategoryNews mobileLayout="horizontal" category="ІСТОРІЯ"/>
          <ColumnNews
          showSeparator={true}
            isMobile={isMobile}
            mobileLayout="horizontal"
            newsQuantity={5}
            category={crimeCategory?.title || "КРИМІНАЛ"}
            categoryId={CATEGORY_IDS.CRIME}
            secondCategory={sportCategory?.title || "СПОРТ"}
            secondCategoryId={CATEGORY_IDS.SPORT}
            arrowRightIcon
            isHomePage={true}
          />
          <CategoryNews 
            mobileLayout="horizontal" 
            category={cultureCategory?.title || "КУЛЬТУРА"}
            categoryId={CATEGORY_IDS.CULTURE}
          />
          <AllNews/>
        </>
      )}
      </div>
    </>
  );
}