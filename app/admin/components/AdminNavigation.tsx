'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRolePermissions } from '@/app/hooks/useRolePermissions';
// import styles from './AdminNavigation.module.css';

interface AdminNavigationProps {
  onClose?: () => void;
}

export default function AdminNavigation({ onClose }: AdminNavigationProps) {
  const pathname = usePathname();
  const { isAdmin, isEditor, isJournalist } = useRolePermissions();

  // Define all tabs with their required permissions
  const allMainTabs = [
    { id: 'news', label: 'Новини / Статті', href: '/admin/news', requiresAdmin: false },
    { id: 'gallery', label: 'Галерея', href: '/admin/gallery', requiresAdmin: false },
    { id: 'site', label: 'Сайт', href: '/admin/site', requiresAdmin: true },
    { id: 'templates', label: 'JSON Шаблони', href: '/admin/templates', requiresAdmin: true },
    { id: 'properties', label: 'Властивості', href: '/admin/properties', requiresAdmin: true },
    { id: 'users', label: 'Користувачі', href: '/admin/users', requiresAdmin: true },
    { id: 'advertising', label: 'Реклама', href: '/admin/advertisements', requiresAdmin: true },
    { id: 'tags', label: 'Теги', href: '/admin/tags', requiresAdmin: true },
    { id: 'telegram', label: 'Telegram', href: '/admin/telegram', requiresAdmin: true },
    { id: 'test', label: 'Тестування', href: '/admin/test-category-news', requiresAdmin: true },
  ];

  // Filter tabs based on user role - only admins see admin sections
  const mainTabs = allMainTabs.filter(tab => {
    if (tab.requiresAdmin) {
      return isAdmin;
    }
    return true; // Allow for all roles (only news and gallery)
  });

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
