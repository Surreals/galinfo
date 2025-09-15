import { useState, useEffect, useCallback } from "react";

export type WeatherData = {
  temp: number;   // середня температура в градусах Цельсія
  city: string;   // назва міста
};

export const useWeather = (city: string) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!city) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      if (!res.ok) throw new Error("Не вдалося отримати дані про погоду");

      const data = await res.json();

      const days = Array.isArray(data.weather) ? data.weather : [];
      if (!days.length) throw new Error("Немає даних про погоду");

      const lastDay = days.reduce((latest: any, day: any) => {
        return !latest || new Date(day.date) > new Date(latest.date) ? day : latest;
      }, null);

      if (!lastDay) throw new Error("Неможливо визначити останній день");

      setWeather({
        temp: Math.round(Number(lastDay.avgtempC)),
        city,
      });
    } catch (err: any) {
      setError(err.message || "Помилка при завантаженні даних про погоду");
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { weather, loading, error, refetch: fetchWeather };
};
