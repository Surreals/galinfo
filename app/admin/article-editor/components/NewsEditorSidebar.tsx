"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Select,
  Input,
  Checkbox,
  DatePicker,
  Button,
  Radio,
  Typography,
  Divider,
  message,
  Spin,
  App,
  Image,
} from "antd";
import type { UploadFile, GetProp, UploadProps } from "antd";

// Розширюємо тип UploadFile для збереження ID зображення
interface ExtendedUploadFile extends UploadFile {
  imageId?: number;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
import {
  PictureOutlined,
  DeleteOutlined,
  SaveOutlined,
  EyeOutlined,
  CopyOutlined,
  FileOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
import styles from "../NewsEditor.module.css";
import { 
  useArticleEditorData, 
  getRubrics, 
  getThemes, 
  getRegions, 
  ARTICLE_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  LAYOUT_OPTIONS,
  ID_TO_TOP_OPTIONS
} from "@/app/hooks/useArticleEditorData";
import { ArticleData } from "@/app/hooks/useArticleData";
import { useArticleSave } from "@/app/hooks/useArticleSave";
import { getImageUrl, ensureFullImageUrl } from "@/app/lib/imageUtils";
import { useAdminAuth } from "@/app/contexts/AdminAuthContext";
import { useRolePermissions } from "@/app/hooks/useRolePermissions";
import ImagePickerModal from "./ImagePickerModal";
import { useRouter } from "next/navigation";
import { MenuData } from "@/app/api/homepage/services/menuService";
import TimeButtons from "./TimeButtons";
import TagInput from "./TagInput";
import CustomMultiSelect from "./CustomMultiSelect";

const { TextArea } = Input;

interface NewsEditorSidebarProps {
  newsId: string | null;
  articleData?: ArticleData | null;
  menuData: MenuData | null;
  onEditorSave?: (() => Promise<string>) | null;
  fetchArticle?: (() => void) | undefined;
  isTitleValid?: boolean;
  onSidebarValidationChange?: (isValid: boolean) => void;
  onTagsChange?: (tags: string) => void;
  onDataChange?: (updates: Partial<ArticleData>) => void;
  onPublishStateChange?: (isPublishing: boolean) => void;
}

export default function NewsEditorSidebar({ newsId, articleData, menuData, onEditorSave, fetchArticle, isTitleValid, onSidebarValidationChange, onTagsChange, onDataChange, onPublishStateChange }: NewsEditorSidebarProps) {
  const router = useRouter();
  const { modal } = App.useApp();
  const [savingProcess, setSavingProcess] = useState(false);
  const { user } = useAdminAuth();
  const { permissions, isJournalist, isEditor, isAdmin } = useRolePermissions();
  
  // Стани для валідації
  const [typeError, setTypeError] = useState<string>("");
  const [rubricError, setRubricError] = useState<string>("");
  const [regionError, setRegionError] = useState<string>("");
  const [tagsError, setTagsError] = useState<string>("");
  
  // Завантажуємо дані через хук
  const {
    users,
    loading, 
    error 
  } = useArticleEditorData({ lang: 'ua' });


  const mainCategoriesResponse = menuData?.mainCategories || [];
  const regionsResponse = menuData?.regions || [];
  const specialThemesResponse = menuData?.specialThemes || [];


  // Стан для модалки зображень
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isMultipleImageModalOpen, setIsMultipleImageModalOpen] = useState(false);
  
  // Ref для контейнера зображень для автоскролу
  const imageScrollRef = useRef<HTMLDivElement>(null);

  // Стан для превью зображень
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // Функція для отримання base64 зображення
  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Функція для обробки превью зображення
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  // Функції для роботи з модалкою зображень
  const openImagePicker = () => {
    setIsImageModalOpen(true);
  };

  const closeImagePicker = () => {
    setIsImageModalOpen(false);
  };

  const closeMultipleImagePicker = () => {
    setIsMultipleImageModalOpen(false);
  };

  const handleMultipleImageSelect = (images: any[]) => {
    console.log('Multiple images selected:', images);
    
    // Додаємо всі вибрані зображення до списку файлів (як в одинарному виборі)
    images.forEach((image, index) => {
      const newFile = {
        uid: `image-${image.id}-${index}`,
        name: image.filename || image.title || `image-${image.id}`,
        status: 'done' as const,
        url: image.url || image.thumbnail_url,
        imageId: image.id,
        thumbUrl: image.thumbnail_url,
      };
      
      setFileList(prev => [...prev, newFile]);
    });

     // Автоскрол до кінця списку зображень
     setTimeout(() => {
      if (imageScrollRef.current) {
        const container = imageScrollRef.current;
        // Використовуємо smooth scroll для кращого UX
        container.scrollTo({
          left: container.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 400);
    
    message.success(`Додано ${images.length} зображень до статті`);
    closeMultipleImagePicker();
  };

  const handleImageSelect = (image: any) => {
    // Додаємо вибране зображення до списку файлів
    const newFile = {
      uid: `image-${image.id}`,
      name: image.filename,
      status: 'done' as const,
      url: image.url,
      thumbnail_url: image.thumbnail_url,
      imageId: image.id, // Зберігаємо ID зображення
    };
    
    setFileList(prev => [...prev, newFile]);
    closeImagePicker();
    
    // Автоскрол до кінця списку зображень
    setTimeout(() => {
      if (imageScrollRef.current) {
        const container = imageScrollRef.current;
        // Використовуємо smooth scroll для кращого UX
        container.scrollTo({
          left: container.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 400);
  };

  // Всі користувачі з a_powerusers (адміністратори/редактори)
  const allAuthors = users;

  // Фото
  const [fileList, setFileList] = useState<ExtendedUploadFile[]>([]);

  // Тип статті
  const [articleType, setArticleType] = useState<number>(
    articleData?.ntype || ARTICLE_TYPE_OPTIONS[0].value
  );

  const [selectedRubrics, setSelectedRubrics] = useState<string[]>(
    (articleData?.rubric || []).map(String)
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    (articleData?.region || []).map(String)
  );
  const [selectedTheme, setSelectedTheme] = useState<string | null>(
    !!articleData?.theme ? String(articleData.theme) : null
  );

  // Теги
  const [tags, setTags] = useState<string>(
    articleData?.tags.join(', ') || ""
  );

  // Автори
  const [editor, setEditor] = useState<number | null>(
    articleData?.nauthor || null
  );
  const [author, setAuthor] = useState<number | null>(
    articleData?.userid || null
  );
  const [showAuthorInfo, setShowAuthorInfo] = useState<boolean>(
    articleData?.showauthor ?? true  // За замовчуванням увімкнено
  );

  // Пріоритет / Шаблон
  const [priority, setPriority] = useState<number>(
    articleData?.nweight || PRIORITY_OPTIONS[0].value
  );
  const [template, setTemplate] = useState<number>(
    articleData?.layout || LAYOUT_OPTIONS[0].value
  );

  // Додаткові параметри
  const [mainFeed, setMainFeed] = useState<boolean>(articleData?.rated || true);
  const [blockInMain, setBlockInMain] = useState<boolean>(articleData?.headlineblock || false);
  const [noRss, setNoRss] = useState<boolean>(articleData?.hiderss || false);
  const [banComments, setBanComments] = useState<boolean>(articleData?.nocomment || false);
  const [mainInRubric, setMainInRubric] = useState<boolean>(articleData?.maininblock ?? true);  // За замовчуванням увімкнено (Головна стрічка)
  const [idToTop, setIdToTop] = useState<number>(articleData?.idtotop || 0);
  const [favBlock, setFavBlock] = useState<boolean>(articleData?.suggest || false);
  const [markPhoto, setMarkPhoto] = useState<boolean>(articleData?.photo || false);
  const [markVideo, setMarkVideo] = useState<boolean>(articleData?.video || false);
  const [isProject, setIsProject] = useState<boolean>(articleData?.isProject || false);

  // Час публікації
  const [publishAt, setPublishAt] = useState<Dayjs | null>(() => {
    if (articleData) {
      // API вже повертає час з +3 годинами, просто створюємо dayjs об'єкт
      return dayjs(`${articleData.ndate} ${articleData.ntime}`);
    }
    return dayjs();
  });

  // Прапори публікації
  const [publishOnSite, setPublishOnSite] = useState<boolean>(articleData?.approved || true);
  const [publishOnTwitter, setPublishOnTwitter] = useState<boolean>(articleData?.to_twitter || true);

  // Оновлюємо publishAt при зміні articleData
  useEffect(() => {
    if (articleData?.ndate && articleData?.ntime) {
      // API вже повертає час в локальному часовому поясі, просто створюємо dayjs об'єкт
      const newPublishAt = dayjs(`${articleData.ndate} ${articleData.ntime}`);
      setPublishAt(newPublishAt);
    }
  }, [articleData?.ndate, articleData?.ntime]);

  // Хук для збереження
  const { saving, saveArticle, deleteArticle } = useArticleSave({ 
    articleData, 
    newsId 
  });

  // Функції валідації
  const validateType = (type: number, isPublishing: boolean): boolean => {
    // Для чернетки тип не обов'язковий
    if (!isPublishing) {
      setTypeError("");
      return true;
    }
    
    if (!type) {
      setTypeError("Тип статті є обов'язковим");
      return false;
    }
    setTypeError("");
    return true;
  };

  const validateRubric = (rubrics: string[], isPublishing: boolean): boolean => {
    // Для чернетки рубрика не обов'язкова
    if (!isPublishing) {
      setRubricError("");
      return true;
    }
    
    if (!rubrics || rubrics.length === 0) {
      setRubricError("Оберіть хоча б одну рубрику");
      return false;
    }
    setRubricError("");
    return true;
  };

  const validateRegion = (regions: string[], isPublishing: boolean): boolean => {
    // Для чернетки регіон не обов'язковий
    if (!isPublishing) {
      setRegionError("");
      return true;
    }
    
    if (!regions || regions.length === 0) {
      setRegionError("Оберіть хоча б один регіон");
      return false;
    }
    setRegionError("");
    return true;
  };

  const validateTags = (tagString: string, isPublishing: boolean): boolean => {
    // Для чернетки теги не обов'язкові
    if (!isPublishing) {
      setTagsError("");
      return true;
    }
    
    // Для адміністраторів теги не обов'язкові
    if (isAdmin) {
      setTagsError("");
      return true;
    }
    
    const trimmedTags = tagString?.trim();
    if (!trimmedTags) {
      setTagsError("Теги є обов'язковими");
      return false;
    }
    setTagsError("");
    return true;
  };

  // Функція для оновлення загальної валідації sidebar
  const updateSidebarValidation = (
    currentType?: number,
    currentRubrics?: string[],
    currentRegions?: string[],
    currentTags?: string,
    isPublishing?: boolean
  ) => {
    // Використовуємо publishOnSite як індикатор, чи це публікація чи чернетка
    const publishing = isPublishing !== undefined ? isPublishing : publishOnSite;
    
    const isTypeValid = validateType(currentType !== undefined ? currentType : articleType, publishing);
    const isRubricValid = validateRubric(currentRubrics !== undefined ? currentRubrics : selectedRubrics, publishing);
    const isRegionValid = validateRegion(currentRegions !== undefined ? currentRegions : selectedRegions, publishing);
    const isTagsValid = validateTags(currentTags !== undefined ? currentTags : tags, publishing);
    
    const overallValid = isTypeValid && isRubricValid && isRegionValid && isTagsValid;
    onSidebarValidationChange?.(overallValid);
  };

  // Оновлюємо стан при зміні даних новини
  // Використовуємо articleData?.id як залежність, щоб не перезаписувати локальні зміни
  // при редагуванні інших полів (наприклад, заголовка або ліда)
  useEffect(() => {
    if (articleData && !loading && !savingProcess) {
      const rubrics = (articleData.rubric || []).map(String);
      const regions = (articleData.region || []).map(String);
      const tagsString = articleData.tags.join(', ');
      
      setArticleType(articleData.ntype);
      setSelectedRubrics(rubrics);
      setSelectedRegions(regions);
      setSelectedTheme(!!articleData.theme ? String(articleData.theme) : null);
      setTags(tagsString);
      setEditor(articleData.nauthor || null);
      setAuthor(articleData.nauthor || null); // Use same value as editor for consistency
      setShowAuthorInfo(articleData.showauthor);
      setPriority(articleData.nweight);
      setTemplate(articleData.layout);
      setMainFeed(articleData.rated);
      setBlockInMain(articleData.headlineblock);
      setNoRss(articleData.hiderss);
      setBanComments(articleData.nocomment);
      setMainInRubric(articleData.maininblock);
      setIdToTop(articleData.idtotop || 0);
      setFavBlock(articleData.suggest);
      setMarkPhoto(articleData.photo);
      setMarkVideo(articleData.video);
      setIsProject(articleData.isProject || false);
      const base = dayjs(articleData.ndate);
      const [h, m, s] = articleData.ntime.split(':').map(Number);
      setPublishAt(base.hour(h).minute(m).second(s));
      setPublishOnSite(articleData.approved);
      setPublishOnTwitter(articleData.to_twitter);
      
      // Оновлюємо файли зображень
      if (articleData.images && articleData.image_filenames && Array.isArray(articleData.image_filenames)) {
        const imageIds = articleData.images.split(',').map((id: string) => id.trim()).filter(id => id);
        
        // Створюємо мапу ID -> imageData для правильного співставлення
        const imageMap = new Map<string, typeof articleData.image_filenames[0]>();
        
        // Заповнюємо мапу даними з image_filenames
        articleData.image_filenames.forEach((imageData) => {
          if (imageData.id != null) {
            imageMap.set(imageData.id.toString(), imageData);
          }
        });
        
        // Створюємо imageFiles в тому ж порядку що й imageIds (правильний порядок)
        const imageFiles = imageIds.map((id: string) => {
          const imageData = imageMap.get(id);
          const filename = imageData?.filename || '';
          return {
            uid: `image-${id}`,
            name: filename,
            status: 'done' as const,
            url: filename ? getImageUrl(filename, 'full') : '',
            thumbUrl: filename ? getImageUrl(filename, 'tmb') : '',
            imageId: parseInt(id), // Зберігаємо ID зображення
          };
        });
        setFileList(imageFiles);
      }
      
      // Валідуємо всі поля після завантаження з актуальними значеннями
      const isPublishing = articleData.approved;
      validateType(articleData.ntype, isPublishing);
      validateRubric(rubrics, isPublishing);
      validateRegion(regions, isPublishing);
      validateTags(tagsString, isPublishing);
      updateSidebarValidation(articleData.ntype, rubrics, regions, tagsString, isPublishing);
    } else if (!articleData && !loading) {
      // Скидаємо до значень за замовчуванням при створенні нової новини
      setArticleType(ARTICLE_TYPE_OPTIONS[0].value);
      setSelectedRubrics([]);
      setSelectedRegions([]);
      setSelectedTheme(null);
      setTags("");
      // Встановлюємо поточного користувача як автора
      setEditor(user?.id || null);
      setAuthor(user?.id || null);
      setShowAuthorInfo(true);  // За замовчуванням увімкнено
      setPriority(PRIORITY_OPTIONS[0].value);
      setTemplate(LAYOUT_OPTIONS[0].value);
      setMainFeed(true);
      setBlockInMain(false);
      setNoRss(false);  // За замовчуванням вимкнено (не блокувати RSS)
      setBanComments(false);
      setMainInRubric(true);  // За замовчуванням увімкнено (Головна стрічка)
      setIdToTop(0);
      setFavBlock(false);
      setMarkPhoto(false);
      setMarkVideo(false);
      setIsProject(false);
      setPublishAt(dayjs());
      setPublishOnSite(false);
      setPublishOnTwitter(false);
      setFileList([]);
      
      // Валідуємо порожні поля (для нової новини за замовчуванням чернетка)
      const isPublishing = false; // За замовчуванням publishOnSite = false для нової новини
      validateType(ARTICLE_TYPE_OPTIONS[0].value, isPublishing);
      validateRubric([], isPublishing);
      validateRegion([], isPublishing);
      validateTags("", isPublishing);
      updateSidebarValidation(ARTICLE_TYPE_OPTIONS[0].value, [], [], "", isPublishing);
    }
  }, [articleData?.id, loading, user?.id]);

  // Перевалідація при зміні publishOnSite (коли вмикаємо/вимикаємо публікацію)
  useEffect(() => {
    updateSidebarValidation(articleType, selectedRubrics, selectedRegions, tags, publishOnSite);
    // Повідомляємо батьківський компонент про зміну статусу публікації
    onPublishStateChange?.(publishOnSite);
  }, [publishOnSite]);

  // Перевалідація при зміні ролі користувача (важливо для адмінів)
  useEffect(() => {
    if (isAdmin !== undefined) {
      updateSidebarValidation(articleType, selectedRubrics, selectedRegions, tags, publishOnSite);
    }
  }, [isAdmin]);

  // handlers
  const onSave = async () => {
    setSavingProcess(true);
    // Спочатку зберігаємо контент редактора та отримуємо актуальний HTML
    let currentNbody = articleData?.nbody || '';
    if (onEditorSave) {
      currentNbody = await onEditorSave();
    }

    // Role-based permission check for publishing
    // Journalists can only save as drafts
    let canPublish = publishOnSite;
    if (isJournalist && publishOnSite) {
      message.warning('Журналісти можуть зберігати новини тільки в чернетках');
      canPublish = false;
    }

    const payload = {
      // Основні поля
      nheader: articleData?.nheader || '',
      nsubheader: articleData?.nsubheader || '',
      nteaser: articleData?.nteaser || '',
      nbody: currentNbody,
      ntitle: articleData?.ntitle || '',
      ndescription: articleData?.ndescription || '',
      nkeywords: articleData?.nkeywords || '',
      sheader: articleData?.sheader || '',
      steaser: articleData?.steaser || '',
      
      // Тип та категорії
      ntype: articleType,
      rubric: selectedRubrics.map(Number),
      region: selectedRegions.map(Number),
      theme: selectedTheme ? Number(selectedTheme) : null,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      
      // Автори
      nauthor: editor,
      userid: editor, // Use same value as nauthor for consistency
      showauthor: showAuthorInfo,
      
      // Налаштування
      nweight: priority,
      layout: template,
      
      // Додаткові параметри
      rated: mainFeed,
      headlineblock: blockInMain,
      hiderss: noRss,
      nocomment: banComments,
      maininblock: mainInRubric,
      idtotop: idToTop,
      suggest: favBlock,
      photo: markPhoto,
      video: markVideo,
      isProject: isProject,
      
      // Час публікації
      ndate: (() => {
        if (!publishAt || !publishAt.isValid()) {
          // якщо дати немає — поточний час у форматі ISO
          return new Date().toISOString();
        }
        // publishAt – це moment або dayjs, тому викликаємо toISOString()
        return publishAt.toDate().toISOString();
      })(),
      ntime: (() => {
        if (!publishAt || !publishAt.isValid()) {
          return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        return publishAt.format('HH:mm:ss');
      })(),
      udate: Math.floor(Date.now() / 1000),
      
      // Публікація - respect role permissions
      approved: canPublish,
      to_twitter: publishOnTwitter,
      
      // Зображення - зберігаємо ID зображень, а не назви файлів
      // Використовуємо оригінальний порядок fileList для збереження
      images: fileList
        .map((f) => {
          // Пріоритет: imageId, потім uid (якщо це ID), потім name (якщо це ID)
          if (f.imageId) return f.imageId.toString();
          const uidId = f.uid.replace('image-', '');
          if (uidId && !isNaN(parseInt(uidId))) return uidId;
          // Якщо name - це ID (тільки цифри), використовуємо його
          if (f.name && /^\d+$/.test(f.name)) return f.name;
          return null;
        })
        .filter(id => id !== null)
        .join(','),
      // Додатково зберігаємо назви файлів для зручності
      // Використовуємо той самий порядок що й для images
      image_filenames: fileList.map((f) => ({
        id: f.imageId || parseInt(f.uid.replace('image-', '')) || 0,
        filename: f.name,
        title_ua: '',
        title_deflang: '',
        pic_type: 1 // За замовчуванням news
      })),
      
      // Мова
      lang: articleData?.lang || 'ua',
    };

    const result = await saveArticle(payload);
    if (result.success) {
      if (!newsId && result.id) {
        router.push(`/admin/article-editor?id=${result.id}`);
        return;
      }
      // Після успішного збереження існуючої новини перенаправляємо на список новин
      message.success('Новину успішно збережено');
      router.push('/admin/news');
      return;
    }


    fetchArticle?.();
    setSavingProcess(false);
  };

  const onDelete = async () => {
    const isApproved = articleData?.approved || false;
    
    // Якщо новина підтверджена (approved = true), переносимо в чернетки
    if (isApproved) {
      modal.confirm({
        title: 'Перемістити в чернетки',
        content: 'Ви впевнені, що хочете перемістити цю новину в чернетки?',
        okText: 'Так',
        cancelText: 'Скасувати',
        onOk: async () => {
          try {
            const response = await fetch(`/api/admin/news/move-to-draft?id=${newsId}`, {
              method: 'PUT'
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to move to draft');
            }
            
            message.success('Новину переміщено в чернетки');
            router.push('/admin/news');
          } catch (error) {
            message.error('Помилка при перенесенні в чернетки');
            console.error(error);
          }
        }
      });
      return;
    }
    
    // Якщо новина в чернетках (approved = false), видаляємо (тільки для адміна)
    if (!isAdmin) {
      message.warning('Тільки адміністратори можуть видаляти чернетки');
      return;
    }
    
    modal.confirm({
      title: 'Підтвердження видалення',
      content: 'Ви впевнені, що хочете видалити цю новину? Цю дію неможливо скасувати.',
      okText: 'Видалити',
      okType: 'danger',
      cancelText: 'Скасувати',
      onOk: async () => {
        const success = await deleteArticle();
        if (success) {
          router.push('/admin/news');
        }
      },
    });
  };

  if (loading) {
    return (
      <aside className={styles.sidebar}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', marginTop: '150px', width: '100%' }}>
          <Spin size="large" />
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className={styles.sidebar}>
        <div style={{ padding: '2rem', color: 'red' }}>
          Помилка завантаження даних: {error}
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar} style={{width: '50%'}}>
      <div className={styles.sidebarBox}>
        {/* Фото */}
        <div className={styles.section} style={{maxWidth: 350}}>
          {
            fileList.length ? <div className={styles.sectionLabel}>{fileList.length}</div> : null
          }
          <div className={styles.sectionTitle}>Фото</div>
          <div className={styles.imageScrollContainer} ref={imageScrollRef}>
            <Upload
              listType="picture-card"
              multiple
              fileList={fileList}
              onChange={({fileList}) => setFileList(fileList as ExtendedUploadFile[])}
              beforeUpload={() => false}
              onPreview={handlePreview}
              // openFileDialogOnClick={false}
              itemRender={(originNode, file, fileList, actions) => {
                const index = fileList.indexOf(file) + 1;
                return (
                  <div style={{ position: 'relative', height: '100%' }}>
                    {originNode}
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '4px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      zIndex: 1
                    }}>
                      {index}
                    </div>
                  </div>
                );
              }}
            >
              
            </Upload>
          </div>
          {/* <Button
            type="default"
            size="small"
            icon={<PictureOutlined/>}
            onClick={openImagePicker}
            style={{marginTop: '8px', width: '100%'}}
          >
            Вибрати з галереї
          </Button> */}
          <Button
            type="default"
            size="small"
            icon={<PictureOutlined/>}
            onClick={() => setIsMultipleImageModalOpen(true)}
            style={{marginTop: '8px', width: '100%'}}
          >
            Вибрати кілька зображень
          </Button>
        </div>

        {/* Тип статті */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Тип статті</div>
          <Select
            defaultValue={1}
            size="large"
            options={ARTICLE_TYPE_OPTIONS}
            value={articleType}
            onChange={(value) => {
              setArticleType(value);
              validateType(value, publishOnSite);
              updateSidebarValidation(value, undefined, undefined, undefined);
            }}
            className={styles.fullWidth}
            status={typeError ? "error" : undefined}
          />
          {typeError && (
            <div className={styles.errorMessage} style={{ marginTop: '4px' }}>
              {typeError}
            </div>
          )}
        </div>

        {/* Рубрики + Регіон + Тема */}
        <div className={styles.flexRow}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Рубрики</div>
            <div className={styles.scrollBox}>
              <CustomMultiSelect
                placeholder="Оберіть рубрики"
                value={selectedRubrics}
                onChange={(value) => {
                  setSelectedRubrics(value);
                  validateRubric(value, publishOnSite);
                  updateSidebarValidation(undefined, value, undefined, undefined);
                  // Синхронізуємо з articleData, щоб зміни не втрачалися
                  onDataChange?.({ rubric: value.map(Number) });
                }}
                options={mainCategoriesResponse.map((r) => ({
                  label: r.title,
                  value: r.id.toString(),
                }))}
                className={styles.fullWidth}
                size="middle"
                showSearch
                notFoundContent="Рубрики не знайдені"
                loading={loading}
                status={rubricError ? "error" : undefined}
              />
              {rubricError && (
                <div className={styles.errorMessage} style={{ marginTop: '4px' }}>
                  {rubricError}
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Регіон</div>
            <div className={styles.scrollBox}>
              <CustomMultiSelect
                placeholder="Оберіть регіони"
                value={selectedRegions}
                onChange={(value) => {
                  setSelectedRegions(value);
                  validateRegion(value, publishOnSite);
                  updateSidebarValidation(undefined, undefined, value, undefined);
                  // Синхронізуємо з articleData, щоб зміни не втрачалися
                  onDataChange?.({ region: value.map(Number) });
                }}
                options={regionsResponse.map((r) => ({
                  label: r.title,
                  value: r.id.toString(),
                }))}
                className={styles.fullWidth}
                size="middle"
                notFoundContent="Регіони не знайдені"
                loading={loading}
                status={regionError ? "error" : undefined}
              />
              {regionError && (
                <div className={styles.errorMessage} style={{ marginTop: '4px' }}>
                  {regionError}
                </div>
              )}
            </div>

            <div className={styles.subField}>
              <div className={styles.subLabel}>Тема</div>
              <Select
                placeholder="Оберіть тему"
                value={selectedTheme}
                onChange={setSelectedTheme}
                options={specialThemesResponse.map((t) => ({
                  label: t.title,
                  value: t.id.toString(),
                }))}
                className={styles.fullWidth}
                size="middle"
                allowClear
                showSearch
                notFoundContent="Теми не знайдені"
                loading={loading}
              />
            </div>
          </div>
        </div>
        {/* Теги */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Теги ( , )</div>
          <TagInput
            value={tags}
            onChange={(value) => {
              setTags(value);
              onTagsChange?.(value); // Notify parent component about tags change
              validateTags(value, publishOnSite);
              updateSidebarValidation(undefined, undefined, undefined, value);
            }}
            placeholder="Львівщина, полювання, ... "
            status={tagsError ? "error" : undefined}
          />
          {tagsError && (
            <div className={styles.errorMessage} style={{ marginTop: '4px' }}>
              {tagsError}
            </div>
          )}
        </div>

      </div>
      <div className={styles.sidebarBox}>


        {/* Автори */}
        <div className={styles.flexRow}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Автор</div>
            <div className={styles.twoCols}>

              <div className={styles.subLabel}>Автор / журналіст:</div>
              <Select
                placeholder="Оберіть автора"
                value={editor}
                onChange={setEditor}
                options={allAuthors.map(author => ({ 
                  label: author.name, 
                  value: author.id 
                }))}
                className={styles.fullWidth}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent="Автори не знайдені"
                loading={loading}
                disabled={isJournalist}
              />
              {isJournalist && (
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  Журналісти не можуть змінювати автора
                </div>
              )}
            </div>
            <Checkbox
              className={styles.mt8}
              checked={showAuthorInfo}
              onChange={(e) => setShowAuthorInfo(e.target.checked)}
            >
              Відображати інформацію про автора
            </Checkbox>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Пріоритет статті</div>
            <Select
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={setPriority}
              className={styles.fullWidth}
            />
          </div>
        </div>

        {/* Додаткові параметри */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Додаткові параметри</div>

          <div className={styles.checkboxGrid}>
            <Checkbox
              checked={mainInRubric}
              onChange={(e) => setMainInRubric(e.target.checked)}
            >
              Головна стрічка
            </Checkbox>
            <Checkbox
              checked={noRss}
              onChange={(e) => setNoRss(e.target.checked)}
            >
              Не транслювати в RSS
            </Checkbox>
            <Checkbox
              checked={isProject}
              onChange={(e) => setIsProject(e.target.checked)}
            >
              Проект
            </Checkbox>
          </div>
        </div>

        {/* Час публікації */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Час публікації</div>
          <DatePicker
            showTime
            value={publishAt}
            onChange={(v) => setPublishAt(v)}
            format="HH:mm DD.MM.YYYY"
            className={styles.fullWidth}
            placeholder="Оберіть дату та час публікації"
            title={publishAt ? `Поточний час: ${publishAt.format('HH:mm DD.MM.YYYY')}` : 'Оберіть дату та час публікації'}
          />
          <TimeButtons 
            publishAt={publishAt} 
            setPublishAt={setPublishAt} 
          />
        </div>

        {/* Плашки публікації */}
        <div
          className={`${styles.publishBar} ${
            publishOnSite ? styles.publishBarActive : ""
          }`}
        >
          <Checkbox
            checked={publishOnSite}
            onChange={(e) => setPublishOnSite(e.target.checked)}
            disabled={isJournalist}
          >
            Опублікувати на сайті
          </Checkbox>
          {isJournalist && (
            <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '4px' }}>
              ⚠️ Журналісти можуть зберігати тільки в чернетках
            </div>
          )}
        </div>
        <Divider className={styles.divider}/>

        {/* Кнопки */}
        <div className={styles.actions}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined/>}
            onClick={async () => {
              onSave();
            }}
            loading={saving}
            disabled={saving || !isTitleValid}
            className={styles.greenBtn}
          >
            ЗБЕРЕГТИ
          </Button>

          {newsId && (
            <>
              
              <Button
                danger={!articleData?.approved}
                size="large"
                icon={articleData?.approved ? <FileOutlined /> : <DeleteOutlined/>}
                onClick={onDelete}
                loading={saving}
                disabled={saving || (!articleData?.approved && !isAdmin)}
                className={styles.blueBtn}
                style={articleData?.approved ? { 
                  background: '#ffc107', 
                  borderColor: '#ffc107',
                  color: '#212529'
                } : undefined}
              >
                {articleData?.approved 
                  ? 'В ЧЕРНЕТКИ' 
                  : (isAdmin ? 'ВИДАЛИТИ' : 'НЕМАЄ ПРАВ')}
              </Button>
                <Button
                  // type="text"
                  size="large"
                  icon={<EyeOutlined/>}
                  onClick={async () => {
                    try {
                      // Викликаємо API для генерації preview URL
                      const response = await fetch(`/api/news/preview-url/${newsId}`);
                      if (!response.ok) {
                        throw new Error('Failed to generate preview URL');
                      }
                      
                      const data = await response.json();
                      const previewUrl = data.previewUrl;
                      
                      // Копіюємо URL в буфер обміну
                      await navigator.clipboard.writeText(previewUrl);
                      message.success('Preview URL скопійовано в буфер обміну!');
                    } catch (error) {
                      console.error('Error generating preview URL:', error);
                      message.error('Помилка генерації preview URL');
                    }
                  }}
                  loading={saving}
                  disabled={saving}
                  className={styles.previewBtn}
                  title="КОПІЮВАТИ PREVIEW URL"
                >
                  
                </Button>
            </>
          )}
        </div>
      </div>



      {/* Модалка для вибору зображень */}
      <ImagePickerModal
        open={isImageModalOpen}
        onClose={closeImagePicker}
        onSelect={handleImageSelect}
        currentImage={null}
      />

      {/* Модалка для множинного вибору зображень */}
      <ImagePickerModal
        open={isMultipleImageModalOpen}
        onClose={closeMultipleImagePicker}
        onSelect={handleImageSelect}
        onSelectMultiple={handleMultipleImageSelect}
        currentImage={null}
        allowMultiple={true}
      />

      {/* Превью зображення */}
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </aside>
);
}