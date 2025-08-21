'use client';

import React, { useState } from 'react';
import { useSingleNews, SingleNewsArticle } from '@/app/hooks/useSingleNews';
import { NewsImage } from '@/app/lib/imageUtils';
import styles from './NewsDetail.module.css';

interface NewsDetailProps {
  articleType: string;
  urlkey: string;
  id: number;
  lang?: string;
  className?: string;
}

export default function NewsDetail({
  articleType,
  urlkey,
  id,
  lang = '1',
  className = ''
}: NewsDetailProps) {
  const { data, loading, error, refetch } = useSingleNews({
    articleType,
    urlkey,
    id,
    lang,
    autoFetch: true
  });

  if (loading && !data) {
    return (
      <div className={`${styles.loadingContainer} ${className}`}>
        <div className={styles.loadingSpinner}></div>
        <p>Завантаження новини...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.errorContainer} ${className}`}>
        <div className={styles.errorMessage}>
          <h3>Помилка завантаження новини</h3>
          <p>{error}</p>
          <button onClick={refetch} className={styles.retryButton}>
            Спробувати ще раз
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${styles.emptyContainer} ${className}`}>
        <div className={styles.emptyMessage}>
          <h3>Новину не знайдено</h3>
          <p>Запитана новина не існує або була видалена.</p>
        </div>
      </div>
    );
  }

  const { article } = data;

  return (
    <div className={`${styles.newsDetailContainer} ${className}`}>
      {/* Заголовок */}
      <header className={styles.newsHeader}>
        <div className={styles.newsMeta}>
          <span className={styles.newsType}>
            {getNewsTypeLabel(article.ntype)}
          </span>
          <span className={styles.newsDate}>
            {formatDate(article.ndate)}
          </span>
        </div>
        
        <h1 className={styles.newsTitle}>{article.nheader}</h1>
        
        {article.nsubheader && (
          <h2 className={styles.newsSubtitle}>{article.nsubheader}</h2>
        )}
        
        {article.nteaser && (
          <p className={styles.newsTeaser}>{article.nteaser}</p>
        )}
      </header>

      {/* Галерея зображень */}
      {article.images && article.images.length > 0 && (
        <ImageGallery images={article.images} />
      )}

      {/* Основний контент */}
      <div className={styles.newsContent}>
        {article.nbody && (
          <div 
            className={styles.newsBody}
            dangerouslySetInnerHTML={{ __html: article.nbody }}
          />
        )}
      </div>

      {/* Мета-інформація */}
      <footer className={styles.newsFooter}>
        {/* Рубрики */}
        {article.rubrics && article.rubrics.length > 0 && (
          <div className={styles.newsRubrics}>
            <h4>Рубрики:</h4>
            <div className={styles.rubricsList}>
              {article.rubrics.map((rubric) => (
                <span key={rubric.id} className={styles.rubricTag}>
                  {rubric.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Теги */}
        {article.tags && article.tags.length > 0 && (
          <div className={styles.newsTags}>
            <h4>Теги:</h4>
            <div className={styles.tagsList}>
              {article.tags.map((tag) => (
                <span key={tag.id} className={styles.tagItem}>
                  #{tag.tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className={styles.newsStats}>
          {article.views_count > 0 && (
            <span className={styles.statItem}>
              👁 {article.views_count} переглядів
            </span>
          )}
          
          {article.comments_count > 0 && (
            <span className={styles.statItem}>
              💬 {article.comments_count} коментарів
            </span>
          )}
          
          {article.author_name && (
            <span className={styles.statItem}>
              ✍️ Автор: {article.author_name}
            </span>
          )}
        </div>
      </footer>

      {/* Пов'язані новини */}
      {article.relatedNews && article.relatedNews.length > 0 && (
        <section className={styles.relatedNews}>
          <h3>Пов'язані новини</h3>
          <div className={styles.relatedNewsGrid}>
            {article.relatedNews.map((related) => (
              <RelatedNewsCard key={related.id} news={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Компонент галереї зображень
function ImageGallery({ images }: { images: NewsImage[] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className={styles.imageGallery}>
      {/* Основне зображення */}
      <div className={styles.mainImageContainer}>
        <img
          src={currentImage.urls.intxt}
          alt={currentImage.title}
          className={styles.mainImage}
          onClick={openModal}
        />
        
        {/* Навігація */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className={`${styles.navButton} ${styles.prevButton}`}
              aria-label="Попереднє зображення"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className={`${styles.navButton} ${styles.nextButton}`}
              aria-label="Наступне зображення"
            >
              ›
            </button>
          </>
        )}
        
        {/* Лічильник */}
        {images.length > 1 && (
          <div className={styles.imageCounter}>
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Мініатюри */}
      {images.length > 1 && (
        <div className={styles.thumbnailsContainer}>
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentImageIndex(index)}
              className={`${styles.thumbnail} ${
                index === currentImageIndex ? styles.activeThumbnail : ''
              }`}
            >
              <img
                src={image.urls.tmb}
                alt={image.title}
                className={styles.thumbnailImg}
              />
            </button>
          ))}
        </div>
      )}

      {/* Модальне вікно для повноекранного перегляду */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              ×
            </button>
            
            <img
              src={currentImage.urls.full}
              alt={currentImage.title}
              className={styles.modalImage}
            />
            
            {images.length > 1 && (
              <div className={styles.modalNavigation}>
                <button onClick={prevImage} className={styles.modalNavButton}>
                  ‹
                </button>
                <span className={styles.modalCounter}>
                  {currentImageIndex + 1} / {images.length}
                </span>
                <button onClick={nextImage} className={styles.modalNavButton}>
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент для пов'язаної новини
function RelatedNewsCard({ news }: { news: any }) {
  return (
    <article className={styles.relatedNewsCard}>
      <h4 className={styles.relatedNewsTitle}>
        <a href={`/news/${news.urlkey}_${news.id}`}>
          {news.nheader}
        </a>
      </h4>
      {news.nteaser && (
        <p className={styles.relatedNewsTeaser}>{news.nteaser}</p>
      )}
      <span className={styles.relatedNewsDate}>
        {formatDate(news.ndate)}
      </span>
    </article>
  );
}

// Утилітні функції
function getNewsTypeLabel(type: number): string {
  const typeLabels: { [key: number]: string } = {
    1: 'Новина',
    2: 'Стаття',
    3: 'Фоторепортаж',
    4: 'Відео',
    5: 'Аудіо',
    6: 'Анонс',
    20: 'Блог',
    21: 'Медіа'
  };
  return typeLabels[type] || 'Новина';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
