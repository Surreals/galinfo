import { useState, useEffect } from 'react';
import axios from 'axios';

export type RateRow = {
  currency: string;
  buy: number;
  sell: number;
  interbank: number;
};

export interface UseCurrencyRatesResult {
  rates: RateRow[] | null;
  loading: boolean;
  error: string | null;
}

const BASE_URL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';

export const useCurrencyRates = (currencies: string[]): UseCurrencyRatesResult => {
  const [rates, setRates] = useState<RateRow[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(BASE_URL);
        const data = response.data;

        const rows: RateRow[] = currencies.map((cur) => {
          const curData = data.find((item: any) => item.cc === cur);
          if (!curData) {
            return {
              currency: cur,
              buy: 0,
              sell: 0,
              interbank: 0,
            };
          }

          const baseRate = Number(curData.rate);

          return {
            currency: cur,
            buy: baseRate,              // офіційний курс НБУ
            sell: baseRate * 1.01,      // умовна надбавка 1%
            interbank: baseRate * 0.995 // умовна міжбанк ціна
          };
        });

        setRates(rows);
      } catch (e: any) {
        setError(e.message || 'Error fetching rates');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 👈 робимо запит лише раз

  return { rates, loading, error };
};