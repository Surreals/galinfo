'use client';

import React from 'react';
import { Skeleton } from "antd";
import { NewsTag, useCompleteNewsData } from "@/app/hooks";
import { ColumnNews, CategoryNews, AdBanner, Breadcrumbs, ArticleMeta } from "@/app/components";
import NewsList from "@/app/components/listNews/listNews";
import Image from "next/image";
import styles from "./page.module.css";
import CurrencyRates from "@/app/components/hero/CurrencyRates";
import WeatherWidget from "@/app/components/hero/WeatherWidget";
import adBannerIndfomo from '@/assets/images/Ad Banner black.png';
import banner3 from '@/assets/images/banner3.png';
import { useMobileContext } from "@/app/contexts/MobileContext";
import { getUniversalNewsImageFull } from "@/app/lib/newsUtils";

interface ArticlePageClientProps {
  urlkey: string;
  id: number;
}

export const ArticlePageClient: React.FC<ArticlePageClientProps> = ({ urlkey, id }) => {
  const { isMobile } = useMobileContext();

  const { data, loading } = useCompleteNewsData({
    id,
    urlkey,
    articleType: 'news',
  });

  const bodyNews = data?.article?.nbody;
  const article = data?.article;
  const imageUrl =
    getUniversalNewsImageFull(article || {}) ||
    'https://picsum.photos/300/200?random=1';

  return (
    <>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* Breadcrumbs */}
          {/* Breadcrumbs навігація */}
          {!isMobile && (
            loading ? (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <Skeleton.Input active style={{ width: '60%', height: 24, marginBottom: 24 }} />

              </div>
            ) : (
              <Breadcrumbs
                items={[
                  { label: 'ГОЛОВНА', href: '/' },
                  ...(article?.breadcrumbs?.map(
                    (item: { title: string; link: string }, index: number, arr: any[]) => {
                      if (index === arr.length - 1) {
                        return { label: item.title };
                      }
                      return { label: item.title, href: item.link };
                    }
                  ) || []),
                ]}
              />
            )
          )}

          <AdBanner className={styles.adBannerStandard} />

          <ArticleMeta date={article?.ndate} time={article?.ntime} isMobile={isMobile} />

          {/* ===== СЕКЦІЯ СТАТТІ ===== */}
          {loading ? (
            <>
              <div className={styles.articleHeader}>
                <Skeleton.Input
                  active
                  style={{ width: '80%', height: 40, marginBottom: 16 }}
                />
                <Skeleton.Input
                  active
                  style={{ width: '60%', height: 24, marginBottom: 24 }}
                />
              </div>

              <div className={styles.articleImage}>
                <Skeleton.Input
                  style={{ width: '100%', height: 400, marginBottom: 24 }}
                  active
                />
              </div>

              <Skeleton active paragraph={{ rows: 6 }} />

              <div className={styles.articleMetadata}>
                <Skeleton.Input
                  active
                  style={{ width: 120, height: 20, marginTop: 16 }}
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.articleHeader}>
                <h1 className={styles.articleTitle}>{article?.nheader}</h1>
                {article?.nteaser && (
                  <p className={styles.articleLead}>{article?.nteaser}</p>
                )}
              </div>

              {article?.images_data && (
                <div className={styles.articleImage}>
                  <Image
                    src={imageUrl}
                    alt={imageUrl}
                    width={800}
                    height={500}
                    className={styles.mainImage}
                    priority={true}
                  />
                  <div className={styles.imageCredits}>
                    {article?.images_data?.[0]?.title && (
                      <span className={styles.photoCredit}>
                        {article?.images_data?.[0]?.title}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div
                className={styles.paragraph}
                dangerouslySetInnerHTML={{ __html: bodyNews || '' }}
              />

              <div className={styles.articleMetadata}>
                <div className={styles.tags}>
                  {article?.tags.map((tag: NewsTag, index: number) => (
                    <span key={tag.id || index} className={styles.tag}>
                      {tag.tag}
                    </span>
                  ))}
                </div>
                {article?.author_name && (
                  <div className={styles.authorInfo}>
                    Автор: {article?.author_name}
                  </div>
                )}
              </div>
            </>
          )}
          {/* ===== END СЕКЦІЇ ===== */}

          <AdBanner className={styles.adBannerStandard} />

          {isMobile && (
            <>
              <div style={{ padding: '0 16px' }} className={styles.newsColumn}>
                <NewsList
                  mobileLayout="horizontal"
                  arrowRightIcon
                  title="НОВИНИ ЛЬВОВА"
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
          )}

          <ColumnNews
            isMobile={isMobile}
            mobileLayout="horizontal"
            newsQuantity={4}
            smallImg={true}
            category="СВІЖІ НОВИНИ"
            secondCategory="СВІЖІ НОВИНИ"
            showNewsList={false}
            hideHeader={false}
            className={styles.columnNewsStandard}
          />

          <AdBanner className={styles.adBannerStandard} />

          <CategoryNews
            isMobile={isMobile}
            height={133}
            category="ТОП НОВИНИ"
            hideHeader={false}
            className={styles.categoryNewsStandard}
          />

          {isMobile && (
            <div style={{ marginBottom: 24 }} className={styles.newsColumn}>
              <Image
                src={adBannerIndfomo}
                alt="IN-FOMO Banner"
                width={600}
                height={240}
                className={styles.fomoLogo}
                priority={false}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        {!isMobile && (
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
            <div className={styles.infoSection}>
              <CurrencyRates />
              <WeatherWidget />
            </div>
            <div className={styles.rightSeparator}></div>

            <div className={styles.newsColumn}>
              <NewsList
                arrowRightIcon
                title="ПОЛІТИКА"
                showImagesAt={[0, 1]}
                showMoreButton={true}
                moreButtonUrl="/politics"
                widthPercent={100}
              />
            </div>

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
        )}
      </div>
    </>
  );
};
