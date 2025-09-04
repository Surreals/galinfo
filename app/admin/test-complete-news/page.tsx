'use client';

import React, { useState } from 'react';
import { useCompleteNewsData } from '@/app/hooks/useCompleteNewsData';
import { getArticleType, getArticleTypeName, VALID_ARTICLE_TYPES } from '@/app/lib/articleUtils';
import styles from './test-complete-news.module.css';

export default function TestCompleteNewsPage() {
  const [articleType, setArticleType] = useState('news');
  const [urlkey, setUrlkey] = useState('');
  const [id, setId] = useState('');
  const [lang, setLang] = useState('1');
  const [includeRelated, setIncludeRelated] = useState(true);
  const [includeAuthor, setIncludeAuthor] = useState(true);
  const [includeStatistics, setIncludeStatistics] = useState(true);

  const {
    data,
    loading,
    error,
    refetch,
    getImageByIndex,
    getRubricByIndex,
    getTagByIndex,
    getRelatedNewsByIndex,
    hasImages,
    hasRubrics,
    hasTags,
    hasRelatedNews,
    hasAuthor,
    isImportant,
    isPhotoNews,
    isVideoNews,
    isBlogPost
  } = useCompleteNewsData({
    articleType,
    urlkey,
    id: parseInt(id) || 0,
    lang,
    autoFetch: false,
    includeRelated,
    includeAuthor,
    includeStatistics
  });

  const handleFetch = () => {
    if (articleType && urlkey && id) {
      refetch();
    }
  };

  const articleTypes = VALID_ARTICLE_TYPES.map(type => ({
    value: type,
    label: getArticleTypeName(type, lang)
  }));

  const languages = [
    { value: '1', label: 'Українська' },
    { value: '2', label: 'English' },
    { value: '3', label: 'Русский' }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Тест повних даних новини</h1>
      
      {/* Форма для введення параметрів */}
      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Тип статті:</label>
          <select className={styles.formSelect} value={articleType} onChange={(e) => setArticleType(e.target.value)}>
            {articleTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>URL Key:</label>
          <input
            className={styles.formInput}
            type="text"
            value={urlkey}
            onChange={(e) => setUrlkey(e.target.value)}
            placeholder="наприклад: test-article"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>ID:</label>
          <input
            className={styles.formInput}
            type="number"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="наприклад: 12345"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Мова:</label>
          <select className={styles.formSelect} value={lang} onChange={(e) => setLang(e.target.value)}>
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.checkboxes}>
          <label className={styles.checkboxLabel}>
            <input
              className={styles.checkboxInput}
              type="checkbox"
              checked={includeRelated}
              onChange={(e) => setIncludeRelated(e.target.checked)}
            />
            Включити пов'язані новини
          </label>
          <label className={styles.checkboxLabel}>
            <input
              className={styles.checkboxInput}
              type="checkbox"
              checked={includeAuthor}
              onChange={(e) => setIncludeAuthor(e.target.checked)}
            />
            Включити інформацію про автора
          </label>
          <label className={styles.checkboxLabel}>
            <input
              className={styles.checkboxInput}
              type="checkbox"
              checked={includeStatistics}
              onChange={(e) => setIncludeStatistics(e.target.checked)}
            />
            Включити статистику
          </label>
        </div>

        <button className={styles.fetchButton} onClick={handleFetch} disabled={loading || !articleType || !urlkey || !id}>
          {loading ? 'Завантаження...' : 'Завантажити дані'}
        </button>
      </div>

      {/* Відображення помилок */}
      {error && (
        <div className={styles.error}>
          <h3 className={styles.errorTitle}>Помилка:</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Відображення даних */}
      {data && (
        <div className={styles.data}>
          <h2 className={styles.dataTitle}>Результат</h2>
          
          {/* Основна інформація */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Основна інформація</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>ID:</span> {data.article.id}</div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>URL Key:</span> {data.article.urlkey}</div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Тип:</span> {data.article.ntype}</div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Мова:</span> {data.article.lang}</div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Дата:</span> {data.article.ndate}</div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Час:</span> {data.article.ntime}</div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Важливість:</span> {data.article.nweight}</div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Макет:</span> {data.article.layout}</div>
            </div>
          </div>

          {/* Контент */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Контент</h3>
            <div className={styles.content}>
              <h4 className={styles.contentTitle}>{data.article.nheader}</h4>
              {data.article.nsubheader && <h5 className={styles.contentSubtitle}>{data.article.nsubheader}</h5>}
              <p><span className={styles.infoLabel}>Тізер:</span> {data.article.nteaser}</p>
              <div className={styles.body}>
                <span className={styles.bodyLabel}>Текст:</span>
                <div dangerouslySetInnerHTML={{ __html: data.article.nbody }} />
              </div>
            </div>
          </div>

          {/* Мета-дані */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Мета-дані</h3>
            <div className={styles.meta}>
              <div className={styles.metaItem}><span className={styles.infoLabel}>Title:</span> {data.article.meta.title}</div>
              <div className={styles.metaItem}><span className={styles.infoLabel}>Description:</span> {data.article.meta.description}</div>
              <div className={styles.metaItem}><span className={styles.infoLabel}>Keywords:</span> {data.article.meta.keywords}</div>
            </div>
          </div>

          {/* Характеристики */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Характеристики</h3>
            <div className={styles.features}>
              <div className={`${styles.feature} ${hasImages ? styles.has : styles.none}`}>
                Зображення: {hasImages ? 'Є' : 'Немає'} ({data.article.images_data?.length || 0})
              </div>
              <div className={`${styles.feature} ${hasRubrics ? styles.has : styles.none}`}>
                Рубрики: {hasRubrics ? 'Є' : 'Немає'} ({data.article.rubrics?.length || 0})
              </div>
              <div className={`${styles.feature} ${hasTags ? styles.has : styles.none}`}>
                Теги: {hasTags ? 'Є' : 'Немає'} ({data.article.tags?.length || 0})
              </div>
              <div className={`${styles.feature} ${hasRelatedNews ? styles.has : styles.none}`}>
                Пов'язані: {hasRelatedNews ? 'Є' : 'Немає'} ({data.article.relatedNews?.length || 0})
              </div>
              <div className={`${styles.feature} ${hasAuthor ? styles.has : styles.none}`}>
                Автор: {hasAuthor ? 'Є' : 'Немає'}
              </div>
              <div className={`${styles.feature} ${isImportant ? styles.has : styles.none}`}>
                Важлива: {isImportant ? 'Так' : 'Ні'}
              </div>
              <div className={`${styles.feature} ${isPhotoNews ? styles.has : styles.none}`}>
                Фотоновина: {isPhotoNews ? 'Так' : 'Ні'}
              </div>
              <div className={`${styles.feature} ${isVideoNews ? styles.has : styles.none}`}>
                Відеоновина: {isVideoNews ? 'Так' : 'Ні'}
              </div>
              <div className={`${styles.feature} ${isBlogPost ? styles.has : styles.none}`}>
                Блог: {isBlogPost ? 'Так' : 'Ні'}
              </div>
            </div>
          </div>

          {/* Зображення */}
          {hasImages && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Зображення</h3>
              <div className={styles.images}>
                {data.article.images_data.map((image, index) => (
                  <div key={image.id} className={styles.imageItem}>
                    <h4 className={styles.imageItemTitle}>Зображення {index + 1}</h4>
                    <div className={styles.imageItemField}><span className={styles.infoLabel}>ID:</span> {image.id}</div>
                    <div className={styles.imageItemField}><span className={styles.infoLabel}>Файл:</span> {image.filename}</div>
                    <div className={styles.imageItemField}><span className={styles.infoLabel}>Заголовок:</span> {image.title}</div>
                    <div className={styles.imageItemField}><span className={styles.infoLabel}>URLs:</span></div>
                    <ul className={styles.imageItemList}>
                      <li>Full: {image.urls.full}</li>
                      <li>Intxt: {image.urls.intxt}</li>
                      <li>Thumb: {image.urls.tmb}</li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Рубрики */}
          {hasRubrics && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Рубрики</h3>
              <div className={styles.rubrics}>
                {data.article.rubrics.map((rubric, index) => (
                  <div key={rubric.id} className={styles.rubricItem}>
                    <h4 className={styles.rubricItemTitle}>Рубрика {index + 1}</h4>
                    <div className={styles.rubricItemField}><span className={styles.infoLabel}>ID:</span> {rubric.id}</div>
                    <div className={styles.rubricItemField}><span className={styles.infoLabel}>Param:</span> {rubric.param}</div>
                    <div className={styles.rubricItemField}><span className={styles.infoLabel}>Назва:</span> {rubric.title}</div>
                    <div className={styles.rubricItemField}><span className={styles.infoLabel}>Тип:</span> {rubric.cattype}</div>
                    {rubric.description && <div className={styles.rubricItemField}><span className={styles.infoLabel}>Опис:</span> {rubric.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Теги */}
          {hasTags && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Теги</h3>
              <div className={styles.tags}>
                {data.article.tags.map((tag, index) => (
                  <div key={tag.id} className={styles.tagItem}>
                    <span className={styles.tag}>{tag.tag}</span>
                    <span className={styles.tagInfo}>(ID: {tag.id})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Автор */}
          {hasAuthor && data.article.author && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Автор</h3>
              <div className={styles.author}>
                <div className={styles.authorField}><span className={styles.infoLabel}>ID:</span> {data.article.author.id}</div>
                <div className={styles.authorField}><span className={styles.infoLabel}>Ім'я:</span> {data.article.author.name}</div>
                {data.article.author.avatar && <div className={styles.authorField}><span className={styles.infoLabel}>Аватар:</span> {data.article.author.avatar}</div>}
                {data.article.author.twowords && <div className={styles.authorField}><span className={styles.infoLabel}>Два слова:</span> {data.article.author.twowords}</div>}
                {data.article.author.link && <div className={styles.authorField}><span className={styles.infoLabel}>Посилання:</span> {data.article.author.link}</div>}
              </div>
            </div>
          )}

          {/* Статистика */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Статистика</h3>
            <div className={styles.statistics}>
              <div className={styles.statisticsItem}><span className={styles.statisticsLabel}>Коментарі:</span> {data.article.statistics.comments_count}</div>
              <div className={styles.statisticsItem}><span className={styles.statisticsLabel}>Перегляди:</span> {data.article.statistics.views_count}</div>
              <div className={styles.statisticsItem}><span className={styles.statisticsLabel}>Рейтинг:</span> {data.article.statistics.rating}</div>
            </div>
          </div>

          {/* Пов'язані новини */}
          {hasRelatedNews && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Пов'язані новини</h3>
              <div className={styles.relatedNews}>
                {data.article.relatedNews.map((related, index) => (
                  <div key={related.id} className={styles.relatedItem}>
                    <h4 className={styles.relatedItemTitle}>Пов'язана новина {index + 1}</h4>
                    <div className={styles.relatedItemField}><span className={styles.infoLabel}>ID:</span> {related.id}</div>
                    <div className={styles.relatedItemField}><span className={styles.infoLabel}>URL Key:</span> {related.urlkey}</div>
                    <div className={styles.relatedItemField}><span className={styles.infoLabel}>Заголовок:</span> {related.nheader}</div>
                    <div className={styles.relatedItemField}><span className={styles.infoLabel}>Тізер:</span> {related.nteaser}</div>
                    <div className={styles.relatedItemField}><span className={styles.infoLabel}>Дата:</span> {related.ndate}</div>
                    <div className={styles.relatedItemField}><span className={styles.infoLabel}>Тип:</span> {related.ntype}</div>
                    {related.comments_count && <div className={styles.relatedItemField}><span className={styles.infoLabel}>Коментарі:</span> {related.comments_count}</div>}
                    {related.views_count && <div className={styles.relatedItemField}><span className={styles.infoLabel}>Перегляди:</span> {related.views_count}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breadcrumbs */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Навігація (Breadcrumbs)</h3>
            <div className={styles.breadcrumbs}>
              {data.article.breadcrumbs.map((crumb, index) => (
                <div key={index} className={styles.breadcrumbItem}>
                  <span className={styles.breadcrumbType}>{crumb.type}:</span>
                  <span className={styles.breadcrumbTitle}>{crumb.title}</span>
                  <span className={styles.breadcrumbLink}>{crumb.link}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Макет */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Макет</h3>
            <div className={styles.layout}>
              <div className={styles.layoutItem}><span className={styles.infoLabel}>Pattern:</span> {data.layout.pattern}</div>
              <div className={styles.layoutItem}><span className={styles.infoLabel}>Image Class:</span> {data.layout.imageClass}</div>
              <div className={styles.layoutItem}><span className={styles.infoLabel}>Image Path:</span> {data.layout.imagePath}</div>
            </div>
          </div>

          {/* Мета-інформація */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Мета-інформація</h3>
            <div className={styles.metaInfo}>
              <div className={styles.metaInfoItem}><span className={styles.infoLabel}>Тип:</span> {data.meta.type}</div>
              <div className={styles.metaInfoItem}><span className={styles.infoLabel}>URL Key:</span> {data.meta.urlkey}</div>
              <div className={styles.metaInfoItem}><span className={styles.infoLabel}>ID:</span> {data.meta.id}</div>
              {data.meta.printUrl && <div className={styles.metaInfoItem}><span className={styles.infoLabel}>Print URL:</span> {data.meta.printUrl}</div>}
              {data.meta.editUrl && <div className={styles.metaInfoItem}><span className={styles.infoLabel}>Edit URL:</span> {data.meta.editUrl}</div>}
            </div>
          </div>

          {/* JSON даних */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Повні JSON дані</h3>
            <pre className={styles.json}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
