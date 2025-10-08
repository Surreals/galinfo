'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Skeleton } from 'antd';

interface AdImageProps {
  advertisementId?: number;
  placement?: 'infomo' | 'sidebar' | 'general';
  width?: number;
  height?: number;
  className?: string;
}

interface Advertisement {
  id: number;
  title: string;
  image_url: string | null;
  link_url: string;
  placement: string;
}

const AdImage: React.FC<AdImageProps> = ({ 
  advertisementId,
  placement = 'general', 
  width = 728, 
  height = 90,
  className 
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
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className={className} style={{ width: '100%' }}>
        <Skeleton.Image 
          active 
          style={{ 
            width: '100%', 
            height: `${height}px`
          }} 
        />
      </div>
    );
  }

  if (!ad || !ad.image_url) {
    return null;
  }

  return (
    <a
      href={ad.link_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
      style={{ display: 'block', width: '100%' }}
    >
      <Image
        src={ad.image_url}
        alt={ad.title}
        width={width}
        height={height}
        style={{ width: '100%', height: 'auto' }}
      />
    </a>
  );
};

export default AdImage;

