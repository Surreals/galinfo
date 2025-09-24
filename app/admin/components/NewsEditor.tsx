'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the TipTap editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface NewsData {
  id?: number;
  ndate: string;
  ntime: string;
  images: string;
  ntype: number;
  nauthor: number;
  nauthorplus: string;
  showauthor: number;
  rubric: string;
  region: string;
  theme: number;
  nweight: number;
  nocomment: number;
  hiderss: number;
  approved: number;
  lang: string;
  rated: number;
  urlkey: string;
  userid: number;
  layout: number;
  comments: number | null;
  bytheme: string;
  ispopular: number;
  supervideo: number;
  printsubheader: number;
  topnews: number;
  isexpert: number;
  photo: number;
  video: number;
  subrubric: number;
  imagescopy: string | null;
  suggest: number;
  headlineblock: number;
  twitter_status: string;
  youcode: string | null;
  _todel1: string;
  _todel2: string;
  _todel3: string;
  _stage: number;
  maininblock: number | null;
}

interface NewsHeaders {
  id?: number;
  nheader: string;
  nteaser: string;
  nsubheader: string;
  _stage: number;
}

interface NewsBody {
  id?: number;
  nbody: string;
}

interface NewsEditorProps {
  newsId?: number;
  onSave: (newsData: NewsData, headers: NewsHeaders, body: NewsBody) => void;
  onCancel: () => void;
  initialData?: {
    news: NewsData;
    headers: NewsHeaders;
    body: NewsBody;
  };
}

type TabType = 'main' | 'top-blocks' | 'metadata';

