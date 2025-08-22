'use client';

import React from 'react';
import { AllNews, CategoryNews, ColumnNews, MainNews, CategoryTitle, AdBanner, Breadcrumbs, ArticleMeta } from "@/app/components";
import NewsList from "@/app/components/listNews/listNews";
import Image from "next/image";
import styles from "./page.module.css";
import CurrencyRates from "@/app/components/hero/CurrencyRates";
import WeatherWidget from "@/app/components/hero/WeatherWidget";
import adBannerIndfomo from '@/assets/images/Ad Banner black.png';
import banner3 from '@/assets/images/banner3.png';
import { getBreadCrumbsNav } from "@/assets/utils/getTranslateCategory";
import { useMobileContext } from "@/app/contexts/MobileContext";

interface ArticlePageClientProps {
  articleData: any;
  newsData1: any[];
  newsData2: any[];
  newsData3: any[];
}

export const ArticlePageClient: React.FC<ArticlePageClientProps> = ({ 
  articleData, 
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
              { label: articleData.category, href: `/category/${getBreadCrumbsNav(articleData.category.toLowerCase())}` },
              { label: 'НОВИНА' }
            ]} 
          />
          }
          <AdBanner className={styles.adBannerStandard} />
          
          {/* Метадані статті - дата та соціальні мережі */}
          <ArticleMeta 
            date={articleData.publishedAt || articleData.createdAt || new Date().toISOString()} 
            isMobile={isMobile}
          />
          
          
          {/* Заголовок статті */}
          <div className={styles.articleHeader}>
            <h1 className={styles.articleTitle}>{articleData.title}</h1>
            <p className={styles.articleLead}>{articleData.lead}</p>
          </div>
          
          {/* Основне зображення статті */}
          <div className={styles.articleImage}>
            <Image 
              src={articleData.imageUrl}
              alt={articleData.imageAlt}
              width={800}
              height={500}
              className={styles.mainImage}
              priority={true}
            />
            <div className={styles.imageCredits}>
              <span className={styles.photoCredit}>{articleData.photoCredit}</span>
              <span className={styles.source}>{articleData.source}</span>
            </div>
          </div>
          
          {/* Основний текст статті */}
          <div className={styles.articleContent}>
            {articleData.content.split('\n\n').map((paragraph: string, index: number) => (
              <p key={index} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
          
          {/* Метадані статті */}
          <div className={styles.articleMetadata}>
            <div className={styles.tags}>
              {articleData.tags.map((tag: string, index: number) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className={styles.authorInfo}>
              Автор: {articleData.author}
            </div>
          </div>
          
          {/* Рекламний банер */}
          <AdBanner className={styles.adBannerStandard} />

          {isMobile && 
          <> 
            <div style={{
              padding: '0 16px'
            }} className={styles.newsColumn}>
              <NewsList
                mobileLayout='horizontal'
                arrowRightIcon
                title="НОВИНИ ЛЬВОВА"
                data={newsData1}
                showImagesAt={[0, 1]}
                showMoreButton={true}
                moreButtonUrl="/category/politics"
                widthPercent={100}
              />
            </div>
            <div className={styles.rightSeparator}></div>
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
        </>
          }
          
          {/* Колонка новин - без заголовка */}
          <ColumnNews 
            isMobile={isMobile}
            mobileLayout='horizontal'
            newsQuantity={4} 
            smallImg={true} 
            category="СВІЖІ НОВИНИ" 
            secondCategory="СВІЖІ НОВИНИ"
            showNewsList={false} 
            hideHeader={false} 
            className={styles.columnNewsStandard}
          />
          
          {/* Рекламний банер */}
          <AdBanner className={styles.adBannerStandard} />
          
          {/* Категорія новин - без заголовка */}
          <CategoryNews
            isMobile={isMobile}
            height={133} 
            category="ТОП НОВИНИ" 
            hideHeader={false} 
            className={styles.categoryNewsStandard}
          />

          {isMobile && <div style={{
            marginBottom: 24
          }} className={styles.newsColumn}>
            <Image 
              src={adBannerIndfomo} 
              alt="IN-FOMO Banner" 
              width={600} 
              height={240} 
              className={styles.fomoLogo}
              priority={false}
            />
          </div>}
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
              arrowRightIcon
              title="ПОЛІТИКА"
              data={newsData1}
              showImagesAt={[0, 1]}
              showMoreButton={true}
              moreButtonUrl="/category/politics"
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
        </div>
}
      </div>
      
      {/* {!isMobile &&
      <div className={styles.containerAllNews}>
        <AllNews
          customTitle="Більше новин"
        />
      </div> */}

    </>
  );
};
