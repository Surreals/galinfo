import React from 'react';
import styles from './AdBanner.module.css';

interface AdBannerProps {
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ className }) => {
  return (
    <div className={`${styles.adBanner} ${className || ''}`}>
      {/* Дати зверху банеру */}
      <div className={styles.adDates}>
        <span className={styles.adDate}>03 липня 2025, 09:30</span>
        <span className={styles.adDate}>23 липня 2025, 09:30</span>
      </div>
      
      <div className={styles.adContent}>
        <div className={styles.adImage}>
          <div className={styles.imagePlaceholder}>
            <div className={styles.scenicImage}>
              <div className={styles.road}></div>
              <div className={styles.buildings}></div>
              <div className={styles.lake}></div>
              <div className={styles.mountains}></div>
              <div className={styles.goraLogo}>GORA</div>
              <div className={styles.sensarLogo}>sensarR DEVELOPMENT</div>
              <button className={styles.mainButton}>Отримати пропозицію</button>
            </div>
          </div>
        </div>
        <div className={styles.adText}>
          <h3 className={styles.adTitle}>Купити Будинок в Карпатах</h3>
          <p className={styles.adDescription}>
            Відпочинковий комплекс серед карпатських лісів на вершині гори. Отримай 12% Річних.
          </p>
          <div className={styles.adMeta}>
            <span className={styles.adBrand}>GORA</span>
            <button className={styles.adButton}>
              Відкрити
              <span className={styles.arrow}></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
