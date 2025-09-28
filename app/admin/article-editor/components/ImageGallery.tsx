'use client';

import { useState } from 'react';
import { Spin, Empty, Image, Card, Tooltip } from 'antd';
import { ImageItem, ImageGalleryProps } from './types';
import styles from './ImageGallery.module.css';

export default function ImageGallery({ 
  images, 
  onSelect, 
  selectedImageId, 
  loading 
}: ImageGalleryProps) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handlePreview = (image: ImageItem) => {
    setPreviewImage(image.url || null);
    setPreviewVisible(true);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p>Завантаження зображень...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Зображення не знайдено"
        />
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.imageGrid}>
        {images.map((image) => (
          <Card
            key={image.id}
            hoverable
            className={`${styles.imageCard} ${
              selectedImageId === image.id ? styles.selected : ''
            }`}
            cover={
              <div className={styles.imageContainer}>
                <Image
                  src={image.thumbnail_url || image.url}
                  alt={image.title}
                  className={styles.image}
                  preview={false}
                  onClick={() => handlePreview(image)}
                />
                <div className={styles.imageOverlay}>
                  <div className={styles.imageActions}>
                    <Tooltip title="Переглянути">
                      <button
                        className={styles.actionButton}
                        onClick={() => handlePreview(image)}
                      >
                        👁️
                      </button>
                    </Tooltip>
                    <Tooltip title="Вибрати">
                      <button
                        className={styles.actionButton}
                        onClick={() => onSelect(image)}
                      >
                        ✓
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            }
            bodyStyle={{ padding: '8px' }}
          >
            <div className={styles.imageInfo}>
              <div className={styles.imageTitle} title={image.title}>
                {image.title || image.filename}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Модалка для перегляду зображення */}
      {previewImage && (
        <Image
          style={{ display: 'none' }}
          src={previewImage}
          preview={{
            visible: previewVisible,
            onVisibleChange: setPreviewVisible,
          }}
        />
      )}
    </div>
  );
}
