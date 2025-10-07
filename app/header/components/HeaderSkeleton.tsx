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

        {/* Main navigation skeleton */}
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

        {/* Dropdown menu skeleton (when hovered) */}
        <div className={styles.dropdown}>
          <div className={styles.dropdownContent}>
            {/* Top themes column skeleton */}
            <div className={styles.dropdownColumn}>
              <Skeleton.Input 
                active 
                size="default" 
                style={{ width: '100px', height: '24px', marginBottom: '15px' }} 
              />
              <div className={styles.dropdownLinks}>
                {[1, 2, 3].map((i) => (
                  <Skeleton.Input 
                    key={i}
                    active 
                    size="small" 
                    style={{ 
                      width: `${120 + i * 20}px`, 
                      height: '16px', 
                      marginBottom: '8px',
                      display: 'block'
                    }} 
                  />
                ))}
              </div>
            </div>

            {/* Categories columns skeleton */}
            <div className={styles.dropdownColumn}>
              <Skeleton.Input 
                active 
                size="default" 
                style={{ width: '100px', height: '24px', marginBottom: '15px' }} 
              />
              <div className={styles.dropdownCategories}>
                {/* 4 sub-columns */}
                {[1, 2, 3, 4].map((col) => (
                  <div key={col} className={styles.dropdownSubColumn}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton.Input 
                        key={i}
                        active 
                        size="small" 
                        style={{ 
                          width: `${60 + i * 5}px`, 
                          height: '16px', 
                          marginBottom: '8px',
                          display: 'block'
                        }} 
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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

      {/* Mobile menu button skeleton */}
      <div className={styles.mobileMenuButton}>
        <Skeleton.Avatar 
          active 
          size={24} 
          shape="square" 
        />
      </div>

      {/* Mobile menu skeleton (when expanded) */}
      <div className={styles.mobileMenu}>
        {/* Top themes skeleton */}
        <div className={styles.mobileSection}>
          <Skeleton.Input 
            active 
            size="default" 
            style={{ width: '100px', height: '24px', marginBottom: '15px' }} 
          />
          <div className={styles.mobileLinks}>
            {[1, 2, 3].map((i) => (
              <Skeleton.Input 
                key={i}
                active 
                size="small" 
                style={{ 
                  width: `${120 + i * 20}px`, 
                  height: '16px', 
                  marginBottom: '8px',
                  display: 'block'
                }} 
              />
            ))}
          </div>
        </div>

        {/* Categories skeleton */}
        <div className={styles.mobileSection}>
          <Skeleton.Input 
            active 
            size="default" 
            style={{ width: '100px', height: '24px', marginBottom: '15px' }} 
          />
          <div className={styles.mobileLinks}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton.Input 
                key={i}
                active 
                size="small" 
                style={{ 
                  width: `${80 + i * 10}px`, 
                  height: '16px', 
                  marginBottom: '8px',
                  display: 'block'
                }} 
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
