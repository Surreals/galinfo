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
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
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
}

export default function NewsEditorSidebar({ newsId, articleData, menuData, onEditorSave, fetchArticle, isTitleValid, onSidebarValidationChange, onTagsChange }: NewsEditorSidebarProps) {
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
    articleData?.showauthor || false
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
  const [mainInRubric, setMainInRubric] = useState<boolean>(articleData?.maininblock || false);
  const [idToTop, setIdToTop] = useState<number>(articleData?.idtotop || 0);
  const [favBlock, setFavBlock] = useState<boolean>(articleData?.suggest || false);
  const [markPhoto, setMarkPhoto] = useState<boolean>(articleData?.photo || false);
  const [markVideo, setMarkVideo] = useState<boolean>(articleData?.video || false);

  // Час публікації
  const [publishAt, setPublishAt] = useState<Dayjs | null>(
    articleData ? dayjs(`${articleData.ndate} ${articleData.ntime}`) : dayjs()
  );

  // Прапори публікації
  const [publishOnSite, setPublishOnSite] = useState<boolean>(articleData?.approved || true);
  const [publishOnTwitter, setPublishOnTwitter] = useState<boolean>(articleData?.to_twitter || true);

  // Хук для збереження
  const { saving, saveArticle, deleteArticle } = useArticleSave({ 
    articleData, 
    newsId 
  });

  // Функції валідації
  const validateType = (type: number): boolean => {
    if (!type) {
      setTypeError("Тип статті є обов'язковим");
      return false;
    }
    setTypeError("");
    return true;
  };

  const validateRubric = (rubrics: string[]): boolean => {
    if (!rubrics || rubrics.length === 0) {
      setRubricError("Оберіть хоча б одну рубрику");
      return false;
    }
    setRubricError("");
    return true;
  };

  const validateRegion = (regions: string[]): boolean => {
    if (!regions || regions.length === 0) {
      setRegionError("Оберіть хоча б один регіон");
      return false;
    }
    setRegionError("");
    return true;
  };

  const validateTags = (tagString: string): boolean => {
    const trimmedTags = tagString?.trim();
    if (!trimmedTags) {
      setTagsError("Теги є обов'язковими");
      return false;
    }
    setTagsError("");
    return true;
  };

  // Функція для оновлення загальної валідації sidebar
  const updateSidebarValidation = () => {
    const isTypeValid = validateType(articleType);
    const isRubricValid = validateRubric(selectedRubrics);
    const isRegionValid = validateRegion(selectedRegions);
    const isTagsValid = validateTags(tags);
    
    const overallValid = isTypeValid && isRubricValid && isRegionValid && isTagsValid;
    onSidebarValidationChange?.(overallValid);
  };

  // Оновлюємо стан при зміні даних новини
  useEffect(() => {
    if (articleData && !loading && !savingProcess) {
      setArticleType(articleData.ntype);
      setSelectedRubrics((articleData.rubric || []).map(String)); // [2]
      setSelectedRegions((articleData.region || []).map(String)); // [2]
      setSelectedTheme(!!articleData.theme ? String(articleData.theme) : null);
      setTags(articleData.tags.join(', '));
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
          imageMap.set(imageData.id.toString(), imageData);
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
      
      // Валідуємо всі поля після завантаження
      validateType(articleData.ntype);
      validateRubric((articleData.rubric || []).map(String));
      validateRegion((articleData.region || []).map(String));
      validateTags(articleData.tags.join(', '));
      updateSidebarValidation();
    } else if (!articleData && !loading) {
      // Скидаємо до значень за замовчуванням при створенні нової новини
      setArticleType(ARTICLE_TYPE_OPTIONS[0].value);
      setSelectedRubrics([]);
      setSelectedRegions([]);
      setSelectedTheme(null);
      setTags("");
      setEditor(null);
      setAuthor(null);
      setShowAuthorInfo(false);
      setPriority(PRIORITY_OPTIONS[0].value);
      setTemplate(LAYOUT_OPTIONS[0].value);
      setMainFeed(true);
      setBlockInMain(false);
      setNoRss(false);
      setBanComments(false);
      setMainInRubric(false);
      setIdToTop(0);
      setFavBlock(false);
      setMarkPhoto(false);
      setMarkVideo(false);
      setPublishAt(dayjs());
      setPublishOnSite(false);
      setPublishOnTwitter(false);
      setFileList([]);
      
      // Валідуємо порожні поля
      validateType(ARTICLE_TYPE_OPTIONS[0].value);
      validateRubric([]);
      validateRegion([]);
      validateTags("");
      updateSidebarValidation();
    }
  }, [articleData, loading]);



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
    }


    fetchArticle?.();
    setSavingProcess(false);
  };

  const onDelete = async () => {
    // Only allow moving to draft for non-admins
    if (!isAdmin) {
      // Move to draft instead of delete
      modal.confirm({
        title: 'Перемістити в чернетки',
        content: 'Ви впевнені, що хочете перемістити цю новину в чернетки?',
        okText: 'Так',
        cancelText: 'Скасувати',
        onOk: async () => {
          const payload = {
            ...articleData,
            approved: false,
          };
          const result = await saveArticle(payload);
          if (result.success) {
            message.success('Новину переміщено в чернетки');
            router.push('/admin/news');
          }
        }
      });
      return;
    }
    
    // Full delete for admins
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
    <aside className={styles.sidebar}>
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
          <Button
            type="default"
            size="small"
            icon={<PictureOutlined/>}
            onClick={openImagePicker}
            style={{marginTop: '8px', width: '100%'}}
          >
            Вибрати з галереї
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
              validateType(value);
              updateSidebarValidation();
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
                  validateRubric(value);
                  updateSidebarValidation();
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
                  validateRegion(value);
                  updateSidebarValidation();
                }}
                options={regionsResponse.map((r) => ({
                  label: r.title,
                  value: r.id.toString(),
                }))}
                className={styles.fullWidth}
                size="middle"
                showSearch
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
              validateTags(value);
              updateSidebarValidation();
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
              />
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
              checked={mainFeed}
              onChange={(e) => setMainFeed(e.target.checked)}
            >
              Не транслювати в RSS
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
            <Button
              danger
              size="large"
              icon={<DeleteOutlined/>}
              onClick={onDelete}
              loading={saving}
              disabled={saving}
              className={styles.blueBtn}
            >
              {isAdmin ? 'ВИДАЛИТИ' : 'В ЧЕРНЕТКИ'}
            </Button>
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