import { useState, useEffect } from "react";

export type WeatherData = {
  temp: number; // Температура в градусах Цельсія
  city: string; // Назва міста
};

export const useWeather = (city: string) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://wttr.in/${city}?format=j1`);
        if (!res.ok) throw new Error("Не вдалося отримати дані про погоду");

        const data = await res.json();
        const current = data.current_condition[0];

        setWeather({
          temp: Math.round(Number(current.temp_C)),
          city,
        });
      } catch (err: any) {
        setError(err.message || "Помилка при завантаженні даних про погоду");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  return { weather, loading, error };
};