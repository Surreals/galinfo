export interface ImageItem {
  id: number;
  filename: string;
  title: string;
  pic_type: string;
  created_at: string;
  updated_at: string;
  // Додаткові поля для відображення
  url?: string;
  thumbnail_url?: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: ImageItem) => void;
  currentImage?: ImageItem | null;
}

export interface ImageGalleryProps {
  images: ImageItem[];
  onSelect: (image: ImageItem) => void;
  selectedImageId?: number;
  loading?: boolean;
}

export interface ImageUploadProps {
  onUpload: (file: File) => Promise<ImageItem>;
  onSuccess?: (image: ImageItem) => void;
  onError?: (error: string) => void;
}
