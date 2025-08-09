import Link from 'next/link';
import styles from './ViewAllButton.module.css';

interface ViewAllButtonProps {
  href: string;
  text?: string;
  className?: string;
}

export default function ViewAllButton({ 
  href, 
  text = "ВСІ НОВИНИ З РУБРИКИ",
  className 
}: ViewAllButtonProps) {
  return (
    <div className={`${styles.viewAllContainer} ${className || ''}`}>
      <Link href={href} className={styles.viewAllButton}>
        <span>{text}</span>
        <svg 
          className={styles.arrowIcon} 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </Link>
    </div>
  );
} 