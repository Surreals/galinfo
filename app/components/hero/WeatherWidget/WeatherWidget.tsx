import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import styles from './WeatherWidget.module.css';

export default function WeatherWidget() {
  const router = useRouter();

  useEffect(() => {
    // Function to load and execute the Sinoptik script
    const loadSinoptikScript = () => {
      // Remove existing script if it exists
      const existingScript = document.querySelector('script[src*="sinoptik.ua/api/informer"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create and load new script
      const script = document.createElement('script');
      script.src = 'https://sinoptik.ua/api/informer/content?loc=bwCOPQ6RZw3nbSVvbQPY2QFoCnFe2U3SPV&cem=cM=RGnJEbQjHPQ=V2nE5GMu4CndxPrNoBQhvbU3E2UDo';
      script.async = true;
      document.head.appendChild(script);
    };

    // Load script on mount and pathname changes
    loadSinoptikScript();

    // Listen for pathname changes
    const handleRouteChange = () => {
      loadSinoptikScript();
    };

    // Add event listener for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [router]);

  return (
    <div className={styles.weatherSection}>
      <div className={styles.titleBox}>
        <h4 className={styles.sectionTitle}>ПОГОДА</h4>
      </div>
      
      {/* Sinoptik Weather Informer */}
      <div className={styles.weatherContainer}>
        <link 
          rel="stylesheet" 
          href="https://sinoptik.ua/resources/informer/css/informer.css" 
        />
        
        <div className="sin-informer sin-informer_font-arial sin-informer_theme-light" data-lang="uk">
          <div className="sin-informer__header">
            <a className="sin-informer__logo-link" href="https://sinoptik.ua" target="_blank" rel="nofollow">
              <img 
                className="sin-informer__logo-image" 
                width="66" 
                height="20" 
                srcSet="https://sinoptik.ua/resources/informer/assets/icons/logo.png, https://sinoptik.ua/resources/informer/assets/icons/logo2x.png 2x" 
                src="https://sinoptik.ua/resources/informer/assets/icons/logo.png" 
                alt="Sinoptik - logo"
              />
            </a>
            <p className="sin-informer__date">Погода на найближчий час</p>
            <p className="sin-informer__time" data-format="24">
              <span className="sin-informer__time-icon"></span>
            </p>
          </div>
          
          <div className="sin-informer__main">
            <a className="sin-informer__entry" href="https://sinoptik.ua/pohoda/lviv" target="_blank" rel="nofollow">
              <p className="sin-informer__location"> Львів </p>
              <div className="sin-informer__primary" style={{display: "none"}}>
                <p className="sin-informer__local-time"></p>
                <p className="sin-informer__temp" data-unit="c"></p>
                <div className="sin-informer__condition" data-icon-path="https://sinoptik.ua/resources/informer/assets/icons/conditions"></div>
              </div>
              <div className="sin-informer__secondary" style={{display: "none"}}>
                <p className="sin-informer__marker sin-informer__marker_wind" data-unit="ms" data-suffix="м/с" data-directions="Західний,Північно-Західний,Північний,Північно-Східний,Східний,Південно-Східний,Південний,Південно-Західний,Штиль" title="Вітер">
                  <span className="sin-informer__marker-icon"></span>
                </p>
                <p className="sin-informer__marker sin-informer__marker_humidity" title="Волога">
                  <span className="sin-informer__marker-icon"></span>
                </p>
                <p className="sin-informer__marker sin-informer__marker_pressure" data-unit="mm-hg" data-suffix="мм" title="Тиск">
                  <span className="sin-informer__marker-icon"></span>
                </p>
              </div>
            </a>
            
            <a className="sin-informer__entry" href="https://sinoptik.ua/pohoda/ivano-frankivsk" target="_blank" rel="nofollow">
              <p className="sin-informer__location"> Івано-Франківськ </p>
              <div className="sin-informer__primary" style={{display: "none"}}>
                <p className="sin-informer__local-time"></p>
                <p className="sin-informer__temp" data-unit="c"></p>
                <div className="sin-informer__condition" data-icon-path="https://sinoptik.ua/resources/informer/assets/icons/conditions"></div>
              </div>
              <div className="sin-informer__secondary" style={{display: "none"}}>
                <p className="sin-informer__marker sin-informer__marker_wind" data-unit="ms" data-suffix="м/с" data-directions="Західний,Північно-Західний,Північний,Північно-Східний,Східний,Південно-Східний,Південний,Південно-Західний,Штиль" title="Вітер">
                  <span className="sin-informer__marker-icon"></span>
                </p>
                <p className="sin-informer__marker sin-informer__marker_humidity" title="Волога">
                  <span className="sin-informer__marker-icon"></span>
                </p>
                <p className="sin-informer__marker sin-informer__marker_pressure" data-unit="mm-hg" data-suffix="мм" title="Тиск">
                  <span className="sin-informer__marker-icon"></span>
                </p>
              </div>
            </a>
          </div>
          
          <div className="sin-informer__footer">
            Погода від <a className="sin-informer__domain-link" href="https://sinoptik.ua" target="_blank" rel="nofollow"> sinoptik.ua </a>
          </div>
        </div>
      </div>
    </div>
  );
}
