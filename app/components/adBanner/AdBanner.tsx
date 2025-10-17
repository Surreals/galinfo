'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Skeleton } from 'antd';
import styles from './AdBanner.module.css';

interface AdBannerProps {
  className?: string;
  advertisementId?: number;
  placement?: string;
}

interface Advertisement {
  id: number;
  title: string;
  image_url: string | null;
  link_url: string;
  placement: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  className, 
  advertisementId,
  placement = 'adbanner' 
}) => {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        let response;
        
        // Якщо передано advertisementId - використовуємо його
        if (advertisementId) {
          response = await fetch(`/api/advertisements/${advertisementId}`);
        } else {
          // Інакше використовуємо placement
          response = await fetch(`/api/advertisements/by-placement?placement=${placement}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setAd(data.data);
        }
      } catch (error) {
        console.error('Error fetching advertisement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [advertisementId, placement]);

  const handleClick = async () => {
    if (ad) {
      // Відстеження кліку
      try {
        await fetch('/api/advertisements/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ad.id, type: 'click' }),
        });
        
        // Відкриваємо посилання
        window.open(ad.link_url, '_blank');
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className={`${styles.adBanner} ${className || ''}`}>
        <Skeleton.Button 
          active 
          block
          style={{ 
            width: '100%', 
            height: '185px',
            maxHeight: '185px',
            minWidth: '100%'
          }} 
        />
      </div>
    );
  }

  if (!ad) {
    return null;
  }

  return (
    <div className={`${styles.adBanner} ${className || ''}`} onClick={handleClick}>
      <div className={styles.adContent}>
        {ad.image_url && (
          <div className={styles.adImage}>
            <Image
              src={ad.image_url}
              alt={ad.title}
              width={728}
              height={185}
              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBanner;
