"use client";

import { useState, useEffect } from "react";
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
} from "antd";
import type { UploadFile } from "antd";

// Розширюємо тип UploadFile для збереження ID зображення
interface ExtendedUploadFile extends UploadFile {
  imageId?: number;
}
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
  getEditors, 
  getJournalists, 
  getBloggers,
  ARTICLE_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  LAYOUT_OPTIONS,
  ID_TO_TOP_OPTIONS
} from "@/app/hooks/useArticleEditorData";
import { ArticleData } from "@/app/hooks/useArticleData";
import { useArticleSave } from "@/app/hooks/useArticleSave";
import { getImageUrl, ensureFullImageUrl } from "@/app/lib/imageUtils";
import ImagePickerModal from "./ImagePickerModal";
import { useRouter } from "next/navigation";
import { MenuData } from "@/app/api/homepage/services/menuService";
import TimeButtons from "./TimeButtons";

const { TextArea } = Input;

interface NewsEditorSidebarProps {
  newsId: string | null;
  articleData?: ArticleData | null;
  menuData: MenuData | null;
  onEditorSave?: (() => Promise<string>) | null;
  fetchArticle?: (() => void) | undefined
}

export default function NewsEditorSidebar({ newsId, articleData, menuData, onEditorSave, fetchArticle }: NewsEditorSidebarProps) {
  const router = useRouter();
  const { modal } = App.useApp();
  
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
  };

  const journalists = getJournalists(users);
  const bloggers = getBloggers(users);

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
    articleData?.theme != null ? String(articleData.theme) : null
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

  // Оновлюємо стан при зміні даних новини
  useEffect(() => {
    if (articleData && !loading) {
      setArticleType(articleData.ntype);
      setSelectedRubrics((articleData.rubric || []).map(String)); // [2]
      setSelectedRegions((articleData.region || []).map(String)); // [2]
      setSelectedTheme(articleData.theme != null ? String(articleData.theme) : null);
      setTags(articleData.tags.join(', '));
      setEditor(articleData.nauthor || null);
      setAuthor(articleData.userid || null);
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
      if (articleData.images && articleData.image_filenames) {
        const imageIds = articleData.images.split(',').map((id: string) => id.trim()).filter(id => id);
        const imageFilenames = articleData.image_filenames.split(',').map((filename: string) => filename.trim()).filter(filename => filename);
        
        // Створюємо мапу ID -> filename для правильного співставлення
        const imageMap = new Map<string, string>();
        
        // Якщо кількість ID та filename однакова, співставляємо по індексу
        if (imageIds.length === imageFilenames.length) {
          imageIds.forEach((id, index) => {
            imageMap.set(id, imageFilenames[index]);
          });
        } else {
          // Якщо кількість не співпадає, використовуємо тільки ID
          console.warn('Image IDs and filenames count mismatch:', imageIds.length, imageFilenames.length);
        }
        
        const imageFiles = imageIds.map((id: string) => {
          const filename = imageMap.get(id) || '';
          return {
            uid: `image-${id}`,
            name: filename,
            status: 'done' as const,
            url: filename ? getImageUrl(filename, 'tmb') : '',
            imageId: parseInt(id), // Зберігаємо ID зображення
          };
        });
        setFileList(imageFiles);
      }
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
    }
  }, [articleData, loading]);

  // handlers
  const onSave = async () => {
    // Спочатку зберігаємо контент редактора та отримуємо актуальний HTML
    let currentNbody = articleData?.nbody || '';
    if (onEditorSave) {
      currentNbody = await onEditorSave();
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
      userid: author,
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
      
      // Публікація
      approved: publishOnSite,
      to_twitter: publishOnTwitter,
      
      // Зображення - зберігаємо ID зображень, а не назви файлів
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
      image_filenames: fileList.map((f) => f.name).join(','),
      
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
  };

  const onDelete = async () => {
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
        <div className={styles.section}>
          {
            fileList.length ? <div className={styles.sectionLabel}>{fileList.length}</div> : null
          }
          <div className={styles.sectionTitle}>Фото</div>
          <Upload
            listType="picture-card"
            multiple
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList as ExtendedUploadFile[])}
            beforeUpload={() => false} // блокуємо реальний аплоад, лише превʼю
          >
            <div className={styles.uploadBtn}>
              <PictureOutlined />
              <div>Додати</div>
            </div>
          </Upload>
          <Button
            type="default"
            size="small"
            icon={<PictureOutlined />}
            onClick={openImagePicker}
            style={{ marginTop: '8px', width: '100%' }}
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
            onChange={setArticleType}
            className={styles.fullWidth}
          />
        </div>

        {/* Рубрики + Регіон + Тема */}
        <div className={styles.flexRow}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Рубрики</div>
            <div className={styles.scrollBox}>
              <Select
                mode="multiple"
                placeholder="Оберіть рубрики"
                value={selectedRubrics}
                onChange={setSelectedRubrics}
                options={mainCategoriesResponse.map((r) => ({
                  label: r.title,
                  value: r.id.toString(),
                }))}
                className={styles.fullWidth}
                size="middle"
                showSearch
                notFoundContent="Рубрики не знайдені"
                loading={loading}
              />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Регіон</div>
            <div className={styles.scrollBox}>
              <Select
                mode="multiple"
                placeholder="Оберіть регіони"
                value={selectedRegions}
                onChange={setSelectedRegions}
                options={regionsResponse.map((r) => ({
                  label: r.title,
                  value: r.id.toString(),
                }))}
                className={styles.fullWidth}
                size="middle"
                showSearch
                notFoundContent="Регіони не знайдені"
                loading={loading}
              />
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
          <TextArea
            rows={2}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Львівщина, полювання, ... "
          />
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
                value={author}
                onChange={setAuthor}
                options={[
                  ...journalists.map(j => ({ label: j.name, value: j.id })),
                  ...bloggers.map(b => ({ label: `******* ${b.name}`, value: b.id }))
                ]}
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
              Не транслювати в RSS додати
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
          >
            Опублікувати на сайті
          </Checkbox>
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
            disabled={saving}
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
              ВИДАЛИТИ
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
    </aside>
);
}