import React from 'react';
import { Skeleton } from 'antd';
import styles from '../Header.module.scss';

export default function HeaderSkeleton() {
  return (
    <header className={styles.headerMain}>
      <div className={styles.header}>
        {/* Logo skeleton */}
        <Skeleton.Avatar 
          active 
          size={120} 
          shape="square" 
          style={{ 
            width: '120px', 
            height: '40px',
            borderRadius: '4px'
          }} 
        />

        {/* Main navigation skeleton - single line */}
        <nav className={styles.mainNav}>
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: '80px', height: '20px', marginRight: '20px' }} 
          />
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: '70px', height: '20px', marginRight: '20px' }} 
          />
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: '90px', height: '20px', marginRight: '20px' }} 
          />
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: '80px', height: '20px', marginRight: '20px' }} 
          />
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: '70px', height: '20px', marginRight: '20px' }} 
          />
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: '120px', height: '20px', marginRight: '20px' }} 
          />
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: '60px', height: '20px', marginRight: '20px' }} 
          />
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: '70px', height: '20px', marginRight: '20px' }} 
          />
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: '100px', height: '20px' }} 
          />
        </nav>

        {/* Right side skeleton */}
        <div className={styles.headerRight}>
          {/* Search icon skeleton */}
          <Skeleton.Avatar 
            active 
            size={24} 
            shape="circle" 
            style={{ marginRight: '20px' }} 
          />
          
          {/* Radio button skeleton */}
          <Skeleton.Button 
            active 
            size="large" 
            style={{ 
              width: '200px', 
              height: '50px',
              borderRadius: '6px'
            }} 
          />
        </div>
      </div>
    </header>
  );
}
