import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        {items.map((item, index) => (
          <li key={index} className={styles.breadcrumbItem}>
            {index > 0 && (
              <span className={styles.separator} aria-hidden="true">
                &gt;
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className={styles.breadcrumbLink}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.breadcrumbCurrent} aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
