"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Carousel } from 'antd';
import NewsList from "@/app/components/listNews";
import CurrencyRates from "./CurrencyRates";
import WeatherWidget from "./WeatherWidget";
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

  const generateRandomNews = (count: number) => {
    const titles = [
      "Зеленський підписав новий закон Зеленський підписав новий закон ",
      "В Україні прогнозують грози Зеленський підписав новий закон",
      "Трамп дав нове інтерв'ю Зеленський підписав новий закон",
      "На Львівщині відкрили парк Зеленський підписав новий закон",
      "Вчені винайшли новий велосипед Зеленський підписав новий закон",
      "Новий арт-проєкт у центрі Києва Зеленський підписав новий закон",
    ];

    const articleIds = [
      "zelensky-new-law-hero",
      "ukraine-thunderstorms-hero",
      "trump-interview-hero",
      "lviv-region-park-hero",
      "scientists-bicycle-hero",
      "kyiv-art-project-hero"
    ];

    return Array.from({ length: count }, (_, index) => {
      const randomPastMs = Math.floor(Math.random() * 1e8);
      return {
        id: `hero-${index + 1}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        time: dayjs(Date.now() - randomPastMs).format('DD MMMM YYYY HH:mm'),
        imageUrl: `https://picsum.photos/seed/${Math.random()}/300/200`,
        url: `/article/${articleIds[Math.floor(Math.random() * articleIds.length)]}-${index + 1}`,
      };
    });
  };

  useEffect(() => {
    // Generate client-only to avoid SSR hydration mismatches
    setNewsData(generateRandomNews(8));
  }, []);

  const onChange = (currentSlide: number) => {
    console.log(currentSlide);
  };

  const handleCarouselClick = (url: string) => {
    router.push(url);
  };

  const carouselItems = [
    {
      src: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Місто
      title: "У Львові запрацював сучасний центр реабілітації для онкопацієнтів",
      url: "/article/lviv-rehabilitation-center-hero",
    },
    {
      src: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      title: "Новий парк відкрили у центрі міста з унікальними зонами відпочинку",
      url: "/article/lviv-city-park-hero",
    },
    {
      src: "https://images.pexels.com/photos/1679646/pexels-photo-1679646.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      title: "Архітектурний проект: реставрація історичних будівель Львова",
      url: "/article/lviv-architecture-restoration-hero",
    },
    {
      src: "https://images.pexels.com/photos/2356040/pexels-photo-2356040.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      title: "Екологічна ініціатива: створення зелених зон у місті",
      url: "/article/lviv-eco-initiative-hero",
    },
  ];

  const contentStyle: React.CSSProperties = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
  };

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
              {carouselItems.map((item, index) => (
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
                    <p className={styles.carouselTime}>15 хвилин тому</p>
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
        <NewsList
          showSeparator={true}
          data={newsData}
          showImagesAt={isMobile ? [] : [3]}
          widthPercent={isMobile ? 100 : 45}
          showMoreButton={false}
        />

        <NewsList
          title="ЕКОНОМІКА"
          moreButtonUrl="/economics"
          data={newsData}
          arrowRightIcon
          showImagesAt={[0, 1]}
          widthPercent={isMobile ? 100 : 25}
          showMoreButton
        />

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
      </div>
    </section>
  )
}