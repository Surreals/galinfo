"use client";

import { useState } from "react";
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
} from "antd";
import type { UploadFile } from "antd";
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

const { TextArea } = Input;
const { Title } = Typography;

interface NewsEditorSidebarProps {
  isEditing: boolean;
  newsId: string | null;
  articleData?: ArticleData | null;
}

export default function NewsEditorSidebar({ isEditing, newsId, articleData }: NewsEditorSidebarProps) {
  // Завантажуємо дані через хук
  const { 
    articleTypes, 
    categories, 
    users, 
    languages, 
    tags: availableTags, 
    loading, 
    error 
  } = useArticleEditorData({ lang: 'ua' });

  // Фільтруємо дані
  const rubrics = getRubrics(categories);
  const themes = getThemes(categories);
  const regions = getRegions(categories);
  const editors = getEditors(users);
  const journalists = getJournalists(users);
  const bloggers = getBloggers(users);

  // Фото
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Тип статті
  const [articleType, setArticleType] = useState<number>(
    articleData?.ntype || ARTICLE_TYPE_OPTIONS[0].value
  );

  // Рубрика / Регіон (можна обрати кілька)
  const [selectedRubrics, setSelectedRubrics] = useState<number[]>(
    articleData?.rubric || []
  );
  const [selectedRegions, setSelectedRegions] = useState<number[]>(
    articleData?.region || []
  );

  // Тема
  const [selectedTheme, setSelectedTheme] = useState<number | null>(
    articleData?.theme || null
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
  const [mainFeed, setMainFeed] = useState(articleData?.rated || true);
  const [blockInMain, setBlockInMain] = useState(articleData?.headlineblock || false);
  const [noRss, setNoRss] = useState(articleData?.hiderss || false);
  const [banComments, setBanComments] = useState(articleData?.nocomment || false);
  const [mainInRubric, setMainInRubric] = useState(articleData?.maininblock || false);
  const [idToTop, setIdToTop] = useState<number>(articleData?.idtotop || 0);
  const [favBlock, setFavBlock] = useState(articleData?.suggest || false);
  const [markPhoto, setMarkPhoto] = useState(articleData?.photo || false);
  const [markVideo, setMarkVideo] = useState(articleData?.video || false);

  // Час публікації
  const [publishAt, setPublishAt] = useState<Dayjs | null>(
    articleData ? dayjs(`${articleData.ndate} ${articleData.ntime}`) : dayjs()
  );

  // Прапори публікації
  const [publishOnSite, setPublishOnSite] = useState(articleData?.approved || true);
  const [publishOnTwitter, setPublishOnTwitter] = useState(articleData?.to_twitter || true);

  // handlers
  const onSave = () => {
    const payload = {
      // Основні поля
      ntype: articleType,
      rubric: selectedRubrics,
      region: selectedRegions,
      theme: selectedTheme,
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
      ndate: publishAt?.format('YYYY-MM-DD'),
      ntime: publishAt?.format('HH:mm:ss'),
      
      // Публікація
      approved: publishOnSite,
      to_twitter: publishOnTwitter,
      
      // Зображення
      images: fileList.map((f) => f.name).join(','),
    };
    
    console.log('Article editor payload:', payload);
    message.success("Чернетку збережено (демо).");
  };

  const onDelete = () => {
    message.warning("Новину видалено (демо).");
  };

  if (loading) {
    return (
      <aside className={styles.sidebar}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
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
      {/* Заголовок */}
      <Title level={5} className={styles.heading}>
        Налаштування публікації
      </Title>

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
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false} // блокуємо реальний аплоад, лише превʼю
        >
          <div className={styles.uploadBtn}>
            <PictureOutlined />
            <div>Додати</div>
          </div>
        </Upload>
      </div>

      {/* Тип статті */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Тип статті</div>
        <Select
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
              options={rubrics.map(r => ({ label: r.title, value: r.id }))}
              className={styles.fullWidth}
              size="middle"
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
              options={regions.map(r => ({ 
                label: r.title, 
                value: r.id,
                description: r.description 
              }))}
              className={styles.fullWidth}
              size="middle"
            />
          </div>

          <div className={styles.subField}>
            <div className={styles.subLabel}>Тема</div>
            <Select
              placeholder="Оберіть тему"
              value={selectedTheme}
              onChange={setSelectedTheme}
              options={themes.map(t => ({ label: t.title, value: t.id }))}
              className={styles.fullWidth}
              size="middle"
              allowClear
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

      {/* Автори */}
      <div className={styles.flexRow}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Автор</div>
          <div className={styles.twoCols}>
            <div>
              <div className={styles.subLabel}>Редактор:</div>
              <Select
                placeholder="Оберіть редактора"
                value={editor}
                onChange={setEditor}
                options={editors.map(e => ({ label: e.name, value: e.id }))}
                className={styles.fullWidth}
                allowClear
              />
            </div>
            <div>
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
              />
            </div>
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
          <div className={styles.twoCols}>
            <div>
              <div className={styles.sectionTitle}>Пріоритет статті</div>
              <Select
                options={PRIORITY_OPTIONS}
                value={priority}
                onChange={setPriority}
                className={styles.fullWidth}
              />
            </div>
            <div>
              <div className={styles.sectionTitle}>Шаблон</div>
              <Select
                options={LAYOUT_OPTIONS}
                value={template}
                onChange={setTemplate}
                className={styles.fullWidth}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Додаткові параметри */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Додаткові параметри</div>

        <div className={styles.checkboxGrid}>
          <Checkbox
            checked={mainFeed}
            onChange={(e) => setMainFeed(e.target.checked)}
          >
            Головна стрічка
          </Checkbox>
          <Checkbox
            checked={blockInMain}
            onChange={(e) => setBlockInMain(e.target.checked)}
          >
            Блок в головній стрічці
          </Checkbox>
          <Checkbox checked={noRss} onChange={(e) => setNoRss(e.target.checked)}>
            НЕ транслювати в RSS
          </Checkbox>
          <Checkbox
            checked={banComments}
            onChange={(e) => setBanComments(e.target.checked)}
          >
            Заборонити коментарі
          </Checkbox>
          <Checkbox
            checked={mainInRubric}
            onChange={(e) => setMainInRubric(e.target.checked)}
          >
            Головна в блоці рубрик
          </Checkbox>

          <Checkbox
            checked={favBlock}
            onChange={(e) => setFavBlock(e.target.checked)}
          >
            Блок ВИБРАНЕ
          </Checkbox>
          <Checkbox
            checked={markPhoto}
            onChange={(e) => setMarkPhoto(e.target.checked)}
          >
            Позначати «з фото»
          </Checkbox>
          <Checkbox
            checked={markVideo}
            onChange={(e) => setMarkVideo(e.target.checked)}
          >
            Позначати «з відео»
          </Checkbox>
          <div className={styles.inline}>
            <div className={styles.inlineLabel}>ID —&gt; TOP</div>
            <Select
              style={{ minWidth: 120 }}
              value={idToTop}
              onChange={setIdToTop}
              options={ID_TO_TOP_OPTIONS}
            />
          </div>
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
        <div className={styles.timeHints}>
          <a>» Час останньої новини</a>
          <a>♥ Час останньої опублікованої</a>
          <a>» Час на сервері</a>
        </div>
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
      <div
        className={`${styles.publishBar} ${
          publishOnTwitter ? styles.publishBarActiveLight : ""
        }`}
      >
        <Checkbox
          checked={publishOnTwitter}
          onChange={(e) => setPublishOnTwitter(e.target.checked)}
        >
          Опублікувати в Twitter (Очікує публікації)
        </Checkbox>
      </div>

      <Divider className={styles.divider} />

      {/* Кнопки */}
      <div className={styles.actions}>
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          onClick={onSave}
          className={styles.greenBtn}
        >
          ЗБЕРЕГТИ
        </Button>

        <Button
          danger
          size="large"
          icon={<DeleteOutlined />}
          onClick={onDelete}
          className={styles.blueBtn}
        >
          ВИДАЛИТИ
        </Button>
      </div>
    </aside>
  );
}
