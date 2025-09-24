'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Button, Spin, message, Upload, Tabs, Select } from 'antd';
import { SearchOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import { ImageItem, ImagePickerModalProps } from './types';
import ImageGallery from './ImageGallery';
import ImageUpload from './ImageUpload';
import styles from './ImagePickerModal.module.css';

const { Search } = Input;
const { TabPane } = Tabs;

export default function ImagePickerModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentImage 
}: ImagePickerModalProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('gallery');

  // Завантаження зображень
  const fetchImages = async (page = 1, search = '', picType = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(picType && { pic_type: picType })
      });

      const response = await fetch(`/api/admin/images?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.images);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching images:', error);
      message.error('Помилка завантаження зображень');
    } finally {
      setLoading(false);
    }
  };

  // Пошук зображень
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchImages(1, value, selectedType);
  };

  // Зміна типу зображення
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
    fetchImages(1, searchTerm, value);
  };

  // Зміна сторінки
  const handlePageChange = (page: number) => {
    fetchImages(page, searchTerm, selectedType);
  };

  // Вибір зображення
  const handleImageSelect = (image: ImageItem) => {
    onSelect(image);
    onClose();
  };

  // Завантаження нового зображення
  const handleUploadSuccess = (image: ImageItem) => {
    message.success('Зображення успішно завантажено');
    // Оновлюємо список зображень
    fetchImages(currentPage, searchTerm, selectedType);
    // Переключаємося на галерею
    setActiveTab('gallery');
  };

  // Завантаження зображень при відкритті модалки
  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  return (
    <Modal
      title="Вибір зображення"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900}
      className={styles.modal}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className={styles.tabs}
      >
        <TabPane 
          tab={
            <span>
              <PictureOutlined />
              Галерея
            </span>
          } 
          key="gallery"
        >
          <div className={styles.galleryContainer}>
            {/* Пошук та фільтри */}
            <div className={styles.filters}>
              <Search
                placeholder="Пошук зображень..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
              <Select
                placeholder="Тип зображення"
                allowClear
                style={{ width: 200 }}
                onChange={handleTypeChange}
                options={[
                  { value: 'news', label: 'Новини' },
                  { value: 'gallery', label: 'Галерея' },
                  { value: 'avatar', label: 'Аватар' },
                  { value: 'banner', label: 'Банер' }
                ]}
              />
            </div>

            {/* Галерея зображень */}
            <ImageGallery
              images={images}
              onSelect={handleImageSelect}
              selectedImageId={currentImage?.id}
              loading={loading}
            />

            {/* Пагінація */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Попередня
                </Button>
                <span className={styles.pageInfo}>
                  Сторінка {currentPage} з {totalPages}
                </span>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Наступна
                </Button>
              </div>
            )}
          </div>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <UploadOutlined />
              Завантажити
            </span>
          } 
          key="upload"
        >
          <ImageUpload
            onUpload={async (file) => {
              // Функція не використовується, оскільки завантаження відбувається в ImageUpload
              throw new Error('Upload handled internally');
            }}
            onSuccess={handleUploadSuccess}
            onError={(error) => message.error(error)}
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
}
