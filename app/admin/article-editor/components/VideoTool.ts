import { BlockToolConstructorOptions } from '@editorjs/editorjs';

interface VideoToolData {
  file: {
    url: string;
  };
  caption: string;
  withBorder: boolean;
  withBackground: boolean;
  stretched: boolean;
}

interface VideoToolConfig {
  endpoints: {
    byFile: string;
    byUrl: string;
  };
  field?: string;
  types?: string;
  captionPlaceholder?: string;
  buttonContent?: string;
}

class VideoTool {
  private data: VideoToolData;
  private config: VideoToolConfig;
  private api: any;
  private readOnly: boolean;
  private block: any;
  private wrapper: HTMLElement | null = null;

  static get toolbox() {
    return {
      title: 'Відео',
      icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4Z" fill="currentColor"/><path d="M8 6L14 10L8 14V6Z" fill="white"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, config, api, readOnly, block }: BlockToolConstructorOptions<VideoToolData, VideoToolConfig>) {
    this.data = data || {
      file: { url: '' },
      caption: '',
      withBorder: false,
      withBackground: false,
      stretched: false
    };
    
    // Ensure file object exists even if data is provided
    if (!this.data.file) {
      this.data.file = { url: '' };
    }
    
    this.config = config || {
      endpoints: {
        byFile: '/api/admin/videos/upload',
        byUrl: '/api/admin/videos/upload'
      }
    };
    this.api = api;
    this.readOnly = readOnly;
    this.block = block;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'video-tool';
    
    if (this.data.file?.url) {
      this.renderVideo();
    } else {
      this.renderUploadArea();
    }

    return this.wrapper;
  }

  private renderVideo() {
    if (!this.wrapper) return;

    // Ensure file object exists
    if (!this.data.file) {
      this.data.file = { url: '' };
    }

    console.log('🎬 VideoTool: Rendering video with URL:', this.data.file.url);
    console.log('🎬 VideoTool: Full data:', JSON.stringify(this.data, null, 2));

    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.style.cssText = 'margin: 20px 0; text-align: center;';

    const video = document.createElement('video');
    video.controls = true;
    video.style.cssText = 'max-width: 100%; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);';
    video.preload = 'metadata';

    // Add multiple source formats
    // Only add source tag for the actual video file type
    const source = document.createElement('source');
    source.src = this.data.file.url;
    
    // Determine MIME type from file extension
    const fileExtension = this.data.file.url.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'ogv': 'video/ogg',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
    };
    
    source.type = mimeTypes[fileExtension || ''] || 'video/mp4';
    video.appendChild(source);

    // Fallback text for unsupported browsers
    const fallbackText = document.createTextNode('Ваш браузер не підтримує відео тег.');
    video.appendChild(fallbackText);

    // Add error handler
    video.addEventListener('error', (e) => {
      console.error('❌ Video loading error:', e);
      console.error('Video URL:', this.data.file.url);
      console.error('Video type:', source.type);
      
      // Show error message in the video container
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = 'padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; color: #856404; margin-top: 10px;';
      errorMsg.innerHTML = `
        <strong>⚠️ Відео не вдалося завантажити</strong><br>
        <small>Формат: ${fileExtension?.toUpperCase()}<br>
        Браузер може не підтримувати цей формат відео.<br>
        Рекомендується використовувати MP4 формат.</small>
      `;
      videoContainer.appendChild(errorMsg);
    });

    // Add loadedmetadata event to confirm video is loading
    video.addEventListener('loadedmetadata', () => {
      console.log('✅ Video metadata loaded successfully');
      console.log('Duration:', video.duration, 'seconds');
      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    });

    videoContainer.appendChild(video);
    
    // Trigger video load
    video.load();

    // Add caption if exists
    if (this.data.caption) {
      const caption = document.createElement('div');
      caption.className = 'video-caption';
      caption.style.cssText = 'text-align: center; margin-top: 8px; font-style: italic; color: #666;';
      caption.textContent = this.data.caption;
      videoContainer.appendChild(caption);
    }

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(videoContainer);
  }

