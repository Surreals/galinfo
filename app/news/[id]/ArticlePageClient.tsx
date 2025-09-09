'use client';

import React, {useEffect, useRef} from 'react';
import {NewsTag, useCompleteNewsData} from "@/app/hooks";
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
import {getUniversalNewsImageFull } from "@/app/lib/newsUtils";

interface ArticlePageClientProps {
  articleData: any;
  urlkey: string;
  id: number;
  newsData1: any[];
  newsData2: any[];
  newsData3: any[];
}

export const ArticlePageClient: React.FC<ArticlePageClientProps> = ({ 
  articleData,
  newsData1,
  urlkey,
  id
}) => {
  const { isMobile } = useMobileContext();

  const {
    data,
  } = useCompleteNewsData({
    id,
    urlkey,
    articleType: 'news',
  });

  const bodyNews = data?.article?.nbody
  const article = data?.article
  const imageUrl = getUniversalNewsImageFull(article || {}) || 'https://picsum.photos/300/200?random=1';



  // @ts-ignore
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
                    ...(article?.breadcrumbs?.map(
                      (item: { title: string; link: string }, index: number, arr: any[]) => {
                        // Якщо останній елемент — видаляємо href
                        if (index === arr.length - 1) {
                          return { label: item.title };
                        }
                        return { label: item.title, href: item.link };
                      }
                    ) || [])
                  ]}
              />
          }
          <AdBanner className={styles.adBannerStandard} />
          
          {/* Метадані статті - дата та соціальні мережі */}
          <ArticleMeta
            date={article?.ndate}
            isMobile={isMobile}
          />
          
          
          {/* Заголовок статті */}
          <div className={styles.articleHeader}>
            <h1 className={styles.articleTitle}>{article?.nheader}</h1>
            {
              article?.nteaser &&
                <p className={styles.articleLead}>{article?.nteaser}</p>
            }
          </div>

          {/* Основне зображення статті */}
          {
            article?.images_data && <div className={styles.articleImage}>
                  <Image
                      src={imageUrl}
                      alt={imageUrl}
                      width={800}
                      height={500}
                      className={styles.mainImage}
                      priority={true}
                  />
                  <div className={styles.imageCredits}>
                    { article?.images_data?.[0]?.title && <span className={styles.photoCredit}>{article?.images_data?.[0]?.title}</span> }
                      {/*<span className={styles.source}>{articleData.source}</span>*/}
                  </div>
              </div>
          }

          <div className={styles.paragraph} dangerouslySetInnerHTML={{ __html: bodyNews || "" }} >
          </div>
          {/* Метадані статті */}
          <div className={styles.articleMetadata}>

            <div className={styles.tags}>

              {article?.tags.map((tag: NewsTag, index: number) => (
                <span key={tag.id || index} className={styles.tag}>
                    {tag.tag}
                </span>
              ))}
            </div>
            {
              article?.author_name &&
                <div className={styles.authorInfo}>
                    Автор: {article?.author_name}
                </div>
            }
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
                moreButtonUrl="/politics"
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
