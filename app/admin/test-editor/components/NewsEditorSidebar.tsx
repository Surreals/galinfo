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
} from "antd";
import type { UploadFile } from "antd";
import {
  PictureOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import styles from "../NewsEditor.module.css";

const { TextArea } = Input;
const { Title } = Typography;

const RUBRICS = [
  "Суспільство",
  "Політика",
  "Економіка",
  "Статті",
  "Культура",
  "Інтервʼю",
  "Здоров'я",
  "Війна з Росією",
];

const REGIONS = ["Україна", "Львів", "Європа", "Світ", "Волинь"];

const ARTICLE_TYPES = ["Новина", "Новина1", "Новина2"];

const PRIORITIES = ["Звичайний", "Високий", "Низький"];
const TEMPLATES = ["По замовчуванню", "Фото ліворуч", "Фото праворуч"];

// утил для Select options
const toOptions = (arr: string[]) => arr.map((v) => ({ label: v, value: v }));

export default function NewsEditorSidebar() {
  // Фото
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Тип статті
  const [articleType, setArticleType] = useState<string>(ARTICLE_TYPES[0]);

  // Рубрика / Регіон (обрати лише один)
  const [rubric, setRubric] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);

  // Тема
  const [topic, setTopic] = useState<string>("...");

  // Теги
  const [tags, setTags] = useState<string>("");

  // Автори
  const [editor, setEditor] = useState<string>("—");
  const [author, setAuthor] = useState<string>("—");
  const [showAuthorInfo, setShowAuthorInfo] = useState<boolean>(false);

  // Пріоритет / Шаблон
  const [priority, setPriority] = useState<string>(PRIORITIES[0]);
  const [template, setTemplate] = useState<string>(TEMPLATES[0]);

  // Додаткові параметри
  const [mainFeed, setMainFeed] = useState(true);
  const [blockInMain, setBlockInMain] = useState(false);
  const [noRss, setNoRss] = useState(false);
  const [banComments, setBanComments] = useState(false);
  const [mainInRubric, setMainInRubric] = useState(false);
  const [idToTop, setIdToTop] = useState<string | number>("");
  const [favBlock, setFavBlock] = useState(false);
  const [markPhoto, setMarkPhoto] = useState(false);
  const [markVideo, setMarkVideo] = useState(false);

  // Час публікації
  const [publishAt, setPublishAt] = useState<Dayjs | null>(dayjs());

  // Прапори публікації
  const [publishOnSite, setPublishOnSite] = useState(true);
  const [publishOnTwitter, setPublishOnTwitter] = useState(true);

  // handlers
  const onSave = () => {
    const payload = {
      fileList: fileList.map((f) => f.name),
      articleType,
      rubric,
      region,
      topic,
      tags,
      editor,
      author,
      showAuthorInfo,
      priority,
      template,
      mainFeed,
      blockInMain,
      noRss,
      banComments,
      mainInRubric,
      idToTop,
      favBlock,
      markPhoto,
      markVideo,
      publishAt: publishAt?.toISOString(),
      publishOnSite,
      publishOnTwitter,
    };
    // тут можна відправити payload на бекенд
    // console.log(payload);
    message.success("Чернетку збережено (демо).");
  };

  const onDelete = () => {
    message.warning("Новину видалено (демо).");
  };

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
          options={toOptions(ARTICLE_TYPES)}
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
            <Radio.Group
              className={styles.radioCol}
              value={rubric ?? undefined}
              onChange={(e) => setRubric(e.target.value)}
            >
              {RUBRICS.map((r) => (
                <Radio key={r} value={r} className={styles.radioItem}>
                  {r}
                </Radio>
              ))}
            </Radio.Group>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Регіон</div>
          <div className={styles.scrollBox}>
            <Radio.Group
              className={styles.radioCol}
              value={region ?? undefined}
              onChange={(e) => setRegion(e.target.value)}
            >
              {REGIONS.map((r) => (
                <Radio key={r} value={r} className={styles.radioItem}>
                  {r}
                </Radio>
              ))}
            </Radio.Group>
          </div>

          <div className={styles.subField}>
            <div className={styles.subLabel}>Тема</div>
            <Select
              options={toOptions(["...", "Тема 1", "Тема 2"])}
              value={topic}
              onChange={setTopic}
              className={styles.fullWidth}
              size="middle"
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
                options={toOptions([
                  "Христина Коновал",
                  "Редактор 2",
                  "Редактор 3",
                  "—",
                ])}
                value={editor}
                onChange={setEditor}
                className={styles.fullWidth}
              />
            </div>
            <div>
              <div className={styles.subLabel}>Автор / журналіст:</div>
              <Select
                options={toOptions(["******* блогери", "Автор 1", "Автор 2", "—"])}
                value={author}
                onChange={setAuthor}
                className={styles.fullWidth}
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
                options={toOptions(PRIORITIES)}
                value={priority}
                onChange={setPriority}
                className={styles.fullWidth}
              />
            </div>
            <div>
              <div className={styles.sectionTitle}>Шаблон</div>
              <Select
                options={toOptions(TEMPLATES)}
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
