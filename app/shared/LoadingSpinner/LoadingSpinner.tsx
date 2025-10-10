import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  text = 'Завантаження...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClass = 
    size === 'small' ? styles.spinnerSmall : 
    size === 'large' ? styles.spinnerLarge : 
    styles.spinnerMedium;

  const containerClass = fullScreen 
    ? styles.fullScreenContainer 
    : styles.container;

  return (
    <div className={containerClass}>
      <div className={`${styles.spinner} ${sizeClass}`} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}

