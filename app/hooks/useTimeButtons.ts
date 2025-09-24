import { useState, useEffect } from 'react';
import { message } from 'antd';

export interface TimeButtonData {
  lastNewsTime: string | null;
  lastPublishedTime: string | null;
  serverTime: string | null;
  loading: boolean;
  error: string | null;
}

export interface UseTimeButtonsReturn {
  timeData: TimeButtonData;
  setLastNewsTime: (time: string) => void;
  setLastPublishedTime: (time: string) => void;
  setServerTime: (time: string) => void;
  refreshTimes: () => Promise<void>;
}

export function useTimeButtons(): UseTimeButtonsReturn {
  const [timeData, setTimeData] = useState<TimeButtonData>({
    lastNewsTime: null,
    lastPublishedTime: null,
    serverTime: null,
    loading: false,
    error: null,
  });

  // Функція для отримання часу останньої новини
  const fetchLastNewsTime = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/admin/news/last-time');
      if (!response.ok) throw new Error('Failed to fetch last news time');
      
      const data = await response.json();
      return data.lastNewsTime || null;
    } catch (error) {
      console.error('Error fetching last news time:', error);
      return null;
    }
  };

  // Функція для отримання часу останньої опублікованої новини
  const fetchLastPublishedTime = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/admin/news/last-published-time');
      if (!response.ok) throw new Error('Failed to fetch last published time');
      
      const data = await response.json();
      return data.lastPublishedTime || null;
    } catch (error) {
      console.error('Error fetching last published time:', error);
      return null;
    }
  };

  // Функція для отримання часу сервера
  const fetchServerTime = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/admin/server-time');
      if (!response.ok) throw new Error('Failed to fetch server time');
      
      const data = await response.json();
      return data.serverTime || null;
    } catch (error) {
      console.error('Error fetching server time:', error);
      return null;
    }
  };

  // Функція для оновлення всіх часів
  const refreshTimes = async (): Promise<void> => {
    setTimeData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [lastNewsTime, lastPublishedTime, serverTime] = await Promise.all([
        fetchLastNewsTime(),
        fetchLastPublishedTime(),
        fetchServerTime(),
      ]);

      setTimeData({
        lastNewsTime,
        lastPublishedTime,
        serverTime,
        loading: false,
        error: null,
      });
    } catch (error) {
      setTimeData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      message.error('Помилка отримання часу');
    }
  };

  // Функції для встановлення часу (для використання в кнопках)
  const setLastNewsTime = (time: string) => {
    setTimeData(prev => ({ ...prev, lastNewsTime: time }));
  };

  const setLastPublishedTime = (time: string) => {
    setTimeData(prev => ({ ...prev, lastPublishedTime: time }));
  };

  const setServerTime = (time: string) => {
    setTimeData(prev => ({ ...prev, serverTime: time }));
  };

  // Автоматичне оновлення при монтуванні компонента
  useEffect(() => {
    refreshTimes();
  }, []);

  return {
    timeData,
    setLastNewsTime,
    setLastPublishedTime,
    setServerTime,
    refreshTimes,
  };
}
