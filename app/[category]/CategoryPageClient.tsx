'use client';

import React from 'react';
import { AllNews, CategoryNews, ColumnNews, MainNews, CategoryTitle, AdBanner, Breadcrumbs } from "@/app/components";
import NewsList from "@/app/components/listNews/listNews";
import Image from "next/image";
import styles from "./page.module.css";
import {getCategoryTitle} from "@/assets/utils/getTranslateCategory";
import CurrencyRates from "@/app/components/hero/CurrencyRates";
import WeatherWidget from "@/app/components/hero/WeatherWidget";
import adBannerIndfomo from '@/assets/images/Ad Banner black.png';
import banner3 from '@/assets/images/banner3.png';
import { useMobileContext } from "@/app/contexts/MobileContext";

interface CategoryPageClientProps {
  category: string;
  newsData1: any[];
  newsData2: any[];
  newsData3: any[];
}

export const CategoryPageClient: React.FC<CategoryPageClientProps> = ({ 
  category, 
  newsData1, 
  newsData2, 
  newsData3 
}) => {
  const { isMobile } = useMobileContext();

  return (
    <>
      <div className={styles.container}>
        {/* Основний контент - ліва частина */}
        <div className={styles.mainContent}>
          
          {/* Breadcrumbs навігація */}
          {!isMobile &&
          <Breadcrumbs 
            items={[
              { label: 'ГОЛОВНА', href: '/' },
              { label: getCategoryTitle(category).toUpperCase() }
            ]} 
          />
          }
  
          
          {/* Тайтл категорії */}
          <CategoryTitle
            title={getCategoryTitle(category)}
            className={styles.categoryTitleStandard}
          />
          
          {/* Основна новина */}
          <MainNews 
            title="На фронті від початку доби - 101 зіткнення, бої точаться на семи напрямках"
            date="02 липня 2025"
            time="14:54"
            url="/article/front-news-101"
            imageUrl="https://picsum.photos/800/500?random=main"
            imageAlt="Військові дії на фронті"
            className={styles.mainNewsStandard}
          />
          
          {/* Основна категорія - без заголовка */}
          <CategoryNews 
            height={133}
            category={category.toUpperCase()} 
            hideHeader={true} 
            className={styles.categoryNewsStandard}
          />
          
          {/* Рекламний банер */}
          <AdBanner className={styles.adBannerStandard} />
          
          {/* Колонка новин - без заголовка */}
          <ColumnNews 
            mobileLayout="horizontal"
            newsQuantity={4} 
            smallImg={true} 
            category="ПОЛІТИКА" 
            secondCategory=""
            showNewsList={false} 
            hideHeader={true} 
            className={styles.columnNewsStandard}
          />
          
          {/* Рекламний банер */}
          <AdBanner className={styles.adBannerStandard} />
          
          {/* Колонка новин - без заголовка */}
          <ColumnNews 
            mobileLayout="horizontal"
            newsQuantity={8} 
            category="ЕВРОПА" 
            secondCategory=""
            showNewsList={false} 
            hideHeader={true} 
            className={styles.columnNewsStandard}
          />
          
          {/* Рекламний банер */}
          {isMobile ? <div className={styles.newsColumn}>
            <Image 
              src={banner3} 
              alt="banner3" 
              width={600} 
              height={240} 
              className={styles.banner3}
              priority={false}
            />
          </div> :
          <AdBanner className={styles.adBannerStandard} />
        }
        {isMobile &&
          <div style={{
            padding: '0 16px'
          }} className={styles.newsColumn}>
            <NewsList
              mobileLayout="horizontal"
              arrowRightIcon
              title="ПОЛІТИКА"
              data={newsData1}
              showImagesAt={[0, 1]}
              showMoreButton={true}
              moreButtonUrl="/politics"
              widthPercent={100}
            />
          </div>
        }

        {isMobile && <div className={styles.newsColumn}>
        <div className={styles.rightSeparator}></div>
            <Image 
              src={adBannerIndfomo} 
              alt="IN-FOMO Banner" 
              width={600} 
              height={240} 
              className={styles.fomoLogo}
              priority={false}
              style={{
                marginBottom: '24px'
              }}
            />
          </div>
        }
          {/* Категорія новин - без заголовка */}
          <CategoryNews 
            height={133}
            category="ЗДОРОВ'Я" 
            hideHeader={true} 
            className={styles.categoryNewsStandard}
          />
          
          {/* Колонка новин - без заголовка */}
          {!isMobile &&
          <>
            <ColumnNews 
              newsQuantity={4} 
              smallImg={true} 
              category="КУЛЬТУРА" 
              secondCategory=""
              showNewsList={false} 
              hideHeader={true} 
              className={styles.columnNewsStandard}
            />
            <ColumnNews 
              newsQuantity={8} 
              category="КРИМІНАЛ" 
              secondCategory="false" 
              showNewsList={false} 
              hideHeader={true} 
              className={styles.columnNewsStandard}
            />
          </>
}
        </div>

        {/* Права частина - три колонки NewsList */}
        {!isMobile &&
        <div className={styles.sidebar}>
          <div className={styles.newsColumn}>
            <Image 
              src={banner3} 
              alt="banner3" 
              width={600} 
              height={240} 
              className={styles.banner3}
              priority={false}
            />
          </div>
          {!isMobile &&
          <div className={styles.infoSection}>
            <CurrencyRates />
            <WeatherWidget />
          </div>
          }
          <div className={styles.rightSeparator}></div>
          
          <div className={styles.newsColumn}>
            <NewsList
              mobileLayout="horizontal"
              arrowRightIcon
              title="ПОЛІТИКА"
              data={newsData1}
              showImagesAt={[0, 1]}
              showMoreButton={true}
              moreButtonUrl="/politics"
              widthPercent={100}
            />
          </div>
          
          {/* Сепаратор між правими компонентами */}
          <div className={styles.rightSeparator}></div>
          <div className={styles.newsColumn}>
            <Image 
              src={adBannerIndfomo} 
              alt="IN-FOMO Banner" 
              width={600} 
              height={240} 
              className={styles.fomoLogo}
              priority={false}
            />
          </div>
          <div className={styles.rightSeparator}></div>
          
          <div className={styles.newsColumn}>
            <NewsList
              mobileLayout="horizontal"
              arrowRightIcon
              title="ЕКОНОМІКА"
              data={newsData2}
              showImagesAt={[0, 1]}
              showMoreButton={true}
              moreButtonUrl="/economy"
              widthPercent={100}
            />
          </div>
          
          {/* Сепаратор між правими компонентами */}
          <div className={styles.rightSeparator}></div>
          
          <div className={styles.newsColumn}>
            <NewsList
              mobileLayout="horizontal"
              arrowRightIcon
              title="СПОРТ"
              data={newsData3}
              showImagesAt={[0, 1]}
              showMoreButton={true}
              moreButtonUrl="/sport"
              widthPercent={100}
            />
          </div>
        </div>
    }
      </div>
      {!isMobile &&
      <div className={styles.containerAllNews}>
        <AllNews
          customTitle="Більше новин"
        />
      </div>
      }
    </>
  );
};
