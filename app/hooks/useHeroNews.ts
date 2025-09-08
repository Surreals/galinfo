import { useState, useEffect } from 'react';

interface HeroNewsItem {
  id: string;
  ndate: string;
  ntime: string;
  ntype: number;
  images: Array<{
    urls: {
      full: string;
      intxt: string;
      tmb: string;
    };
  }>;
  urlkey: string;
  photo: string;
  video: string;
  udate: number;
  nheader: string;
  nteaser: string;
  sheader: string;
  steaser: string;
  qty: number;
  image_filenames: string;
}

interface HeroNewsResponse {
  heroNews: HeroNewsItem[];
}

export function useHeroNews() {
  const [heroNews, setHeroNews] = useState<HeroNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/homepage/hero-news');
        
        if (!response.ok) {
          throw new Error('Failed to fetch hero news');
        }
        
        const data: HeroNewsResponse = await response.json();
        setHeroNews(data.heroNews || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching hero news:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHeroNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroNews();
  }, []);

  return { heroNews, loading, error };
}
