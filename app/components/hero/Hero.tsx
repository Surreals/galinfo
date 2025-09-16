"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Carousel } from 'antd';
import NewsList from "@/app/components/listNews";
import CurrencyRates from "./CurrencyRates";
import WeatherWidget from "./WeatherWidget";
import { useHeroNews } from "@/app/hooks/useHeroNews";
import { formatNewsDate, formatFullNewsDate, generateArticleUrl, getUniversalNewsImageIntxt, getNewsTitle, getNewsTeaser, getUniversalNewsImageFull } from "@/app/lib/newsUtils";
import dayjs from 'dayjs';
import 'dayjs/locale/uk';

import arrowRight from "@/assets/icons/arrowRight.svg";
import roundArrowRight from "@/assets/icons/roundArrowRight.svg";
import roundArrowLeft from "@/assets/icons/roundArrowLeft.svg";
import adBannerIndfomo from '@/assets/images/Ad Banner white.png';

import styles from './Hero.module.scss';

dayjs.locale('uk');

export default function Hero() {
  const carouselRef = useRef<any>(null);
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const { heroNews, loading: heroLoading, error: heroError } = useHeroNews();
  const [newsData, setNewsData] = useState<Array<{ id: string; title: string; time: string; imageUrl?: string; url: string }>>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Transform hero news data for the news lists
  useEffect(() => {
    if (heroNews && heroNews.length > 0) {
      const transformedNews = heroNews.map((item) => {
        const imageUrl = getUniversalNewsImageFull(item);
        
        return {
          id: item.id,
          title: getNewsTitle(item),
          time: formatFullNewsDate(item.ndate, item.ntime),
          imageUrl: imageUrl,
          url: generateArticleUrl(item),
        };
      });
      

      
      setNewsData([...transformedNews]);
    }
  }, [heroNews]);

  const onChange = (currentSlide: number) => {
    // console.log(currentSlide);
  };

  const handleCarouselClick = (url: string) => {
    router.push(url);
  };

  // Transform hero news for carousel
  const carouselItems = heroNews.slice(0, 4).map((item) => ({
    src: getUniversalNewsImageFull(item),
    title: getNewsTitle(item),
    url: generateArticleUrl(item),
  }));

  // Fallback carousel items if no hero news
  const fallbackCarouselItems = [
    {
      src: "",
      title: "У Львові запрацював сучасний центр реабілітації для онкопацієнтів",
      url: "/article/lviv-rehabilitation-center-hero",
    },
    {
      src: "",
      title: "Новий парк відкрили у центрі міста з унікальними зонами відпочинку",
      url: "/article/lviv-city-park-hero",
    },
    {
      src: "",
      title: "Архітектурний проект: реставрація історичних будівель Львова",
      url: "/article/lviv-architecture-restoration-hero",
    },
    {
      src: "",
      title: "Екологічна ініціатива: створення зелених зон у місті",
      url: "/article/lviv-eco-initiative-hero",
    },
  ];

  const finalCarouselItems = carouselItems.length > 0 ? carouselItems : fallbackCarouselItems;

  const contentStyle: React.CSSProperties = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
  };

  // Show loading state
  if (heroLoading) {
    return (
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroBox}>
            <div className={styles.carouselBox}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <p>Завантаження новин...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (heroError) {
    console.error('Hero news error:', heroError);
  }

  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.heroBox}>
          <div className={styles.carouselBox}>
            <Carousel
              afterChange={onChange}
              autoplay
              ref={carouselRef}
            >
              {finalCarouselItems.map((item, index) => (
                <div key={index} className={styles.carouselItem}>
                  <div 
                    onClick={() => handleCarouselClick(item.url)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img alt={'img'} src={item.src} className={styles.heroImg}/>
                  </div>
                  <div 
                    className={styles.carouselContent}
                    onClick={() => handleCarouselClick(item.url)}
                    style={{ cursor: 'pointer' }}
                  >
                    <p className={styles.carouselTime}>
                      {heroNews[index] ? formatNewsDate(heroNews[index].ndate, heroNews[index].udate) : '15 хвилин тому'}
                    </p>
                    <h3 className={styles.carouselTitle}>{item.title}</h3>
                  </div>
                  <button
                    onClick={() => carouselRef.current?.next()}
                    className={styles.rightArrowButton}
                  >
                    <Image
                      src={roundArrowRight}
                      alt="Right arrow"
                      width={44}
                      height={44}
                    />
                  </button>
                  <button
                    onClick={() => carouselRef.current?.prev()}
                    className={styles.leftArrowButton}
                  >
                    <Image
                      src={roundArrowLeft}
                      alt="Left arrow"
                      width={44}
                      height={44}
                    />
                  </button>
                </div>
              ))}
            </Carousel>
          </div>
          <div className={styles.infoSection}>
            <CurrencyRates />
            <WeatherWidget />
          </div>
        </div>
      </div>
      <div className={styles.containerHeroInfo}>
        {heroLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <p>Завантаження новин...</p>
          </div>
        ) : (
          <NewsList
            showSeparator={true}
            data={newsData}
            showImagesAt={isMobile ? [] : [3]}
            widthPercent={isMobile ? 100 : 45}
            showMoreButton={false}
          />
        )}

        {heroLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
            <p>Завантаження...</p>
          </div>
        ) : (
          <NewsList
            title="ЕКОНОМІКА"
            moreButtonUrl="/economics"
            data={newsData}
            arrowRightIcon
            showImagesAt={[0, 1]}
            widthPercent={isMobile ? 100 : 25}
            showMoreButton
          />
        )}

        {isMobile &&
            <>
              <div className={styles.rightSeparator}></div>              
                <Image 
                src={adBannerIndfomo} 
                alt="IN-FOMO Banner" 
                width={600} 
                height={240} 
                className={styles.fomoLogo}
                priority={false}
              />
          </>
        }
        {heroLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
            <p>Завантаження...</p>
          </div>
        ) : (
          <NewsList
            mobileLayout="horizontal"
            data={newsData}
            showImagesAt={[0, 1]}
            widthPercent={isMobile ? 100 : 25}
            title="НОВИНИ ЛЬВОВА"
            showMoreButton
            arrowRightIcon
            moreButtonUrl="/lviv-news"
          />
        )}
      </div>
    </section>
  )
}




