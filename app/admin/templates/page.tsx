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
import { templateDocumentation } from './documentation';
import { useMenuContext } from '@/app/contexts/MenuContext';

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
            'article-mobile': articlePageMobileSchema
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
            initialJsonValues[template.id] = formatJson(template.schema);
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
        }
      ];

      setTemplates(initialTemplates);
      
      // Ініціалізуємо JSON значення для кожного шаблону
      const initialJsonValues: Record<string, string> = {};
      initialTemplates.forEach(template => {
        initialJsonValues[template.id] = formatJson(template.schema);
      });
      setJsonValues(initialJsonValues);
    };

    loadTemplates();
  }, []);

  // Форматування JSON з табуляцією
  const formatJson = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
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
  const handleReset = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const defaultJson = formatJson(template.defaultSchema);
      
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

  return (
    <div className={styles.adminPage}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Редактор шаблонів</h1>
          <p>Редагуйте JSON схеми для різних сторінок сайту</p>
          <button 
            className={styles.categoryInfoButton}
            onClick={() => setIsCategoryDrawerOpen(true)}
            title="Показати ID категорій"
          >
            📋 Довідник категорій
          </button>
        </div>

        <div className={styles.templatesGrid}>
          {templates.map((template) => (
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
                    value={jsonValues[template.id] || formatJson(template.schema)}
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
