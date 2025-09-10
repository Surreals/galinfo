'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/contexts/AdminAuthContext';
import Link from 'next/link';
import AdminNavigation from './components/AdminNavigation';
import styles from './admin.module.css';

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // router.push('/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Перевірка авторизації...</p>
      </div>
    );
  }

  if (!isAuthenticated || isLoading) {
    return null;
  }

  const adminSections = [
    {
      id: 'news',
      title: 'Новини / Статті',
      description: 'Управління новинами та статтями',
      href: '/admin/news',
      icon: '📰',
      color: '#007bff'
    },
    {
      id: 'gallery',
      title: 'Галерея',
      description: 'Управління зображеннями та медіа',
      href: '/admin/gallery',
      icon: '🖼️',
      color: '#28a745'
    },
    {
      id: 'site',
      title: 'Сайт',
      description: 'Управління структурою та налаштуваннями сайту',
      href: '/admin/site',
      icon: '🌐',
      color: '#6f42c1'
    },
    {
      id: 'languages',
      title: 'Мови',
      description: 'Управління мовними налаштуваннями',
      href: '/admin/languages',
      icon: '🌍',
      color: '#fd7e14'
    },
    {
      id: 'properties',
      title: 'Властивості',
      description: 'Управління системними властивостями',
      href: '/admin/properties',
      icon: '⚙️',
      color: '#20c997'
    },
    {
      id: 'users',
      title: 'Користувачі',
      description: 'Управління користувачами та правами доступу',
      href: '/admin/users',
      icon: '👥',
      color: '#e83e8c'
    },
    {
      id: 'advertising',
      title: 'Реклама',
      description: 'Управління рекламними матеріалами',
      href: '/admin/advertising',
      icon: '📢',
      color: '#ffc107'
    }
  ];

  return (
    <div className={styles.adminPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Панель адміністратора</h1>
          <p>Виберіть розділ для управління різними аспектами системи</p>
        </div>

        <div className={styles.sectionsGrid}>
          {adminSections.map((section) => (
            <Link key={section.id} href={section.href} className={styles.sectionCard}>
              <div className={styles.sectionIcon} style={{ backgroundColor: section.color }}>
                {section.icon}
              </div>
              <div className={styles.sectionContent}>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
              <div className={styles.sectionArrow}>→</div>
            </Link>
          ))}
        </div>

        <div className={styles.quickActions}>
          <h2>Швидкі дії</h2>
          <div className={styles.quickActionsGrid}>
            <Link href="/admin/article-editor" className={styles.quickAction}>
              <span className={styles.quickActionIcon}>✏️</span>
              <span>Редактор новин</span>
            </Link>
            <Link href="/admin/dashboard" className={styles.quickAction}>
              <span className={styles.quickActionIcon}>📊</span>
              <span>Дашборд</span>
            </Link>
            <Link href="/admin/test-db" className={styles.quickAction}>
              <span className={styles.quickActionIcon}>🗄️</span>
              <span>Тест БД</span>
            </Link>
            <Link href="/admin/test-homepage-api" className={styles.quickAction}>
              <span className={styles.quickActionIcon}>🔌</span>
              <span>Тест API</span>
            </Link>
            <Link href="/admin/test-category-news" className={styles.quickAction}>
              <span className={styles.quickActionIcon}>📋</span>
              <span>Тест новин по категорії</span>
            </Link>
            <Link href="/admin/test-menu" className={styles.quickAction}>
              <span className={styles.quickActionIcon}>🍽️</span>
              <span>Тест меню</span>
            </Link>
            <Link href="/admin/test-news" className={styles.quickAction}>
              <span className={styles.quickActionIcon}>📰</span>
              <span>Тест системи новин</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
