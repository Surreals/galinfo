'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

interface NewsItem {
  id: number;
  nheader: string;
  nsubheader?: string;
  ndate: string;
  ntime: string;
  ntype: number;
  approved: number;
  rated: number;
  comments: number;
  images: string;
  urlkey: string;
  photo: string;
  video: string;
  udate: number;
  lang: number;
  rubric: number;
  theme: number;
  userid: number;
  nweight: number;
  headlineblock: number;
  maininblock: number;
  suggest: number;
  printsubheader: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  services: string;
  blogs: number;
  regdate: string;
  shortinfo: string;
  avatar: string;
  ulang: number;
}

export default function AdminDashboard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState<'all' | '1' | '0'>('all');
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const adminUser = localStorage.getItem('adminUser');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminUser || !adminToken) {
      router.push('/admin');
      return;
    }

    try {
      setUser(JSON.parse(adminUser));
      fetchNews();
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/admin');
    }
  }, [router]);

  const fetchNews = async (page = 1) => {
    try {
      setLoading(true);
      
      let query = `
        SELECT a_news.*, a_news_headers.nheader, a_news_headers.nteaser, a_news_headers.nsubheader
        FROM a_news 
        LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (searchTerm) {
        query += ` AND (a_news_headers.nheader LIKE ? OR a_news_headers.nteaser LIKE ?)`;
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }
      
      if (filterApproved !== 'all') {
        query += ` AND a_news.approved = ?`;
        params.push(filterApproved);
      }
      
      if (filterType !== 'all') {
        query += ` AND a_news.ntype = ?`;
        params.push(filterType);
      }
      
      // Add pagination
      const offset = (page - 1) * itemsPerPage;
      query += ` ORDER BY a_news.udate DESC LIMIT ? OFFSET ?`;
      params.push(itemsPerPage, offset);
      
      const response = await fetch('/api/admin/news?' + new URLSearchParams({
        query: query,
        params: JSON.stringify(params)
      }));
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setNews(data.news);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNews(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchNews(1);
  };

  const handlePageChange = (page: number) => {
    fetchNews(page);
  };

  const handleNewsAction = async (newsId: number, action: 'approve' | 'reject' | 'delete') => {
    try {
      const response = await fetch('/api/admin/news/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsId, action }),
      });

      if (response.ok) {
        // Refresh the news list
        fetchNews(currentPage);
      } else {
        const data = await response.json();
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      alert('Action failed. Please try again.');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>GalInfo Admin Dashboard</h1>
          <div className={styles.userInfo}>
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Search and Filters */}
        <div className={styles.controls}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search news by title or teaser..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              Search
            </button>
          </form>

          <div className={styles.filters}>
            <select
              value={filterApproved}
              onChange={(e) => {
                setFilterApproved(e.target.value as 'all' | '1' | '0');
                handleFilterChange();
              }}
              className={styles.filterSelect}
            >
              <option value="all">All Approval Status</option>
              <option value="1">Approved</option>
              <option value="0">Not Approved</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                handleFilterChange();
              }}
              className={styles.filterSelect}
            >
              <option value="all">All Types</option>
              <option value="1">Type 1</option>
              <option value="2">Type 2</option>
              <option value="3">Type 3</option>
              <option value="4">Type 4</option>
              <option value="5">Type 5</option>
              <option value="6">Type 6</option>
            </select>
          </div>
        </div>

        {/* News List */}
        <div className={styles.newsContainer}>
          {loading ? (
            <div className={styles.loading}>Loading news...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <>
              <div className={styles.newsHeader}>
                <h2>News List ({news.length} items)</h2>
                <button 
                  onClick={() => fetchNews(currentPage)} 
                  className={styles.refreshButton}
                >
                  Refresh
                </button>
              </div>

              {news.length === 0 ? (
                <div className={styles.noNews}>No news found</div>
              ) : (
                <div className={styles.newsList}>
                  {news.map((item) => (
                    <div key={item.id} className={styles.newsItem}>
                      <div className={styles.newsContent}>
                        <h3 className={styles.newsTitle}>
                          {item.nheader || 'No Title'}
                        </h3>
                        {item.nsubheader && (
                          <p className={styles.newsSubtitle}>{item.nsubtitle}</p>
                        )}
                        <div className={styles.newsMeta}>
                          <span>ID: {item.id}</span>
                          <span>Date: {new Date(item.ndate * 1000).toLocaleDateString()}</span>
                          <span>Type: {item.ntype}</span>
                          <span className={item.approved ? styles.approved : styles.notApproved}>
                            {item.approved ? 'Approved' : 'Not Approved'}
                          </span>
                          <span>Weight: {item.nweight}</span>
                        </div>
                      </div>
                      
                      <div className={styles.newsActions}>
                        {!item.approved && (
                          <button
                            onClick={() => handleNewsAction(item.id, 'approve')}
                            className={styles.approveButton}
                          >
                            Approve
                          </button>
                        )}
                        {item.approved && (
                          <button
                            onClick={() => handleNewsAction(item.id, 'reject')}
                            className={styles.rejectButton}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleNewsAction(item.id, 'delete')}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                  >
                    Previous
                  </button>
                  
                  <span className={styles.pageInfo}>
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.pageButton}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
