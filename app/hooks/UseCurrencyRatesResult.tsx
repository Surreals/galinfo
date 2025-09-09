import { useState, useEffect } from 'react';
import axios from 'axios';

type RateRow = {
  currency: string;
  buy: number;
  sell: number;
  interbank: number;
};

interface UseCurrencyRatesResult {
  rates: RateRow[] | null;
  loading: boolean;
  error: string | null;
}

const API_KEY = 'YOUR_MINFIN_API_KEY';
const BASE_URL = 'https://api.minfin.com.ua/mb/latest';

export const useCurrencyRates = (currencies: string[]): UseCurrencyRatesResult => {
  const [rates, setRates] = useState<RateRow[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const params = { currency: currencies.join(',') };
        const response = await axios.get(`${BASE_URL}/${API_KEY}/`, { params });
        const data = response.data;

        const rows: RateRow[] = currencies.map((cur) => {
          const curData = data.cur[cur];
          return {
            currency: cur,
            buy: Number(curData.nbu_cc),        // приклад, може бути інше поле
            sell: Number(curData.bank_sell),    // приклад
            interbank: Number(curData.mbid),    // приклад
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
  }, [currencies]);

  return { rates, loading, error };
};
