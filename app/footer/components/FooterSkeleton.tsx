import React from 'react';
import { Skeleton } from 'antd';
import styles from '../Footer.module.css';

export default function FooterSkeleton() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Top section skeleton */}
        <div className={styles.footerTop}>
          {/* Agency column skeleton */}
          <div className={styles.footerColumn}>
            <Skeleton.Input 
              active 
              size="default" 
              style={{ width: '80px', height: '24px', marginBottom: '20px' }} 
            />
            <div className={styles.footerLinks}>
              {[1, 2, 3, 4, 5].map((i) => (
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

          {/* Top themes column skeleton */}
          <div className={styles.footerColumn}>
            <Skeleton.Input 
              active 
              size="default" 
              style={{ width: '80px', height: '24px', marginBottom: '20px' }} 
            />
            <div className={styles.footerLinks}>
              {[1, 2, 3].map((i) => (
                <Skeleton.Input 
                  key={i}
                  active 
                  size="small" 
                  style={{ 
                    width: `${100 + i * 15}px`, 
                    height: '16px', 
                    marginBottom: '8px',
                    display: 'block'
                  }} 
                />
              ))}
            </div>
          </div>

          {/* Categories column skeleton */}
          <div className={styles.footerColumn}>
            <Skeleton.Input 
              active 
              size="default" 
              style={{ width: '80px', height: '24px', marginBottom: '20px' }} 
            />
            <div className={styles.footerCategories}>
              {/* Two sub-columns */}
              <div className={styles.footerSubColumn}>
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
              <div className={styles.footerSubColumn}>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton.Input 
                    key={i}
                    active 
                    size="small" 
                    style={{ 
                      width: `${70 + i * 8}px`, 
                      height: '16px', 
                      marginBottom: '8px',
                      display: 'block'
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section skeleton */}
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContent}>
            {/* Logo skeleton */}
            <Skeleton.Avatar 
              active 
              size={80} 
              shape="square" 
              style={{ 
                width: '80px', 
                height: '30px',
                borderRadius: '4px'
              }} 
            />

            {/* Copyright and social links skeleton */}
            <div className={styles.footerBottomRight}>
              <Skeleton.Input 
                active 
                size="small" 
                style={{ 
                  width: '200px', 
                  height: '16px', 
                  marginBottom: '10px',
                  display: 'block'
                }} 
              />
              <div className={styles.socialLinks}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton.Avatar 
                    key={i}
                    active 
                    size={24} 
                    shape="circle" 
                    style={{ marginRight: '10px' }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
