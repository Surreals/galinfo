'use client';

import AdminNavigation from '../components/AdminNavigation';
import Link from 'next/link';
import styles from './site.module.css';

export default function SitePage() {
  const siteSections = [
    { id: 'tree', label: 'Дерево', href: '/admin/site/tree', description: 'Управління структурою сайту' },
    { id: 'templates', label: 'Шаблони', href: '/admin/site/templates', description: 'Управління шаблонами сторінок' },
    { id: 'modules', label: 'Модулі', href: '/admin/site/modules', description: 'Управління модулями сайту' },
    { id: 'rubrics', label: 'Рубрики', href: '/admin/site/rubrics', description: 'Управління рубриками новин' },
    { id: 'themes', label: 'Теми', href: '/admin/site/themes', description: 'Управління темами контенту' },
    { id: 'regions', label: 'Регіони', href: '/admin/site/regions', description: 'Управління регіональними налаштуваннями' },
    { id: 'voting', label: 'Голосування', href: '/admin/site/voting', description: 'Управління системою голосування' },
  ];

  return (
    <div className={styles.sitePage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Управління сайтом</h1>
          <p>Виберіть розділ для управління різними аспектами сайту</p>
        </div>

        <div className={styles.sectionsGrid}>
          {siteSections.map((section) => (
            <Link key={section.id} href={section.href} className={styles.sectionCard}>
              <div className={styles.sectionIcon}>
                {section.id === 'tree' && '🌳'}
                {section.id === 'templates' && '📄'}
                {section.id === 'modules' && '🔧'}
                {section.id === 'rubrics' && '📁'}
                {section.id === 'themes' && '🎨'}
                {section.id === 'regions' && '🌍'}
                {section.id === 'voting' && '🗳️'}
              </div>
              <div className={styles.sectionContent}>
                <h3>{section.label}</h3>
                <p>{section.description}</p>
              </div>
              <div className={styles.sectionArrow}>→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
