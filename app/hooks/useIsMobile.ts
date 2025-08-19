'use client';

import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Перевіряємо ширину екрану
      const isMobileByWidth = window.innerWidth <= 768;
      setIsMobile(isMobileByWidth);
    };

    // Перевіряємо одразу при завантаженні
    checkIsMobile();

    // Додаємо слухач для зміни розміру вікна
    window.addEventListener('resize', checkIsMobile);

    // Очищаємо слухач при розмонтуванні
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};
