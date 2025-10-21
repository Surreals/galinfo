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
  open: boolean;
  onClose: () => void;
  onSelect: (image: ImageItem) => void;
  onSelectMultiple?: (images: ImageItem[]) => void;
  currentImage?: ImageItem | null;
  allowMultiple?: boolean;
  // Нові пропси для роботи з вже вибраними зображеннями
  selectedImages?: ImageItem[];
  onImagesChange?: (images: ImageItem[]) => void;
}

export interface ImageGalleryProps {
  images: ImageItem[];
  onSelect: (image: ImageItem) => void;
  onSelectMultiple?: (images: ImageItem[]) => void;
  selectedImageId?: number;
  selectedImageIds?: number[];
  loading?: boolean;
  allowMultiple?: boolean;
}

export interface ImageUploadProps {
  onUpload: (file: File) => Promise<ImageItem>;
  onSuccess?: (image: ImageItem) => void;
  onError?: (error: string) => void;
}
