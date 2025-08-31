'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AccentSquare, ViewAllButton } from '@/app/shared';
import styles from './CategoryNews.module.css';
import { useState, useEffect } from 'react';

// Інтерфейси для типізації даних
export interface CategoryNewsItem {
  id: string;
  title: string;
  date: string;
  time: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
  isImportant?: boolean;
}

export interface CategoryNewsProps {
  category: string;
  categoryId?: number;
  news?: CategoryNewsItem[];
  isLoading?: boolean;
  hideHeader?: boolean;
  className?: string; // Додаємо можливість передавати додатковий CSS клас
  height?: number;
  mobileLayout?: 'column' | 'horizontal'; // Новий пропс для контролю мобільного відображення
  isMobile?: boolean;
}

export default function CategoryNews({ 
  category = "КУЛЬТУРА", 
  news = [], 
  isLoading = false,
  hideHeader = false,
  height = 200,
  className = "",
  mobileLayout = 'column', // За замовчуванням - колонка (по дві новини в рядок з квадратними фото)
  isMobile = false
}: CategoryNewsProps) {
  // Визначаємо, чи потрібно показувати горизонтальне відображення
  // Горизонтальне відображення застосовується тільки на мобільних пристроях
  const [isMobileResize, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shouldShowHorizontal = isMobileResize && mobileLayout === 'horizontal';
  // Мокові дані для прикладу (будуть замінені на реальні дані)
  const mockNews: CategoryNewsItem[] = [
    {
      id: '1',
      title: 'Війна на сході: як ІТ-інновації змінюють стратегію оборони',
      date: '04 липня 2025',
      time: '11:15',
      url: '/article/it-innovations-war',
      imageUrl: 'https://picsum.photos/300/200?random=1',
      imageAlt: 'Люди за столами на IT конференції'
    },
    {
      id: '2',
      title: 'Коли дрони стали частиною війни: нові технології в бою',
      date: '03 липня 2025',
      time: '09:30',
      url: '/article/drones-war-technology',
      imageUrl: 'https://picsum.photos/300/200?random=2',
      imageAlt: 'Військовий у формі посміхається'
    },
    {
      id: '3',
      title: 'Як "Голуб" із "Нової пошти" став "Голубом війни"',
      date: '02 липня 2025',
      time: '14:54',
      url: '/article/golub-war-nova-poshta',
      imageUrl: 'https://picsum.photos/300/200?random=3',
      imageAlt: 'Сцена з актором на театральній виставі',
      isImportant: true
    },
    {
      id: '4',
      title: 'Війна на сході: як ІТ-інновації змінюють стратегію оборони',
      date: '04 липня 2025',
      time: '11:15',
      url: '/article/it-innovations-war-east',
      imageUrl: 'https://picsum.photos/300/200?random=4',
      imageAlt: 'Люди за столами на IT конференції'
    },
    {
      id: '5',
      title: 'Смертельна аварія в Бутинах і масове ДТП на трасі Львів-Винники',
      date: '02 липня 2025',
      time: '14:54',
      url: '/article/fatal-accident-butyne-lviv-vynnyky',
      imageUrl: 'https://picsum.photos/300/200?random=5',
      imageAlt: 'Дві машини в лобовому зіткненні на дорозі',
      isImportant: true
    },
    {
      id: '6',
      title: 'Міноборони кодифікувало та допустило до експлуатації бойовий модуль "Хижак"',
      date: '03 липня 2025',
      time: '09:30',
      url: '/article/ministry-defense-hunter-module',
      imageUrl: 'https://picsum.photos/300/200?random=6',
      imageAlt: 'Металевий промисловий пристрій на цегляній стіні',
      isImportant: true
    },
    {
      id: '7',
      title: 'Смертельна аварія в Бутинах і масове ДТП на трасі Львів-Винники',
      date: '02 липня 2025',
      time: '14:54',
      url: '/article/fatal-accident-butyne-lviv-vynnyky-2',
      imageUrl: 'https://picsum.photos/300/200?random=7',
      imageAlt: 'Дві машини в лобовому зіткненні на дорозі'
    },
    {
      id: '8',
      title: 'Міноборони кодифікувало та допустило до експлуатації бойовий модуль "Хижак"',
      date: '03 липня 2025',
      time: '09:30',
      url: '/article/ministry-defense-hunter-module-2',
      imageUrl: 'https://picsum.photos/300/200?random=8',
      imageAlt: 'Металевий промисловий пристрій на цегляній стіні'
    }
  ];

  // Використовуємо реальні дані або мокові
  const displayNews = news.length > 0 ? news : mockNews;

  return (
    <section className={`${styles.categoryNewsSection} ${className}`}>
      <div className={styles.container}>
        {/* Заголовок секції */}
        {!hideHeader && (
          <div className={styles.header}>
            <AccentSquare className={styles.titleAccent} />
            <h2 className={styles.title}>{category}</h2>
          </div>
        )}

        {/* Сітка новин */}
        <div className={`${styles.newsGrid} ${shouldShowHorizontal ? styles.newsGridHorizontal : ''}`}>
          {isLoading ? (
            // Скелетон для завантаження
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={`${styles.newsItem} ${shouldShowHorizontal ? styles.newsItemHorizontal : ''}`}>
                <div 
                  className={styles.skeletonImage}
                  style={{
                    height: shouldShowHorizontal ? height : 'auto',
                    aspectRatio: shouldShowHorizontal ? 'auto' : '1'
                  }}
                ></div>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonDate}></div>
              </div>
            ))
          ) : (
            // Відображення новин
            displayNews.map((item) => (
              <article key={item.id} className={`${styles.newsItem} ${shouldShowHorizontal ? styles.newsItemHorizontal : ''}`}>
                <Link href={item.url} className={styles.newsLink}>
                  <div style={{
                    height: shouldShowHorizontal ? height : 'auto',
                  }} 
                  className={styles.imageContainer}>
                    <Image 
                      src={item.imageUrl} 
                      alt={item.imageAlt}
                      width={300}
                      height={shouldShowHorizontal ? height : 300}
                      className={styles.newsImage}
                    />
                    {item.isImportant && (
                      <div className={styles.importantTag}>
                        ВАЖЛИВО
                      </div>
                    )}
                  </div>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                  <time className={styles.newsDate}>
                    {item.date}, {item.time}
                  </time>
                </Link>
              </article>
            ))
          )}
        </div>

        {/* Кнопка "Всі новини з рубрики" */}
        {!hideHeader && (
          <>
            <ViewAllButton href={`/category/${category.toLowerCase()}`} />
            
            {/* Розділювальна лінія */}
            
          </>
        )}
        <div className={styles.separator}></div>
      </div>
    </section>
  );
}