export default function NewsEditor({ newsId, onSave, onCancel, initialData }: NewsEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [newsData, setNewsData] = useState<NewsData>({
    ndate: new Date().toISOString().split('T')[0],
    ntime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    images: '',
    ntype: 1,
    nauthor: 0,
    nauthorplus: '',
    showauthor: 0,
    rubric: '1',
    region: '1',
    theme: 0,
    nweight: 0,
    nocomment: 0,
    hiderss: 0,
    approved: 0,
    lang: 'ua',
    rated: 0,
    urlkey: '',
    userid: 0,
    layout: 0,
    comments: null,
    bytheme: '',
    ispopular: 0,
    supervideo: 0,
    printsubheader: 0,
    topnews: 0,
    isexpert: 0,
    photo: 0,
    video: 0,
    subrubric: 0,
    imagescopy: null,
    suggest: 0,
    headlineblock: 0,
    twitter_status: 'draft',
    youcode: null,
    _todel1: '0',
    _todel2: '0',
    _todel3: '',
    _stage: 99, // Mark as created/edited from Next.js app
    maininblock: null,
  });

  const [headers, setHeaders] = useState<NewsHeaders>({
    nheader: '',
    nteaser: '',
    nsubheader: '',
    _stage: 99, // Mark as created/edited from Next.js app
  });

  const [body, setBody] = useState<NewsBody>({
    nbody: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Mock data for dropdowns - in real app, these would come from API
  const categories = [
    { id: '1', name: 'Суспільство', nameEn: 'Society' },
    { id: '2', name: 'Політика', nameEn: 'Politics' },
    { id: '3', name: 'Економіка', nameEn: 'Economy' },
    { id: '4', name: 'Статті', nameEn: 'Articles' },
    { id: '5', name: 'Культура', nameEn: 'Culture' },
    { id: '6', name: 'Інтерв\'ю', nameEn: 'Interview' },
    { id: '7', name: 'Здоров\'я', nameEn: 'Health' },
    { id: '8', name: 'Війна з Росією', nameEn: 'War with Russia' },
    { id: '9', name: 'Спорт', nameEn: 'Sport' },
  ];

  const regions = [
    { id: '1', name: 'Україна', nameEn: 'Ukraine' },
    { id: '2', name: 'Львів', nameEn: 'Lviv' },
    { id: '3', name: 'Європа', nameEn: 'Europe' },
    { id: '4', name: 'Світ', nameEn: 'World' },
    { id: '5', name: 'Волинь', nameEn: 'Volyn' },
  ];

  const authors = [
    { id: 1, name: 'Максим Бурич', nameEn: 'Maksym Burych' },
    { id: 2, name: 'блогери', nameEn: 'bloggers' },
  ];

  const priorities = [
    { id: 0, name: 'Звичайний', nameEn: 'Normal' },
    { id: 1, name: 'Високий', nameEn: 'High' },
    { id: 2, name: 'Критичний', nameEn: 'Critical' },
  ];

  const templates = [
    { id: 0, name: 'По замовчуванню', nameEn: 'Default' },
    { id: 1, name: 'Спеціальний', nameEn: 'Special' },
  ];

  // Prevent hydration mismatch by only rendering on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load initial data if editing existing news
  useEffect(() => {
    if (initialData && isClient) {
      setNewsData(initialData.news);
      setHeaders(initialData.headers);
      setBody(initialData.body);
    }
  }, [initialData, isClient]);

  // Generate URL key from header
  const generateUrlKey = (header: string) => {
    return header
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100);
  };

  const handleHeaderChange = (field: keyof NewsHeaders, value: string) => {
    const newHeaders = { ...headers, [field]: value };
    setHeaders(newHeaders);
    
    // Auto-generate URL key from header
    if (field === 'nheader' && !newsData.urlkey) {
      setNewsData(prev => ({
        ...prev,
        urlkey: generateUrlKey(value)
      }));
    }
  };

  const handleNewsDataChange = (field: keyof NewsData, value: any) => {
    setNewsData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!headers.nheader.trim()) {
      setError('News header is required');
      return;
    }

    if (!body.nbody.trim()) {
      setError('News body is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Set current timestamp
      const now = Math.floor(Date.now() / 1000);
      const updatedNewsData = {
        ...newsData,
        udate: now,
        urlkey: newsData.urlkey || generateUrlKey(headers.nheader)
      };

      await onSave(updatedNewsData, headers, body);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save news');
    } finally {
      setLoading(false);
    }
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="newsEditorContainer">
      <div className="editorHeader">
        <h1>Редагувати новину</h1>
      </div>

      {error && (
        <div className="errorMessage">
          {error}
        </div>
      )}

      <div className="editorMainContent">
        {/* Left Content Area */}
        <div className="contentArea">
          {/* Navigation Tabs */}
          <div className="tabNavigation">
            <button
              className={`tabButton ${activeTab === 'main' ? 'active' : ''}`}
              onClick={() => setActiveTab('main')}
            >
              Основні заголовки
            </button>
            <button
              className={`tabButton ${activeTab === 'top-blocks' ? 'active' : ''}`}
              onClick={() => setActiveTab('top-blocks')}
            >
              Для ТОР БЛОКІВ
            </button>
            <button
              className={`tabButton ${activeTab === 'metadata' ? 'active' : ''}`}
              onClick={() => setActiveTab('metadata')}
            >
              Мета дані
            </button>
          </div>

          {/* Tab Content */}
          <div className="tabContent">
            {activeTab === 'main' && (
              <div className="mainTab">
                {/* Headline Section */}
                <div className="formSection">
                  <label className="formLabel">
                    Заголовок({getCharacterCount(headers.nheader)})
                  </label>
                  <input
                    type="text"
                    className="headlineInput"
                    value={headers.nheader}
                    onChange={(e) => handleHeaderChange('nheader', e.target.value)}
                    placeholder="Введіть заголовок новини"
                  />
                </div>

                {/* Lead Section */}
                <div className="formSection">
                  <label className="formLabel">
                    Лід({getCharacterCount(headers.nteaser)})
                  </label>
                  <textarea
                    className="leadTextarea"
                    value={headers.nteaser}
                    onChange={(e) => handleHeaderChange('nteaser', e.target.value)}
                    placeholder="Введіть лід новини"
                    rows={4}
                  />
                </div>

                {/* Full News Text Section */}
                <div className="formSection">
                  <label className="formLabel">
                    Повний текст новини
                  </label>
                  <div className="richTextWrapper">
                    <RichTextEditor
                      value={body.nbody}
                      onChange={(content) => setBody({ nbody: content })}
                      placeholder="Введіть повний текст новини..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'top-blocks' && (
              <div className="topBlocksTab">
                <h3>Налаштування для ТОР БЛОКІВ</h3>
                <p>Тут будуть налаштування для топ блоків новин</p>
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="metadataTab">
                <h3>Мета дані новини</h3>
                <p>Тут будуть мета дані новини</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="sidebar">
          {/* Language Selector */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Мова</label>
            <select
              className="sidebarSelect"
              value={newsData.lang}
              onChange={(e) => handleNewsDataChange('lang', e.target.value)}
            >
              <option value="ua">УКР</option>
              <option value="en">ENG</option>
            </select>
          </div>

          {/* Article Type */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Тип статті</label>
            <select
              className="sidebarSelect"
              value={newsData.ntype}
              onChange={(e) => handleNewsDataChange('ntype', parseInt(e.target.value))}
            >
              <option value={1}>Новина</option>
              <option value={2}>Стаття</option>
              <option value={3}>Інтерв'ю</option>
            </select>
          </div>

          {/* Image Indicator */}
          <div className="sidebarSection">
            <div className="imageIndicator">
              <span className="cameraIcon">📷</span>
              <span className="imageCount">1</span>
            </div>
          </div>

          {/* Categories */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Рубрики</label>
            <select
              className="sidebarSelect"
              value={newsData.rubric}
              onChange={(e) => handleNewsDataChange('rubric', e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Регіон</label>
            <select
              className="sidebarSelect"
              value={newsData.region}
              onChange={(e) => handleNewsDataChange('region', e.target.value)}
            >
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Тема</label>
            <select 
              className="sidebarSelect"
              value={newsData.theme}
              onChange={(e) => handleNewsDataChange('theme', parseInt(e.target.value) || 0)}
            >
              <option value="0">Виберіть тему</option>
              <option value="1">Тема 1</option>
              <option value="2">Тема 2</option>
              <option value="3">Тема 3</option>
            </select>
          </div>

          {/* Tags */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Теги</label>
            <input
              type="text"
              className="sidebarInput"
              placeholder="Погода,Україна"
              value={newsData.bytheme}
              onChange={(e) => handleNewsDataChange('bytheme', e.target.value)}
            />
          </div>

          {/* Author Information */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Автор</label>
            <div className="authorSection">
              <div className="authorRow">
                <span className="authorLabel">Редактор:</span>
                <select
                  className="sidebarSelect"
                  value={newsData.nauthor}
                  onChange={(e) => handleNewsDataChange('nauthor', parseInt(e.target.value))}
                >
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>
              </div>
              <div className="authorRow">
                <span className="authorLabel">Автор / журналіст:</span>
                <select
                  className="sidebarSelect"
                  value={newsData.nauthor}
                  onChange={(e) => handleNewsDataChange('nauthor', parseInt(e.target.value))}
                >
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>
              </div>
              <div className="authorCheckbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newsData.showauthor === 1}
                    onChange={(e) => handleNewsDataChange('showauthor', e.target.checked ? 1 : 0)}
                  />
                  Відображати інформацію про автора
                </label>
              </div>
            </div>
          </div>

          {/* Article Priority */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Пріоритет статті</label>
            <select
              className="sidebarSelect"
              value={newsData.nweight}
              onChange={(e) => handleNewsDataChange('nweight', parseInt(e.target.value))}
            >
              {priorities.map(priority => (
                <option key={priority.id} value={priority.id}>{priority.name}</option>
              ))}
            </select>
          </div>

          {/* Template */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Шаблон</label>
            <select
              className="sidebarSelect"
              value={newsData.layout}
              onChange={(e) => handleNewsDataChange('layout', parseInt(e.target.value))}
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>

          {/* Additional Parameters */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Додаткові параметри</label>
            <div className="checkboxGroup">
              <label className="checkboxItem">
                <input
                  type="checkbox"
                  checked={newsData.headlineblock === 1}
                  onChange={(e) => handleNewsDataChange('headlineblock', e.target.checked ? 1 : 0)}
                />
                Головна стрічка
              </label>
              <label className="checkboxItem">
                <input
                  type="checkbox"
                  checked={newsData.maininblock === 1}
                  onChange={(e) => handleNewsDataChange('maininblock', e.target.checked ? 1 : 0)}
                />
                Блок в головній стрічці
              </label>
              <label className="checkboxItem">
                <input
                  type="checkbox"
                  checked={newsData.hiderss === 1}
                  onChange={(e) => handleNewsDataChange('hiderss', e.target.checked ? 1 : 0)}
                />
                НЕ транслювати в RSS
              </label>
              <label className="checkboxItem">
                <input
                  type="checkbox"
                  checked={newsData.nocomment === 1}
                  onChange={(e) => handleNewsDataChange('nocomment', e.target.checked ? 1 : 0)}
                />
                Заборонити коментарі
              </label>
              <label className="checkboxItem">
                <input
                  type="checkbox"
                  checked={newsData.maininblock === 1}
                  onChange={(e) => handleNewsDataChange('maininblock', e.target.checked ? 1 : 0)}
                />
                Головна в блоці рубрик
              </label>
            </div>
          </div>

          {/* Publication Time */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Час публікації</label>
            <div className="timeSection">
              <div className="timeRow">
                <span>Годин:</span>
                <select
                  className="timeSelect"
                  value={newsData.ntime.split(':')[0]}
                  onChange={(e) => {
                    const time = newsData.ntime.split(':');
                    time[0] = e.target.value;
                    handleNewsDataChange('ntime', time.join(':'));
                  }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span>Хвилин:</span>
                <select
                  className="timeSelect"
                  value={newsData.ntime.split(':')[1]}
                  onChange={(e) => {
                    const time = newsData.ntime.split(':');
                    time[1] = e.target.value;
                    handleNewsDataChange('ntime', time.join(':'));
                  }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dateRow">
                <span>Число:</span>
 <select
                  className="dateSelect"
                  value={new Date(newsData.ndate).getDate()}
                  onChange={(e) => {
                    const date = new Date(newsData.ndate);
                    date.setDate(parseInt(e.target.value));
                    handleNewsDataChange('ndate', date.toISOString().split('T')[0]);
                  }}
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <span>Місяць:</span>
                <select
                  className="dateSelect"
                  value={new Date(newsData.ndate).getMonth() + 1}
                  onChange={(e) => {
                    const date = new Date(newsData.ndate);
                    date.setMonth(parseInt(e.target.value) - 1);
                    handleNewsDataChange('ndate', date.toISOString().split('T')[0]);
                  }}
                >
                  {[
                    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
                    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
                  ].map((month, i) => (
                    <option key={i + 1} value={i + 1}>{month}</option>
                  ))}
                </select>
                <span>Рік:</span>
                <select
                  className="dateSelect"
                  value={new Date(newsData.ndate).getFullYear()}
                  onChange={(e) => {
                    const date = new Date(newsData.ndate);
                    date.setFullYear(parseInt(e.target.value));
                    handleNewsDataChange('ndate', date.toISOString().split('T')[0]);
                  }}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <option key={year} value={year}>{year}</option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Publishing Options */}
          <div className="sidebarSection">
            <label className="sidebarLabel">Публікація</label>
            <div className="checkboxGroup">
              <label className="checkboxItem">
                <input
                  type="checkbox"
                  checked={newsData.approved === 1}
                  onChange={(e) => handleNewsDataChange('approved', e.target.checked ? 1 : 0)}
                />
                Опублікувати на сайті
              </label>
              <label className="checkboxItem">
                <input
                  type="checkbox"
                  checked={newsData.twitter_status === 'published'}
                  onChange={(e) => handleNewsDataChange('twitter_status', e.target.checked ? 'published' : 'draft')}
                />
                Опублікувати в Twitter
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="bottomActions">
        <button
          onClick={handleSave}
          disabled={loading}
          className="saveButton"
        >
          ЗБЕРЕГТИ
        </button>
        <button className="lockButton">
          🔒
        </button>
        <button className="deleteButton">
          ВИДАЛИТИ
        </button>
      </div>
    </div>
  );
}
