'use client';

import { useLatestNews, useLatestNewsFirstPage, useLatestNewsWithLimit } from '@/app/hooks';
import { useState } from 'react';

export default function TestLatestNewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [lang, setLang] = useState('1');

  // Основний хук з пагінацією
  const {
    data,
    loading,
    error,
    refetch,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    getMainImage,
    hasImages,
    getImagesCount
  } = useLatestNews({
    page: currentPage,
    limit,
    lang,
    autoFetch: true
  });

  // Хук для першої сторінки
  const {
    data: firstPageData,
    loading: firstPageLoading,
    error: firstPageError
  } = useLatestNewsFirstPage({
    limit: 5,
    lang: '1'
  });

  // Хук з фіксованим лімітом
  const {
    data: limitedData,
    loading: limitedLoading,
    error: limitedError
  } = useLatestNewsWithLimit(3, {
    lang: '1'
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Тестування хука useLatestNews</h1>
        <div className="text-center">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Тестування хука useLatestNews</h1>
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
      <h1 className="text-2xl font-bold mb-6">Тестування хука useLatestNews</h1>

      {/* Контроли */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-3">Контроли</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Сторінка:</label>
            <input
              type="number"
              value={currentPage}
              onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
              className="w-full p-2 border rounded"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ліміт:</label>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
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
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={goToFirstPage}
            disabled={!data?.pagination.hasPrev}
            className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Перша
          </button>
          <button
            onClick={goToPrevPage}
            disabled={!data?.pagination.hasPrev}
            className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Попередня
          </button>
          <button
            onClick={goToNextPage}
            disabled={!data?.pagination.hasNext}
            className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Наступна
          </button>
          <button
            onClick={goToLastPage}
            disabled={!data?.pagination.hasNext}
            className="px-3 py-1 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Остання
          </button>
        </div>
      </div>

      {/* Основні новини з пагінацією */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Останні новини (сторінка {currentPage}, ліміт {limit})
        </h2>
        {data?.pagination && (
          <div className="mb-4 text-sm text-gray-600">
            Показано {data.news.length} з {data.pagination.total} новин 
            (сторінка {data.pagination.page} з {data.pagination.totalPages})
          </div>
        )}
        <div className="space-y-4">
          {data?.news.map((news) => {
            const mainImage = getMainImage(news);
            const hasNewsImages = hasImages(news);
            const imagesCount = getImagesCount(news);
            
            return (
              <div key={news.id} className="border p-4 rounded shadow-sm">
                <div className="flex gap-4">
                  {hasNewsImages && mainImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={mainImage.urls.intxt}
                        alt={mainImage.title}
                        className="w-32 h-24 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{news.nheader}</h3>
                    {news.nsubheader && (
                      <p className="text-gray-600 mb-2">{news.nsubheader}</p>
                    )}
                    <p className="text-sm text-gray-500 mb-2">{news.nteaser}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>ID: {news.id}</span>
                      <span>Тип: {news.ntype}</span>
                      <span>Рубрика: {news.rubric}</span>
                      <span>Важливість: {news.nweight}</span>
                      <span>Коментарі: {news.comments_count}</span>
                      <span>Перегляди: {news.views_count}</span>
                      {hasNewsImages && (
                        <span className="text-blue-600">Зображень: {imagesCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Перша сторінка (5 новин) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Перша сторінка (5 новин) - useLatestNewsFirstPage
        </h2>
        {firstPageLoading && <div>Завантаження...</div>}
        {firstPageError && <div className="text-red-500">Помилка: {firstPageError}</div>}
        {firstPageData && (
          <div className="space-y-2">
            {firstPageData.news.map((news) => (
              <div key={news.id} className="border-l-4 border-blue-500 pl-3 py-2">
                <h4 className="font-medium">{news.nheader}</h4>
                <p className="text-sm text-gray-500">ID: {news.id} | Рубрика: {news.rubric}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Фіксований ліміт (3 новини) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Фіксований ліміт (3 новини) - useLatestNewsWithLimit
        </h2>
        {limitedLoading && <div>Завантаження...</div>}
        {limitedError && <div className="text-red-500">Помилка: {limitedError}</div>}
        {limitedData && (
          <div className="space-y-2">
            {limitedData.news.map((news) => (
              <div key={news.id} className="border-l-4 border-green-500 pl-3 py-2">
                <h4 className="font-medium">{news.nheader}</h4>
                <p className="text-sm text-gray-500">ID: {news.id} | Рубрика: {news.rubric}</p>
              </div>
            ))}
          </div>
        )}
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
