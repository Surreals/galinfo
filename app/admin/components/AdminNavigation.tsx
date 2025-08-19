'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavigationProps {
  onClose?: () => void;
}

export default function AdminNavigation({ onClose }: AdminNavigationProps) {
  const pathname = usePathname();
  const [activeMainTab, setActiveMainTab] = useState('site');

  const mainTabs = [
    { id: 'news', label: 'Новини / Статті', href: '/admin/news' },
    { id: 'gallery', label: 'Галерея', href: '/admin/gallery' },
    { id: 'site', label: 'Сайт', href: '/admin/site' },
    { id: 'languages', label: 'Мови', href: '/admin/languages' },
    { id: 'properties', label: 'Властивості', href: '/admin/properties' },
    { id: 'users', label: 'Користувачі', href: '/admin/users' },
    { id: 'advertising', label: 'Реклама', href: '/admin/advertising' },
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

  const isSiteSection = pathname.startsWith('/admin/site');
  const currentSubTab = pathname.split('/').pop() || '';

  return (
    <div className="adminNavigation">
      {/* Main Navigation Bar */}
      <div className="mainNavBar">
        <div className="navLogo">
          <div className="logoIcon">G</div>
        </div>
        
        <div className="navTabs">
          {mainTabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`navTab ${activeMainTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveMainTab(tab.id)}
            >
              {tab.label}
            </Link>
          ))}
        </div>

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
    </div>
  );
}
