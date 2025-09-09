'use client';

import { HeroRenderer } from '@/app/components';
import { heroSchema, heroInfoSchema, heroInfoMobileSchema } from '@/app/lib/heroSchema';
import { useState, useEffect } from 'react';

export default function TestHeroSchemaPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <h1>Тест Hero Schema</h1>
      <p>Поточна схема: {isMobile ? 'Мобільна' : 'Десктопна'}</p>
      
      <HeroRenderer 
        schema={heroSchema}
        infoSchema={isMobile ? heroInfoMobileSchema : heroInfoSchema}
        isMobile={isMobile}
      />
    </div>
  );
}
