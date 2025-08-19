import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

// BreadArrow іконка як React компонент
const BreadArrowIcon = () => (
  <svg 
    width="6" 
    height="10" 
    viewBox="0 0 6 10" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={styles.arrow}
    aria-hidden="true"
  >
    <path 
      d="M1 1L5 5L1 9" 
      stroke="#9ca3af" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        {items.map((item, index) => (
          <li key={index} className={styles.breadcrumbItem}>
            {index > 0 && <BreadArrowIcon />}
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
