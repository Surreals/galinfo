import Link from 'next/link';
import { useIsMobile } from '../../hooks/useIsMobile';
import styles from './ViewAllButton.module.css';

export interface ViewAllButtonProps {
  href: string;
  text?: string;
  className?: string;
}

export default function ViewAllButton({ 
  href, 
  text = "ВСІ НОВИНИ З РУБРИКИ",
  className 
}: ViewAllButtonProps) {
  const isMobile = useIsMobile();
  
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