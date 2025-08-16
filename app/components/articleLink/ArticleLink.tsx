import Link from 'next/link';
import styles from './ArticleLink.module.css';

export interface ArticleLinkProps {
  id: string;
  title: string;
  className?: string;
}

export default function ArticleLink({ 
  id, 
  title, 
  className = "" 
}: ArticleLinkProps) {
  return (
    <Link 
      href={`/article/${id}`} 
      className={`${styles.articleLink} ${className}`}
    >
      {title}
    </Link>
  );
}
