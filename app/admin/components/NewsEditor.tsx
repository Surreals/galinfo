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
  lang: number;
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

export default function NewsEditor({ newsId, onSave, onCancel, initialData }: NewsEditorProps) {
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
    lang: 1,
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
    _stage: 0,
    maininblock: null,
  });

  const [headers, setHeaders] = useState<NewsHeaders>({
    nheader: '',
    nteaser: '',
    nsubheader: '',
    _stage: 0,
  });

  const [body, setBody] = useState<NewsBody>({
    nbody: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

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

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="editorContainer">
      <div className="editorHeader">
        <h2>{newsId ? 'Edit News' : 'Create New News'}</h2>
        <div className="headerActions">
          <button
            onClick={handleSave}
            disabled={loading}
            className="saveButton"
          >
            {loading ? 'Saving...' : 'Save News'}
          </button>
          <button
            onClick={onCancel}
            className="cancelButton"
          >
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="editorContent">
        {/* Basic Information */}
        <div className="section">
          <h3>Basic Information</h3>
          <div className="formGrid">
            <div className="formGroup">
              <label htmlFor="nheader">News Header *</label>
              <input
                type="text"
                id="nheader"
                value={headers.nheader}
                onChange={(e) => handleHeaderChange('nheader', e.target.value)}
                placeholder="Enter news header"
                className="input"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="nteaser">News Teaser</label>
              <textarea
                id="nteaser"
                value={headers.nteaser}
                onChange={(e) => handleHeaderChange('nteaser', e.target.value)}
                placeholder="Enter news teaser"
                className="textarea"
                rows={3}
              />
            </div>

            <div className="formGroup">
              <label htmlFor="nsubheader">News Subheader</label>
              <input
                type="text"
                id="nsubheader"
                value={headers.nsubheader}
                onChange={(e) => handleHeaderChange('nsubheader', e.target.value)}
                placeholder="Enter news subheader"
                className="input"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="urlkey">URL Key</label>
              <input
                type="text"
                id="urlkey"
                value={newsData.urlkey}
                onChange={(e) => handleNewsDataChange('urlkey', e.target.value)}
                placeholder="Auto-generated from header"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="section">
          <h3>News Content</h3>
          <div className="editorWrapper">
            <RichTextEditor
              value={body.nbody}
              onChange={(content) => setBody({ nbody: content })}
              placeholder="Write your news content here..."
            />
          </div>
        </div>

        {/* News Settings */}
        <div className="section">
          <h3>News Settings</h3>
          <div className="formGrid">
            <div className="formGroup">
              <label htmlFor="ndate">Date</label>
              <input
                type="date"
                id="ndate"
                value={newsData.ndate}
                onChange={(e) => handleNewsDataChange('ndate', e.target.value)}
                className="input"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="ntime">Time</label>
              <input
                type="time"
                id="ntime"
                value={newsData.ntime}
                onChange={(e) => handleNewsDataChange('ntime', e.target.value)}
                className="input"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="ntype">News Type</label>
              <select
                id="ntype"
                value={newsData.ntype}
                onChange={(e) => handleNewsDataChange('ntype', parseInt(e.target.value))}
                className="select"
              >
                <option value={1}>Type 1</option>
                <option value={2}>Type 2</option>
                <option value={3}>Type 3</option>
                <option value={4}>Type 4</option>
                <option value={5}>Type 5</option>
                <option value={6}>Type 6</option>
              </select>
            </div>

            <div className="formGroup">
              <label htmlFor="rubric">Rubric</label>
              <select
                id="rubric"
                value={newsData.rubric}
                onChange={(e) => handleNewsDataChange('rubric', e.target.value)}
                className="select"
              >
                <option value="1">Rubric 1</option>
                <option value="2">Rubric 2</option>
                <option value="3">Rubric 3</option>
                <option value="4">Rubric 4</option>
                <option value="5">Rubric 5</option>
                <option value="101">Rubric 101</option>
                <option value="103">Rubric 103</option>
              </select>
            </div>

            <div className="formGroup">
              <label htmlFor="region">Region</label>
              <select
                id="region"
                value={newsData.region}
                onChange={(e) => handleNewsDataChange('region', e.target.value)}
                className="select"
              >
                <option value="1">Region 1</option>
                <option value="2">Region 2</option>
                <option value="3">Region 3</option>
                <option value="4">Region 4</option>
                <option value="5">Region 5</option>
                <option value="6">Region 6</option>
                <option value="7">Region 7</option>
              </select>
            </div>

            <div className="formGroup">
              <label htmlFor="nweight">Weight</label>
              <input
                type="number"
                id="nweight"
                value={newsData.nweight}
                onChange={(e) => handleNewsDataChange('nweight', parseInt(e.target.value))}
                className="input"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Flags and Options */}
        <div className="section">
          <h3>Flags and Options</h3>
          <div className="checkboxGrid">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={newsData.approved === 1}
                onChange={(e) => handleNewsDataChange('approved', e.target.checked ? 1 : 0)}
              />
              <span>Approved</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={newsData.rated === 1}
                onChange={(e) => handleNewsDataChange('rated', e.target.checked ? 1 : 0)}
              />
              <span>Rated</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={newsData.suggest === 1}
                onChange={(e) => handleNewsDataChange('suggest', e.target.checked ? 1 : 0)}
              />
              <span>Suggested</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={newsData.headlineblock === 1}
                onChange={(e) => handleNewsDataChange('headlineblock', e.target.checked ? 1 : 0)}
              />
              <span>Headline Block</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={newsData.maininblock === 1}
                onChange={(e) => handleNewsDataChange('maininblock', e.target.checked ? 1 : 0)}
              />
              <span>Main in Block</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={newsData.photo === 1}
                onChange={(e) => handleNewsDataChange('photo', e.target.checked ? 1 : 0)}
              />
              <span>Has Photo</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={newsData.video === 1}
                onChange={(e) => handleNewsDataChange('video', e.target.checked ? 1 : 0)}
              />
              <span>Has Video</span>
            </label>
          </div>
        </div>
      </div>

      <div className="editorFooter">
        <button
          onClick={handleSave}
          disabled={loading}
          className="saveButton"
        >
          {loading ? 'Saving...' : 'Save News'}
        </button>
        <button
          onClick={onCancel}
          className="cancelButton"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