  private renderUploadArea() {
    if (!this.wrapper) return;

    const uploadArea = document.createElement('div');
    uploadArea.className = 'video-upload-area';
    uploadArea.style.cssText = `
      border: 2px dashed #d9d9d9;
      border-radius: 6px;
      padding: 40px;
      text-align: center;
      background-color: #fafafa;
      margin: 20px 0;
    `;

    const uploadButton = document.createElement('button');
    uploadButton.textContent = this.config.buttonContent || 'Вибрати відео';
    uploadButton.style.cssText = `
      padding: 8px 16px;
      background: #1890ff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    uploadButton.onclick = () => this.triggerFileUpload();

    const urlButton = document.createElement('button');
    urlButton.textContent = 'Або вставити URL відео';
    urlButton.style.cssText = `
      padding: 4px 8px;
      background: transparent;
      color: #1890ff;
      border: none;
      cursor: pointer;
      font-size: 12px;
      margin-top: 8px;
    `;
    urlButton.onclick = () => this.showUrlModal();

    uploadArea.appendChild(uploadButton);
    uploadArea.appendChild(document.createElement('br'));
    uploadArea.appendChild(urlButton);

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(uploadArea);
  }

  private triggerFileUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.uploadFile(file);
      }
    };
    input.click();
  }

  private async uploadFile(file: File) {
    if (!file.type.startsWith('video/')) {
      alert('Будь ласка, виберіть відео файл');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      alert('Розмір файлу не повинен перевищувати 100MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('video_type', 'news');
      formData.append('description', '');

      console.log('Uploading video file:', file.name, 'Size:', file.size);

      const response = await fetch(this.config.endpoints.byFile, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload response:', result);

      if (response.ok && result.success) {
        // Ensure file object exists
        if (!this.data.file) {
          this.data.file = { url: '' };
        }
        this.data.file.url = result.video.url;
        console.log('Video uploaded successfully:', result.video.url);
        this.renderVideo();
        this.api.blocks.update(this.block.id, this.data);
      } else {
        console.error('Upload failed:', result);
        alert(result.error || 'Помилка завантаження відео');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Помилка завантаження відео');
    }
  }

  private showUploadModal() {
    // Simple prompt for URL input
    const url = prompt('Вставте URL відео:');
    if (url) {
      this.uploadByUrl(url);
    }
  }

  private showUrlModal() {
    this.showUploadModal();
  }

  private async uploadByUrl(url: string) {
    if (!url) return;

    try {
      console.log('Uploading video by URL:', url);

      const response = await fetch(this.config.endpoints.byUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();
      console.log('URL upload response:', result);

      if (response.ok && result.success) {
        // Ensure file object exists
        if (!this.data.file) {
          this.data.file = { url: '' };
        }
        this.data.file.url = result.video.url;
        console.log('Video uploaded successfully by URL:', result.video.url);
        this.renderVideo();
        this.api.blocks.update(this.block.id, this.data);
      } else {
        console.error('URL upload failed:', result);
        alert(result.error || 'Помилка завантаження відео');
      }
    } catch (error) {
      console.error('Error uploading video by URL:', error);
      alert('Помилка завантаження відео');
    }
  }

  private editCaption() {
    const newCaption = prompt('Введіть підпис до відео:', this.data.caption);
    if (newCaption !== null) {
      this.data.caption = newCaption;
      this.renderVideo();
      this.api.blocks.update(this.block.id, this.data);
    }
  }

  private deleteVideo() {
    if (confirm('Ви впевнені, що хочете видалити це відео?')) {
      this.api.blocks.delete(this.block.id);
    }
  }

  save() {
    return this.data;
  }

  validate(savedData: VideoToolData) {
    if (!savedData.file?.url) {
      return false;
    }
    return true;
  }
}

export default VideoTool;
