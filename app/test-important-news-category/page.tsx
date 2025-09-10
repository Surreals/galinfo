'use client';

import { 
  useImportantNewsByCategory,
  useLatestImportantNewsByCategory,
  useTopImportantNewsByCategory,
  usePhotoNewsByCategory,
  useIllustratedNewsByCategory,
  useAllImportantNewsByCategory
} from '@/app/hooks';
import { useState } from 'react';

export default function TestImportantNewsCategoryPage() {
  const [rubric, setRubric] = useState('109');
  const [limit, setLimit] = useState(5);
  const [lang, setLang] = useState('1');
  const [level, setLevel] = useState<number | undefined>(undefined);

  // Основний хук з усіма опціями
  const {
    data,
    loading,
    error,
    refetch,
    getLatestImportantNews,
    getTopImportantNews,
    getPhotoNews,
    getIllustratedNews,
    hasImportantNews,
    getNewsByLevel
  } = useImportantNewsByCategory({
    rubric,
    limit,
    lang,
    level,
    autoFetch: true
  });

  // Хук для останньої важливої новини
  const {
    data: latestData,
    loading: latestLoading,
    error: latestError
  } = useLatestImportantNewsByCategory(rubric, { lang });

  // Хук для топ важливої новини
  const {
    data: topData,
    loading: topLoading,
    error: topError
  } = useTopImportantNewsByCategory(rubric, { lang });

  // Хук для фото новини
  const {
    data: photoData,
    loading: photoLoading,
    error: photoError
  } = usePhotoNewsByCategory(rubric, { lang });

  // Хук для ілюстрованої новини
  const {
    data: illustratedData,
    loading: illustratedLoading,
    error: illustratedError
  } = useIllustratedNewsByCategory(rubric, { lang });

  // Хук для всіх важливих новин
  const {
    data: allData,
    loading: allLoading,
    error: allError
  } = useAllImportantNewsByCategory(rubric, { lang });

  const handleRubricChange = (newRubric: string) => {
    setRubric(newRubric);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
  };

  const handleLevelChange = (newLevel: string) => {
    setLevel(newLevel === '' ? undefined : parseInt(newLevel));
  };

  const rubricOptions = [
    { value: '109', label: 'Політика (109)' },
    { value: '100', label: 'Суспільство (100)' },
    { value: '4', label: 'Культура (4)' },
    { value: '101', label: 'Здоров\'я (101)' },
    { value: '102', label: 'Спорт (102)' },
    { value: '103', label: 'Економіка (103)' },
    { value: '104', label: 'Технології (104)' },
    { value: '105', label: 'Світ (105)' }
  ];

  const levelOptions = [
    { value: '', label: 'Всі рівні' },
    { value: '1', label: 'Високо важливі (1)' },
    { value: '2', label: 'Топ важливі (2)' },
    { value: '3', label: 'Фото новини (3)' },
    { value: '4', label: 'Ілюстровані (4)' }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Тестування хука useImportantNewsByCategory</h1>
        <div className="text-center">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Тестування хука useImportantNewsByCategory</h1>
        <div className="text-red-500 mb-4">Помилка: {error}</div>
        <button 
          onClick={refetch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Спробувати знову
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Тестування хука useImportantNewsByCategory</h1>

      {/* Контроли */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-3">Контроли</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Рубрика:</label>
            <select
              value={rubric}
              onChange={(e) => handleRubricChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {rubricOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ліміт:</label>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Мова:</label>
            <select
              value={lang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="1">Українська</option>
              <option value="2">Російська</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Рівень важливості:</label>
            <select
              value={level?.toString() || ''}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {levelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Основні важливі новини */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Важливі новини в рубриці "{rubric}" (ліміт: {limit})
        </h2>
        {data?.filters && (
          <div className="mb-4 text-sm text-gray-600">
            Знайдено {data.total} важливих новин
            {data.filters.level && ` (рівень важливості: ${data.filters.level})`}
          </div>
        )}
        <div className="space-y-4">
          {data?.importantNews.map((news) => (
            <div key={news.id} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{news.nheader}</h3>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                  Важливість: {news.nweight}
                </span>
              </div>
              {news.nsubheader && (
                <p className="text-gray-600 mb-2">{news.nsubheader}</p>
              )}
              <p className="text-sm text-gray-500 mb-2">{news.nteaser}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>ID: {news.id}</span>
                <span>Тип: {news.ntype}</span>
                <span>Рубрика: {news.rubric}</span>
                <span>Коментарі: {news.comments_count}</span>
                <span>Перегляди: {news.views_count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Спеціалізовані хуки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Остання важлива новина */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Остання важлива новина</h3>
          {latestLoading && <div>Завантаження...</div>}
          {latestError && <div className="text-red-500">Помилка: {latestError}</div>}
          {latestData?.importantNews?.[0] && (
            <div className="border-l-4 border-blue-500 pl-3 py-2">
              <h4 className="font-medium">{latestData.importantNews[0].nheader}</h4>
              <p className="text-sm text-gray-500">
                Важливість: {latestData.importantNews[0].nweight} | 
                ID: {latestData.importantNews[0].id}
              </p>
            </div>
          )}
        </div>

        {/* Топ важлива новина */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Топ важлива новина (рівень 2)</h3>
          {topLoading && <div>Завантаження...</div>}
          {topError && <div className="text-red-500">Помилка: {topError}</div>}
          {topData?.importantNews?.[0] && (
            <div className="border-l-4 border-yellow-500 pl-3 py-2">
              <h4 className="font-medium">{topData.importantNews[0].nheader}</h4>
              <p className="text-sm text-gray-500">
                Важливість: {topData.importantNews[0].nweight} | 
                ID: {topData.importantNews[0].id}
              </p>
            </div>
          )}
        </div>

        {/* Фото новина */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Фото новина (рівень 3)</h3>
          {photoLoading && <div>Завантаження...</div>}
          {photoError && <div className="text-red-500">Помилка: {photoError}</div>}
          {photoData?.importantNews?.[0] && (
            <div className="border-l-4 border-green-500 pl-3 py-2">
              <h4 className="font-medium">{photoData.importantNews[0].nheader}</h4>
              <p className="text-sm text-gray-500">
                Важливість: {photoData.importantNews[0].nweight} | 
                ID: {photoData.importantNews[0].id}
              </p>
            </div>
          )}
        </div>

        {/* Ілюстрована новина */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Ілюстрована новина (рівень 4)</h3>
          {illustratedLoading && <div>Завантаження...</div>}
          {illustratedError && <div className="text-red-500">Помилка: {illustratedError}</div>}
          {illustratedData?.importantNews?.[0] && (
            <div className="border-l-4 border-purple-500 pl-3 py-2">
              <h4 className="font-medium">{illustratedData.importantNews[0].nheader}</h4>
              <p className="text-sm text-gray-500">
                Важливість: {illustratedData.importantNews[0].nweight} | 
                ID: {illustratedData.importantNews[0].id}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Всі важливі новини */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Всі важливі новини (до 10)</h3>
        {allLoading && <div>Завантаження...</div>}
        {allError && <div className="text-red-500">Помилка: {allError}</div>}
        {allData && (
          <div className="space-y-2">
            {allData.importantNews.map((news) => (
              <div key={news.id} className="border-l-4 border-gray-400 pl-3 py-2">
                <h4 className="font-medium">{news.nheader}</h4>
                <p className="text-sm text-gray-500">
                  Важливість: {news.nweight} | ID: {news.id} | Рубрика: {news.rubric}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Додаткові методи */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Додаткові методи</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">getLatestImportantNews():</h4>
            {getLatestImportantNews() ? (
              <div className="text-sm text-gray-600">
                {getLatestImportantNews()?.nheader}
              </div>
            ) : (
              <div className="text-sm text-gray-400">Немає даних</div>
            )}
          </div>
          <div>
            <h4 className="font-medium mb-2">getTopImportantNews():</h4>
            {getTopImportantNews() ? (
              <div className="text-sm text-gray-600">
                {getTopImportantNews()?.nheader}
              </div>
            ) : (
              <div className="text-sm text-gray-400">Немає даних</div>
            )}
          </div>
          <div>
            <h4 className="font-medium mb-2">hasImportantNews:</h4>
            <div className="text-sm text-gray-600">
              {hasImportantNews ? 'Так' : 'Ні'}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">getNewsByLevel(2):</h4>
            <div className="text-sm text-gray-600">
              {getNewsByLevel(2).length} новин з рівнем важливості 2
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка оновлення */}
      <div className="mt-6">
        <button
          onClick={refetch}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Оновити дані
        </button>
      </div>
    </div>
  );
}
