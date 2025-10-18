'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Select, Button, message, Image as AntImage } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import TagSearchInput from '../article-editor/components/TagSearchInput';
import styles from './ImageGallerySelector.module.css';

const { Option } = Select;

interface Image {
  id: number;
  filename: string;
  title_ua: string;
  title_deflang: string;
  pic_type: string;
  tags?: string;
  url: string;
  thumbnail_url: string;
}

interface ImageGallerySelectorProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (imageUrl: string) => void;
}

const ImageGallerySelector: React.FC<ImageGallerySelectorProps> = ({
  visible,
  onCancel,
  onSelect,
}) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [picTypeFilter, setPicTypeFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  // Завантаження списку зображень
  const fetchImages = async (page = 1, limit = 10, search = '', picType = '', tags = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(picType && { pic_type: picType }),
        ...(tags && { tags }),
      });

      const response = await fetch(`/api/admin/images?${params}`);
      const data = await response.json();

      if (response.ok) {
        setImages(data.images);
        setPagination({
          current: data.pagination.page,
          pageSize: data.pagination.limit,
          total: data.pagination.total,
        });
      } else {
        message.error('Помилка завантаження зображень');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      message.error('Помилка завантаження зображень');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchImages();
    }
  }, [visible]);

  const handleSearch = () => {
    fetchImages(1, pagination.pageSize, searchText, picTypeFilter, tagsFilter);
  };

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage.url);
      setSelectedImage(null);
      onCancel();
    } else {
      message.warning('Будь ласка, виберіть зображення');
    }
  };

  const columns = [
    {
      title: 'Прев\'ю',
      dataIndex: 'thumbnail_url',
      key: 'thumbnail',
      width: 100,
      render: (url: string) => (
        <div className={styles.thumbnailContainer}>
          <AntImage 
            src={url} 
            alt="Image thumbnail" 
            className={styles.thumbnail}
            preview={false}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
        </div>
      ),
    },
    {
      title: 'Назва',
      dataIndex: 'title_ua',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Ім\'я файлу',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
    },
    {
      title: 'Тип',
      dataIndex: 'pic_type',
      key: 'pic_type',
      width: 100,
      render: (type: string) => {
        const typeMap: { [key: string]: string } = {
          'news': 'Новини',
          'gallery': 'Галерея',
          'avatar': 'Аватар',
          'banner': 'Банер'
        };
        return typeMap[type] || type;
      },
    },
  ];

  return (
    <Modal
      title="Вибрати зображення з галереї"
      open={visible}
      onCancel={() => {
        setSelectedImage(null);
        onCancel();
      }}
      onOk={handleSelect}
      width={1000}
      okText="Вибрати"
      cancelText="Скасувати"
      okButtonProps={{ disabled: !selectedImage }}
    >
      <div className={styles.container}>
        <div className={styles.filters}>
          <Input.Search
            placeholder="Пошук зображень..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Тип зображення"
            value={picTypeFilter}
            onChange={(value) => {
              setPicTypeFilter(value);
              fetchImages(1, pagination.pageSize, searchText, value, tagsFilter);
            }}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="news">Новини</Option>
            <Option value="gallery">Галерея</Option>
            <Option value="avatar">Аватар</Option>
            <Option value="banner">Банер</Option>
          </Select>
          <div style={{ width: 200 }}>
            <TagSearchInput
              value={tagsFilter}
              onChange={setTagsFilter}
              onSearch={(value) => fetchImages(1, pagination.pageSize, searchText, picTypeFilter, value)}
              placeholder="Пошук по тегах..."
            />
          </div>
          <Button 
            type="primary" 
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Пошук
          </Button>
        </div>

        {selectedImage && (
          <div className={styles.selectedImagePreview}>
            <strong>Вибране зображення:</strong>
            <div className={styles.selectedImageInfo}>
              <AntImage 
                src={selectedImage.thumbnail_url} 
                alt={selectedImage.title_ua}
                width={100}
                height={75}
                style={{ objectFit: 'cover', borderRadius: 4 }}
              />
              <div>
                <div>{selectedImage.title_ua}</div>
                <div className={styles.selectedImageFilename}>{selectedImage.filename}</div>
              </div>
            </div>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={images}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: false,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} з ${total} зображень`,
            onChange: (page, pageSize) => {
              fetchImages(page, pageSize || 10, searchText, picTypeFilter, tagsFilter);
            },
          }}
          scroll={{ y: 400 }}
          rowClassName={(record) => 
            selectedImage?.id === record.id ? styles.selectedRow : ''
          }
          onRow={(record) => ({
            onClick: () => setSelectedImage(record),
            style: { cursor: 'pointer' },
          })}
        />
      </div>
    </Modal>
  );
};

export default ImageGallerySelector;

