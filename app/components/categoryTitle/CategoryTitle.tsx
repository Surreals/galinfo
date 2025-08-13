import { AccentSquare } from '@/app/shared';
import styles from './CategoryTitle.module.css';

export interface CategoryTitleProps {
  title: string;
  className?: string;
}

export default function CategoryTitle({ 
  title,
  className = ""
}: CategoryTitleProps) {
  return (
    <div className={`${styles.categoryTitleSection} ${className}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.separator}></div>
        </div>
      </div>
    </div>
  );
}
