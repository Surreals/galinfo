import styles from './AccentSquare.module.css';

interface AccentSquareProps {
  className?: string;
}

export default function AccentSquare({ className }: AccentSquareProps) {
  return (
    <div className={`${styles.accentSquare} ${className || ''}`}></div>
  );
} 