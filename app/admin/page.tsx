'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminNavigation from './components/AdminNavigation';
import ImagePickerModal from './article-editor/components/ImagePickerModal';
import { ImageItem } from './article-editor/components/types';
import { useRolePermissions } from '@/app/hooks/useRolePermissions';
import styles from './admin.module.css';

export default function AdminPage() {
  const DISABLE = true;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin } = useRolePermissions();
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  // Відкрити галерею при наявності параметра gallery=true
  useEffect(() => {
    if (searchParams.get('gallery') === 'true') {
      setIsGalleryModalOpen(true);
    }
  }, [searchParams]);

  const handleGalleryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGalleryModalOpen(true);
    // Додаємо параметр в URL
    router.push('/admin?gallery=true', { scroll: false });
  };

  const handleGalleryModalClose = () => {
    setIsGalleryModalOpen(false);
    // Видаляємо параметр з URL
    router.push('/admin', { scroll: false });
  };

  const handleImageSelect = (image: ImageItem) => {
    // Тут можна додати логіку для обробки вибраного зображення
    console.log('Selected image:', image);
  };


  const allAdminSections = [
    {
      id: 'news',
      title: 'Новини / Статті',
      description: 'Управління новинами та статтями',
      href: '/admin/news',
      icon: '📰',
      disabled: false,
      color: '#007bff',
      requiresAdmin: false // Доступно всім
    },
    {
      id: 'gallery',
      title: 'Галерея',
      description: 'Управління зображеннями та медіа',
      href: '/admin/gallery',
      icon: '🖼️',
      disabled: false,
      color: '#28a745',
      requiresAdmin: false // Доступно всім
    },
    {
      id: 'categories',
      title: 'Категорії',
      description: 'Управління категоріями, темами та регіонами',
      href: '/admin/categories',
      icon: '🏷️',
      disabled: false,
      color: '#6610f2',
      requiresAdmin: true // Тільки для адмінів
    },
    {
      id: 'tags',
      title: 'Теги',
      description: 'Управління тегами для новин та статей',
      href: '/admin/tags',
      icon: '🔖',
      disabled: false,
      color: '#fd7e14',
      requiresAdmin: true // Тільки для адмінів
    },
    {
      id: 'videos',
      title: 'Відео',
      description: 'Управління відео файлами та медіа',
      href: '/admin/videos',
      icon: '🎥',
      disabled: false,
      color: '#dc3545',
      requiresAdmin: false // Доступно всім (фото-відео матеріали)
    },
    {
      id: 'site',
      title: 'Сайт',
      description: 'Управління структурою та налаштуваннями сайту',
      href: '/admin/site',
      icon: '🌐',
      disabled: true,
      color: '#6f42c1',
      requiresAdmin: true // Тільки для адмінів
    },
    {
      id: 'properties',
      title: 'Властивості',
      description: 'Управління системними властивостями',
      href: '/admin/properties',
      icon: '⚙️',
      disabled: true,
      color: '#20c997',
      requiresAdmin: true // Тільки для адмінів
    },
    {
      id: 'users',
      title: 'Користувачі',
      description: 'Управління користувачами та правами доступу',
      href: '/admin/users',
      icon: '👥',
      disabled: false,
      color: '#e83e8c',
      requiresAdmin: true // Тільки для адмінів
    },
    {
      id: 'advertising',
      title: 'Реклама',
      description: 'Управління рекламними матеріалами',
      href: '/admin/advertisements',
      icon: '📢',
      disabled: false,
      color: '#ffc107',
      requiresAdmin: true // Тільки для адмінів
    },
    {
      id: 'telegram-settings',
      title: 'Telegram',
      description: 'Управління ботом та каналами для публікації новин',
      href: '/admin/telegram-settings',
      icon: '🤖',
      disabled: false,
      color: '#0088cc',
      requiresAdmin: true // Тільки для адмінів
    },
    {
      id: 'templates',
      title: 'Шаблони',
      description: 'Управління шаблонами статей та контенту',
      href: '/admin/templates',
      icon: '📄',
      disabled: false,
      color: '#17a2b8',
      requiresAdmin: true // Тільки для адмінів
    },
    {
      id: 'security',
      title: 'Безпека',
      description: 'Налаштування двофакторної автентифікації (2FA)',
      href: '/admin/settings/2fa',
      icon: '🔒',
      disabled: false,
      color: '#6c757d',
      requiresAdmin: false // Доступно всім (власні налаштування безпеки)
    }
  ];

  // Фільтруємо секції на основі ролі користувача
  const adminSections = allAdminSections.filter(section => {
    if (section.requiresAdmin) {
      return isAdmin;
    }
    return true; // Показуємо секції без обмежень всім
  });

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
            <Link
              key={section.id}
              href={section.href}
              onClick={(e) => {
                if (section.disabled) e.preventDefault(); // блокуємо перехід
                if (section.id === 'gallery') {
                  handleGalleryClick(e);
                }
              }}
              className={`${styles.sectionCard} ${section.disabled ? styles.disabledCard : ''}`}
            >
              <div className={styles.sectionIcon} style={{backgroundColor: section.color}}>
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

        {/* <div className={styles.quickActions}>
          <h2>Швидкі дії</h2>
          <div className={styles.quickActionsGrid}>
            <Link href="/admin/article-editor" className={styles.quickActionActive}>
              <span className={styles.quickActionIcon}>✏️</span>
              <span>Додати новину</span>
            </Link>
          </div>
        </div> */}

        <div className={styles.bytcdCorner}>
          <a 
            href="https://bytcd.com" 
            target="_blank" 
            // rel="noopener noreferrer" 
            className={styles.bytcdCircle}
          >
            <span className={styles.bytcdInitials}>BYTCD</span>
          </a>
          <div className={styles.bytcdPopover}>
            <div className={styles.bytcdPopoverContent}>
              <div className={styles.bytcdPopoverHeader}>
                {/* <div className={styles.bytcdPopoverLogo}>BYTCD</div> */}
                <div className={styles.bytcdPopoverTitle}>Розроблено командою BYTCD</div>
              </div>
              <div className={styles.bytcdPopoverBody}>
                {/* <p>Веб-розробка та технічна підтримка</p> */}
                <a href="https://bytcd.com" target="_blank"  className={styles.bytcdPopoverLink}>
                  bytcd.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Модалка галереї */}
        <ImagePickerModal
          open={isGalleryModalOpen}
          onClose={handleGalleryModalClose}
          onSelect={handleImageSelect}
        />
      </div>
    </div>
  );
}
