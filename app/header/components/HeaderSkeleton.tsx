import React from 'react';
import { Skeleton } from 'antd';
import styles from '../Header.module.scss';
import skeletonStyles from './HeaderSkeleton.module.css';

export default function HeaderSkeleton() {
  return (
    <header className={`${styles.headerMain} ${skeletonStyles.headerSkeleton}`}>
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

        {/* Main navigation skeleton - responsive */}
        <nav className={styles.headerNav}>
          <div className={styles.navListWrapper}>
            <div className={styles.navList}>
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '80px', height: '20px' }} 
              />
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '70px', height: '20px' }} 
              />
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '90px', height: '20px' }} 
              />
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '80px', height: '20px' }} 
              />
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '70px', height: '20px' }} 
              />
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '100px', height: '20px' }} 
              />
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '60px', height: '20px' }} 
              />
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '70px', height: '20px' }} 
              />
            </div>
          </div>
        </nav>

        {/* More news item skeleton */}
        <div className={styles.moreNewsItem}>
          <Skeleton.Input 
            active 
            size="small" 
            style={{ width: '120px', height: '20px' }} 
          />
        </div>

        {/* Burger menu container */}
        <div className={styles.burgerMenuContainer}>
          {/* Burger menu icon skeleton */}
          <div className={styles.burgerMenuIcon}>
            <Skeleton.Avatar 
              active 
              size={24} 
              shape="square" 
              style={{ width: '24px', height: '24px' }} 
            />
          </div>
          
          {/* SVG box skeleton */}
          <div className={styles.svgBox}>
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
      </div>
    </header>
  );
}
