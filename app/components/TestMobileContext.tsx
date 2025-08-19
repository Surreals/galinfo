'use client';

import React from 'react';
import { useMobileContext } from '@/app/contexts/MobileContext';

export const TestMobileContext: React.FC = () => {
  const { isMobile } = useMobileContext();

  return (
    <div className="p-4 border rounded-lg bg-gray-100">
      <h3 className="text-lg font-semibold mb-2">Тест MobileContext</h3>
      <div className="space-y-2">
        <p><strong>Поточний пристрій:</strong> {isMobile ? '📱 Мобільний' : '💻 Десктоп'}</p>
        <p><strong>Ширина екрану:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}px` : 'N/A'}</p>
        <p><strong>Breakpoint:</strong> {isMobile ? '≤ 768px' : '> 768px'}</p>
      </div>
      
      <div className="mt-4 p-3 rounded bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-800">
          Цей компонент автоматично отримує <code>isMobile</code> значення з контексту, 
          без необхідності імпортувати <code>useIsMobile</code> хук!
        </p>
      </div>
    </div>
  );
};
