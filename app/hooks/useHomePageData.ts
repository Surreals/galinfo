'use client';

import { useState, useEffect } from 'react';

export interface HomePageData {
  enviro: any[];
  newsCount: number;
  categories: any[];
  languages: any[];
  treeData: any[];
  metaData: any[];
  patterns: {
    chief?: string;
    htmlHeader?: string;
    justList?: string;
  };
  mainCategories: any[];
  specialCategories: any[];
  environews: any[];
  latestNewsDate?: number;
  specialNews: any[];
  mainNews: any[];
  slideNews: any[];
  headlineNews: any[];
  popularNews: any[];
  suggestedNews: any[];
  adData: {
    home3001: { places: any[]; banners: any[] };
    home3002501: { places: any[]; banners: any[] };
    home300250: { places: any[]; banners: any[] };
  };
  pollData: any[];
  mediaBlock: any[];
  userNews: any[];
  rubricNews: {
    rubric4: { main?: any; additional: any[] };
    rubric3: { main?: any; additional: any[] };
    rubric2: { main?: any; additional: any[] };
    rubric103: { main?: any; additional: any[] };
    rubric5: { main?: any; additional: any[] };
    rubric101: { main?: any; additional: any[] };
  };
  pictures: {
    specialNews: any[];
    slideNews: any[];
    headlineNews: any[];
    popularNews: any[];
    suggestedNews: any[];
  };
}

export const useHomePageData = () => {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/homepage');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching home page data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
