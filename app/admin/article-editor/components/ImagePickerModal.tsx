'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Button, Spin, message, Upload, Tabs, Select, Pagination } from 'antd';
import { SearchOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import { ImageItem, ImagePickerModalProps } from './types';
import ImageGallery from './ImageGallery';
import ImageUpload from './ImageUpload';
import TagSearchInput from './TagSearchInput';
import styles from './ImagePickerModal.module.css';

const { Search } = Input;

export default function ImagePickerModal({ 
  open,
  onClose, 
  onSelect, 
  onSelectMultiple,
  currentImage,
  allowMultiple = false
}: ImagePickerModalProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);

  // Завантаження зображень
  const fetchImages = async (page = 1, search = '', picType = '', tags = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '35',
        ...(search && { search }),
        ...(picType && { pic_type: picType }),
        ...(tags && { tags })
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
    fetchImages(1, value, selectedType, tagsFilter);
  };

  // Зміна типу зображення
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
    fetchImages(1, searchTerm, value, tagsFilter);
  };

  // Пошук по тегах
  const handleTagsSearch = (value: string) => {
    setTagsFilter(value);
    setCurrentPage(1);
    fetchImages(1, searchTerm, selectedType, value);
  };

  // Зміна сторінки
  const handlePageChange = (page: number) => {
    fetchImages(page, searchTerm, selectedType, tagsFilter);
  };

  // Вибір зображення
  const handleImageSelect = (image: ImageItem) => {
    console.log('Image selected:', image.id, 'allowMultiple:', allowMultiple);
    if (allowMultiple) {
      const isSelected = selectedImages.some(img => img.id === image.id);
      if (isSelected) {
        const newSelection = selectedImages.filter(img => img.id !== image.id);
        setSelectedImages(newSelection);
        console.log('Image deselected:', image.id);
      } else {
        const newSelection = [...selectedImages, image];
        setSelectedImages(newSelection);
        console.log('Image selected:', image.id, 'Total selected:', newSelection.length);
      }
    } else {
      onSelect(image);
      onClose();
    }
  };

  // Підтвердження множинного вибору
  const handleConfirmMultiple = () => {
    if (onSelectMultiple && selectedImages.length > 0) {
      onSelectMultiple(selectedImages);
      setSelectedImages([]);
      onClose();
    }
  };

  // Скидання вибору
  const handleClearSelection = () => {
    setSelectedImages([]);
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
    if (open) {
      fetchImages();
      // Скидаємо вибрані зображення при відкритті модалки
      setSelectedImages([]);
    }
  }, [open]);

  return (
    <Modal
      title="Вибір зображення"
      open={open}
      onCancel={() => {
        setSelectedImages([]);
        onClose();
      }}
      footer={allowMultiple ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {selectedImages.length > 0 && (
              <span style={{ color: '#666' }}>
                Вибрано: {selectedImages.length} зображень
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedImages.length > 0 && (
              <Button onClick={handleClearSelection}>
                Очистити
              </Button>
            )}
            <Button onClick={() => {
              setSelectedImages([]);
              onClose();
            }}>
              Скасувати
            </Button>
            <Button 
              type="primary" 
              onClick={handleConfirmMultiple}
              disabled={selectedImages.length === 0}
            >
              Вибрати ({selectedImages.length})
            </Button>
          </div>
        </div>
      ) : null}
      width={1400}
      className={styles.modal}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className={styles.tabs}
        items={[
          {
            key: 'gallery',
            label: (
              <span>
                <PictureOutlined />
                Галерея
              </span>
            ),
            children: (
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
                  <div style={{ width: 200 }}>
                    <TagSearchInput
                      value={tagsFilter}
                      onChange={setTagsFilter}
                      onSearch={handleTagsSearch}
                      placeholder="Пошук по тегах..."
                    />
                  </div>
                </div>

                {/* Галерея зображень */}
                <ImageGallery
                  images={images}
                  onSelect={handleImageSelect}
                  selectedImageId={allowMultiple ? undefined : currentImage?.id}
                  selectedImageIds={allowMultiple ? selectedImages.map(img => img.id) : []}
                  loading={loading}
                  allowMultiple={allowMultiple}
                />

                {/* Пагінація */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <Pagination
                      current={currentPage}
                      total={totalPages * 35} // 35 items per page
                      pageSize={35}
                      showSizeChanger={false}
                      showQuickJumper={false}
                      showTotal={(total, range) => 
                        `${range[0]}-${range[1]} з ${total} зображень`
                      }
                      onChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'upload',
            label: (
              <span>
                <UploadOutlined />
                Завантажити
              </span>
            ),
            children: (
              <ImageUpload
                onUpload={async (file) => {
                  // Функція не використовується, оскільки завантаження відбувається в ImageUpload
                  throw new Error('Upload handled internally');
                }}
                onSuccess={handleUploadSuccess}
                onError={(error) => message.error(error)}
              />
            )
          }
        ]}
      />
    </Modal>
  );
}
