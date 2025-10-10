'use client';

import { useState, useEffect } from 'react';
import styles from './templates.module.css';
import { 
  desktopSchema, 
  mobileSchema 
} from '@/app/lib/schema';
import { 
  categoryDesktopSchema, 
  categoryMobileSchema 
} from '@/app/lib/categorySchema';
import { 
  heroSchema, 
  heroInfoSchema, 
  heroInfoMobileSchema 
} from '@/app/lib/heroSchema';
import { 
  articlePageDesktopSchema, 
  articlePageMobileSchema 
} from '@/app/lib/articlePageSchema';
import { headerSchema } from '@/app/lib/headerSchema';
import { footerSchema } from '@/app/lib/footerSchema';
import { 
  aboutPageSchema, 
  editorialPolicySchema, 
  advertisingPageSchema, 
  contactsPageSchema, 
  termsOfUsePageSchema 
} from '@/app/lib/editorialPageSchema';
import { templateDocumentation } from './documentation';
import { useMenuContext } from '@/app/contexts/MenuContext';
import EditorialPagesEditor from './EditorialPagesEditor';

interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  schema: any;
  defaultSchema: any;
  documentation: string;
}

export default function TemplatesPage() {
  const { menuData, loading: menuLoading } = useMenuContext();
  const [templates, setTemplates] = useState<SchemaTemplate[]>([]);
  const [modifiedTemplates, setModifiedTemplates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
  const [jsonValues, setJsonValues] = useState<Record<string, string>>({});
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'editorial'>('main');

  // Ініціалізація шаблонів
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        // Завантажуємо шаблони з бази даних
        const response = await fetch('/api/admin/templates');
        const result = await response.json();

        if (result.success && result.data) {
          // Створюємо мапінг дефолтних схем
          const defaultSchemas: Record<string, any> = {
            'main-desktop': desktopSchema,
            'main-mobile': mobileSchema,
            'category-desktop': categoryDesktopSchema,
            'category-mobile': categoryMobileSchema,
            'hero': heroSchema,
            'hero-info-desktop': heroInfoSchema,
            'hero-info-mobile': heroInfoMobileSchema,
            'article-desktop': articlePageDesktopSchema,
            'article-mobile': articlePageMobileSchema,
            'header': headerSchema,
            'footer': footerSchema,
            'about-page': aboutPageSchema,
            'editorial-policy': editorialPolicySchema,
            'advertising-page': advertisingPageSchema,
            'contacts-page': contactsPageSchema,
            'terms-of-use': termsOfUsePageSchema
          };

          // Конвертуємо дані з БД в формат компонента
          const templatesFromDb: SchemaTemplate[] = result.data.map((dbTemplate: any) => {
            // Parse JSON string from database into JavaScript object
            let parsedSchema;
            try {
              parsedSchema = typeof dbTemplate.schema_json === 'string' 
                ? JSON.parse(dbTemplate.schema_json) 
                : dbTemplate.schema_json;
            } catch (error) {
              console.error('Error parsing schema JSON:', error);
              parsedSchema = defaultSchemas[dbTemplate.template_id];
            }

            return {
              id: dbTemplate.template_id,
              name: dbTemplate.name,
              description: dbTemplate.description,
              schema: parsedSchema || defaultSchemas[dbTemplate.template_id],
              defaultSchema: defaultSchemas[dbTemplate.template_id] || parsedSchema,
              documentation: templateDocumentation[dbTemplate.template_id] || 'Немає документації'
            };
          });

          setTemplates(templatesFromDb);
          
          // Ініціалізуємо JSON значення для кожного шаблону
          const initialJsonValues: Record<string, string> = {};
          templatesFromDb.forEach(template => {
            initialJsonValues[template.id] = formatJson(template.schema, template.id);
          });
          setJsonValues(initialJsonValues);
        } else {
          // Якщо БД недоступна, використовуємо дефолтні шаблони
          console.warn('Database not available, using default templates');
          loadDefaultTemplates();
        }
      } catch (error) {
        console.error('Error loading templates from database:', error);
        // Використовуємо дефолтні шаблони як fallback
        loadDefaultTemplates();
      }
    };

    const loadDefaultTemplates = () => {
      const initialTemplates: SchemaTemplate[] = [
        {
          id: 'main-desktop',
          name: 'Головна сторінка (Десктоп)',
          description: 'Схема для десктопної версії головної сторінки',
          schema: desktopSchema,
          defaultSchema: desktopSchema,
          documentation: templateDocumentation['main-desktop']
        },
        {
          id: 'main-mobile',
          name: 'Головна сторінка (Мобільна)',
          description: 'Схема для мобільної версії головної сторінки',
          schema: mobileSchema,
          defaultSchema: mobileSchema,
          documentation: templateDocumentation['main-mobile']
        },
        {
          id: 'category-desktop',
          name: 'Сторінка категорії (Десктоп)',
          description: 'Схема для десктопної версії сторінки категорії',
          schema: categoryDesktopSchema,
          defaultSchema: categoryDesktopSchema,
          documentation: templateDocumentation['category-desktop']
        },
        {
          id: 'category-mobile',
          name: 'Сторінка категорії (Мобільна)',
          description: 'Схема для мобільної версії сторінки категорії',
          schema: categoryMobileSchema,
          defaultSchema: categoryMobileSchema,
          documentation: templateDocumentation['category-mobile']
        },
        {
          id: 'hero',
          name: 'Hero секція',
          description: 'Схема для Hero секції з каруселлю',
          schema: heroSchema,
          defaultSchema: heroSchema,
          documentation: templateDocumentation['hero']
        },
        {
          id: 'hero-info-desktop',
          name: 'Hero Info (Десктоп)',
          description: 'Схема для Hero Info секції (десктоп)',
          schema: heroInfoSchema,
          defaultSchema: heroInfoSchema,
          documentation: templateDocumentation['hero-info-desktop']
        },
        {
          id: 'hero-info-mobile',
          name: 'Hero Info (Мобільна)',
          description: 'Схема для Hero Info секції (мобільна)',
          schema: heroInfoMobileSchema,
          defaultSchema: heroInfoMobileSchema,
          documentation: templateDocumentation['hero-info-mobile']
        },
        {
          id: 'article-desktop',
          name: 'Сторінка статті (Десктоп)',
          description: 'Схема для десктопної версії сторінки статті',
          schema: articlePageDesktopSchema,
          defaultSchema: articlePageDesktopSchema,
          documentation: templateDocumentation['article-desktop']
        },
        {
          id: 'article-mobile',
          name: 'Сторінка статті (Мобільна)',
          description: 'Схема для мобільної версії сторінки статті',
          schema: articlePageMobileSchema,
          defaultSchema: articlePageMobileSchema,
          documentation: templateDocumentation['article-mobile']
        },
        {
          id: 'header',
          name: 'Налаштування хедера',
          description: 'Конфігурація хедера: порядок категорій та меню',
          schema: headerSchema,
          defaultSchema: headerSchema,
          documentation: templateDocumentation['header']
        },
        {
          id: 'footer',
          name: 'Налаштування футера',
          description: 'Конфігурація футера: порядок категорій та елементів',
          schema: footerSchema,
          defaultSchema: footerSchema,
          documentation: templateDocumentation['footer']
        },
        {
          id: 'about-page',
          name: 'Про редакцію',
          description: 'Шаблон для сторінки "Про редакцію"',
          schema: aboutPageSchema,
          defaultSchema: aboutPageSchema,
          documentation: templateDocumentation['about-page']
        },
        {
          id: 'editorial-policy',
          name: 'Редакційна політика',
          description: 'Шаблон для сторінки "Редакційна політика"',
          schema: editorialPolicySchema,
          defaultSchema: editorialPolicySchema,
          documentation: templateDocumentation['editorial-policy']
        },
        {
          id: 'advertising-page',
          name: 'Замовити рекламу',
          description: 'Шаблон для сторінки "Замовити рекламу"',
          schema: advertisingPageSchema,
          defaultSchema: advertisingPageSchema,
          documentation: templateDocumentation['advertising-page']
        },
        {
          id: 'contacts-page',
          name: 'Контакти',
          description: 'Шаблон для сторінки "Контакти"',
          schema: contactsPageSchema,
          defaultSchema: contactsPageSchema,
          documentation: templateDocumentation['contacts-page']
        },
        {
          id: 'terms-of-use',
          name: 'Правила використання',
          description: 'Шаблон для сторінки "Правила використання"',
          schema: termsOfUsePageSchema,
          defaultSchema: termsOfUsePageSchema,
          documentation: templateDocumentation['terms-of-use']
        }
      ];

      setTemplates(initialTemplates);
      
      // Ініціалізуємо JSON значення для кожного шаблону
      const initialJsonValues: Record<string, string> = {};
      initialTemplates.forEach(template => {
        initialJsonValues[template.id] = formatJson(template.schema, template.id);
      });
      setJsonValues(initialJsonValues);
    };

    loadTemplates();
  }, []);

  // Функція для видалення захищених полів з відображення
  const removeProtectedFields = (schema: any, templateId: string): any => {
    // Перевіряємо, чи це схема головної сторінки
    if (templateId !== 'main-desktop' && templateId !== 'main-mobile') {
      return schema;
    }

    // Якщо немає блоків, повертаємо схему без змін
    if (!schema?.blocks) {
      return schema;
    }

    // ID категорій CRIME та SPORT (з categoryUtils.ts)
    const CRIME_ID = 100;
    const SPORT_ID = 103;

    // Видаляємо захищені поля з блоків для відображення
    const cleanedBlocks = schema.blocks.map((block: any) => {
      // Перевіряємо, чи це захищений блок ColumnNews з CRIME та SPORT категоріями
      const isProtectedColumnNews = block.type === 'ColumnNews' && 
                                     block.categoryId === CRIME_ID && 
                                     block.sideCategoryId === SPORT_ID;
      
      if (isProtectedColumnNews && block.config) {
        // Видаляємо hardcodedInFomo та showAdvertisement
        const { hardcodedInFomo, showAdvertisement, ...restConfig } = block.config;
        return {
          ...block,
          config: restConfig
        };
      }
      
      return block;
    });

    return {
      ...schema,
      blocks: cleanedBlocks
    };
  };

  // Форматування JSON з табуляцією
  const formatJson = (obj: any, templateId?: string): string => {
    // Видаляємо захищені поля перед форматуванням для відображення
    const cleanedObj = templateId ? removeProtectedFields(obj, templateId) : obj;
    return JSON.stringify(cleanedObj, null, 2);
  };

  // Парсинг JSON з обробкою помилок
  const parseJson = (jsonString: string): any => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Невірний JSON формат');
    }
  };

  // Валідація JSON в реальному часі
  const validateJson = (jsonString: string): string | null => {
    if (!jsonString.trim()) {
      return null; // Порожній рядок не є помилкою
    }
    
    try {
      JSON.parse(jsonString);
      return null; // Валідний JSON
    } catch (error) {
      if (error instanceof SyntaxError) {
        return `Помилка синтаксису JSON: ${error.message}`;
      }
      return 'Невідома помилка парсингу JSON';
    }
  };

  // Обробка зміни JSON
  const handleJsonChange = (templateId: string, newJson: string) => {
    // Оновлюємо локальне значення
    setJsonValues(prev => ({
      ...prev,
      [templateId]: newJson
    }));

    // Валідуємо JSON
    const error = validateJson(newJson);
    
    if (error) {
      // Якщо є помилка, зберігаємо її та не оновлюємо схему
      setJsonErrors(prev => ({
        ...prev,
        [templateId]: error
      }));
      return;
    }

    // Якщо JSON валідний, очищаємо помилку та оновлюємо схему
    setJsonErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[templateId];
      return newErrors;
    });

    try {
      const parsedJson = parseJson(newJson);
      
      setTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...template, schema: parsedJson }
          : template
      ));

      setModifiedTemplates(prev => new Set([...prev, templateId]));
    } catch (error) {
      console.error('Помилка парсингу JSON:', error);
    }
  };

  // Збереження змін
  const handleSave = async (templateId: string) => {
    // Перевіряємо, чи є помилки валідації
    if (jsonErrors[templateId]) {
      alert('Неможливо зберегти: JSON містить помилки. Виправте помилки перед збереженням.');
      return;
    }

    // Перевіряємо, чи є незбережені зміни
    if (!modifiedTemplates.has(templateId)) {
      alert('Немає змін для збереження.');
      return;
    }

    setIsLoading(true);
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Шаблон не знайдено');
      }

      // Парсимо JSON з форми
      const schemaJson = parseJson(jsonValues[templateId]);

      // Відправляємо дані на сервер
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          name: template.name,
          description: template.description,
          schema_json: schemaJson
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Оновлюємо локальний стан
        setTemplates(prev => prev.map(t => 
          t.id === templateId 
            ? { ...t, schema: schemaJson }
            : t
        ));

        setModifiedTemplates(prev => {
          const newSet = new Set(prev);
          newSet.delete(templateId);
          return newSet;
        });
        
        alert('Шаблон успішно збережено!');
      } else {
        throw new Error(result.error || 'Помилка збереження');
      }
    } catch (error) {
      console.error('Помилка збереження:', error);
      alert(`Помилка збереження шаблону: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Скидання до дефолтних значень
  const handleReset = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      setIsLoading(true);
      
      // Відновлюємо дефолтні значення локально
      const defaultJson = formatJson(template.defaultSchema, templateId);
      
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, schema: t.defaultSchema }
          : t
      ));
      
      setJsonValues(prev => ({
        ...prev,
        [templateId]: defaultJson
      }));
      
      setModifiedTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });

      // Очищаємо помилки валідації
      setJsonErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[templateId];
        return newErrors;
      });

      // Зберігаємо дефолтні значення в базу даних
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          name: template.name,
          description: template.description,
          schema_json: template.defaultSchema
        }),
      });

      if (!response.ok) {
        throw new Error('Помилка збереження дефолтних значень');
      }

      const result = await response.json();
      if (result.success) {
        alert('Дефолтні значення успішно відновлено та збережено!');
      } else {
        throw new Error(result.error || 'Помилка збереження');
      }

    } catch (error) {
      console.error('Помилка відновлення дефолту:', error);
      alert(`Помилка відновлення дефолтних значень: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDocumentation = (templateId: string) => {
    setExpandedDocs(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(templateId)) {
        newExpanded.delete(templateId);
      } else {
        newExpanded.add(templateId);
      }
      return newExpanded;
    });
  };

  // Функція для фільтрації шаблонів за табом
  const getFilteredTemplates = () => {
    if (activeTab === 'main') {
      return templates.filter(template => 
        !['about-page', 'editorial-policy', 'advertising-page', 'contacts-page', 'terms-of-use'].includes(template.id)
      );
    } else {
      return templates.filter(template => 
        ['about-page', 'editorial-policy', 'advertising-page', 'contacts-page', 'terms-of-use'].includes(template.id)
      );
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Редактор шаблонів</h1>
          <p>Редагуйте JSON схеми для різних сторінок сайту</p>
          
          {/* Таби */}
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tab} ${activeTab === 'main' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('main')}
            >
              📄 Основні шаблони
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'editorial' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('editorial')}
            >
              📝 Шаблони для сторінок редакції
            </button>
          </div>

          <button 
            className={styles.categoryInfoButton}
            onClick={() => setIsCategoryDrawerOpen(true)}
            title="Показати ID категорій"
          >
            📋 Довідник категорій
          </button>
        </div>

        {/* Показуємо редактор для editorial сторінок */}
        {activeTab === 'editorial' ? (
          <EditorialPagesEditor />
        ) : (
          <div className={styles.templatesGrid}>
            {getFilteredTemplates().map((template) => (
            <div key={template.id} className={styles.templateCard}>
              <div className={styles.templateHeader}>
                <div className={styles.templateTitle}>
                  <h3>{template.name}</h3>
                  <button
                    className={styles.docsButton}
                    onClick={() => toggleDocumentation(template.id)}
                    title="Показати документацію"
                  >
                    📖
                  </button>
                </div>
                <p>{template.description}</p>
                
                {expandedDocs.has(template.id) && (
                  <div className={styles.documentation}>
                    <div className={styles.documentationContent}>
                      <pre>{template.documentation}</pre>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.templateContent}>
                <div className={styles.jsonEditor}>
                  <label htmlFor={`json-${template.id}`} className={styles.jsonLabel}>
                    JSON схема:
                  </label>
                  <textarea
                    id={`json-${template.id}`}
                    className={`${styles.jsonTextarea} ${jsonErrors[template.id] ? styles.jsonTextareaError : ''}`}
                    value={jsonValues[template.id] || formatJson(template.schema, template.id)}
                    onChange={(e) => handleJsonChange(template.id, e.target.value)}
                    placeholder="Введіть JSON схему..."
                    spellCheck={false}
                  />
                  {jsonErrors[template.id] && (
                    <div className={styles.errorMessage}>
                      {jsonErrors[template.id]}
                    </div>
                  )}
                </div>

                <div className={styles.templateActions}>
                  <button
                    className={`${styles.actionButton} ${styles.saveButton}`}
                    onClick={() => handleSave(template.id)}
                    disabled={!modifiedTemplates.has(template.id) || isLoading || !!jsonErrors[template.id]}
                  >
                    {isLoading ? 'Збереження...' : 'Зберегти'}
                  </button>
                  
                  <button
                    className={`${styles.actionButton} ${styles.resetButton}`}
                    onClick={() => handleReset(template.id)}
                    disabled={isLoading}
                  >
                    Відновити дефолт
                  </button>
                </div>

                {modifiedTemplates.has(template.id) && (
                  <div className={styles.modifiedIndicator}>
                    <span className={styles.modifiedDot}></span>
                    Є незбережені зміни
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Drawer з інформацією про категорії */}
      {isCategoryDrawerOpen && (
        <>
          <div 
            className={styles.drawerOverlay}
            onClick={() => setIsCategoryDrawerOpen(false)}
          />
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <h2>📋 Довідник ID категорій</h2>
              <button 
                className={styles.drawerCloseButton}
                onClick={() => setIsCategoryDrawerOpen(false)}
                title="Закрити"
              >
                ✕
              </button>
            </div>
            <div className={styles.drawerContent}>
              {menuLoading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingSpinner}></div>
                  Завантаження категорій...
                </div>
              ) : menuData ? (
                <>
                  <div className={styles.categorySection}>
                    <h3>Спеціальна категорія</h3>
                    <div className={styles.categoryList}>
                      <div className={styles.categoryItem}>
                        <span className={styles.categoryName}>Всі новини</span>
                        <span className={styles.categoryId}>ID: 0</span>
                      </div>
                    </div>
                  </div>

                  {menuData.mainCategories && menuData.mainCategories.length > 0 && (
                    <div className={styles.categorySection}>
                      <h3>Основні категорії (cattype = 1)</h3>
                      <div className={styles.categoryList}>
                        {menuData.mainCategories.map((category) => (
                          <div key={category.id} className={styles.categoryItem}>
                            <span className={styles.categoryName}>{category.title}</span>
                            <span className={styles.categoryId}>ID: {category.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {menuData.regions && menuData.regions.length > 0 && (
                    <div className={styles.categorySection}>
                      <h3>Регіони (cattype = 3)</h3>
                      <div className={styles.categoryList}>
                        {menuData.regions.map((category) => (
                          <div key={category.id} className={styles.categoryItem}>
                            <span className={styles.categoryName}>{category.title}</span>
                            <span className={styles.categoryId}>ID: {category.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {menuData.specialThemes && menuData.specialThemes.length > 0 && (
                    <div className={styles.categorySection}>
                      <h3>Спеціальні теми (cattype = 2)</h3>
                      <div className={styles.categoryList}>
                        {menuData.specialThemes.map((category) => (
                          <div key={category.id} className={styles.categoryItem}>
                            <span className={styles.categoryName}>{category.title}</span>
                            <span className={styles.categoryId}>ID: {category.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.errorMessage}>
                  Не вдалося завантажити категорії
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
