'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import { useAdminAuth } from '@/app/contexts/AdminAuthContext';
// import styles from './AdminNavigation.module.css';

interface AdminNavigationProps {
  onClose?: () => void;
}

export default function AdminNavigation({ onClose }: AdminNavigationProps) {
  const pathname = usePathname();
  // const [activeMainTab, setActiveMainTab] = useState('site');
  // const { user, logout } = useAdminAuth();

  const mainTabs = [
    { id: 'news', label: 'Новини / Статті', href: '/admin/news' },
    { id: 'gallery', label: 'Галерея', href: '/admin/gallery' },
    { id: 'site', label: 'Сайт', href: '/admin/site' },
    { id: 'templates', label: 'JSON Шаблони', href: '/admin/templates' },
    { id: 'properties', label: 'Властивості', href: '/admin/properties' },
    { id: 'users', label: 'Користувачі', href: '/admin/users' },
    { id: 'advertising', label: 'Реклама', href: '/admin/advertisements' },
    { id: 'test', label: 'Тестування', href: '/admin/test-category-news' },
  ];

  const siteSubTabs = [
    { id: 'tree', label: 'Дерево', href: '/admin/site/tree' },
    { id: 'templates', label: 'Шаблони', href: '/admin/site/templates' },
    { id: 'modules', label: 'Модулі', href: '/admin/site/modules' },
    { id: 'rubrics', label: 'Рубрики', href: '/admin/site/rubrics' },
    { id: 'themes', label: 'Теми', href: '/admin/site/themes' },
    { id: 'regions', label: 'Регіони', href: '/admin/site/regions' },
    { id: 'voting', label: 'Голосування', href: '/admin/site/voting' },
  ];

  const testSubTabs = [
    { id: 'category-news', label: 'Новини по категорії', href: '/admin/test-category-news' },
    { id: 'news', label: 'Система новин', href: '/admin/test-news' },
    { id: 'db', label: 'База даних', href: '/admin/test-db' },
    { id: 'homepage-api', label: 'API головної сторінки', href: '/admin/test-homepage-api' },
    { id: 'editor', label: 'Редактор', href: '/admin/article-editor' },
    { id: 'menu', label: 'Меню', href: '/admin/test-menu' },
  ];

  const isSiteSection = pathname.startsWith('/admin/site');
  const isTestSection = pathname.startsWith('/admin/test');
  const currentSubTab = pathname.split('/').pop() || '';

  return (
    <div className="adminNavigation">
      {/* Main Navigation Bar */}
      <div className="mainNavBar">

        {/* User Menu - ЗАКОМЕНТОВАНО, тепер кнопка виходу в хедері */}
        {/* {user && (
          <div className={styles.userMenu}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
            <button className={styles.logoutButton} onClick={logout}>
              Вийти
            </button>
          </div>
        )} */}

        {onClose && (
          <button className="closeButton" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* Secondary Navigation Bar (Site Section) */}
      {isSiteSection && (
        <div className="subNavBar">
          <div className="subNavTabs">
            {siteSubTabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`subNavTab ${currentSubTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Navigation Bar (Test Section) */}
      {isTestSection && (
        <div className="subNavBar">
          <div className="subNavTabs">
            {testSubTabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`subNavTab ${currentSubTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
