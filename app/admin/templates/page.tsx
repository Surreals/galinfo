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

interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  schema: any;
  defaultSchema: any;
  documentation: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<SchemaTemplate[]>([]);
  const [modifiedTemplates, setModifiedTemplates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
  const [jsonValues, setJsonValues] = useState<Record<string, string>>({});
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  // Ініціалізація шаблонів
  useEffect(() => {
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
      // Тут буде логіка збереження в базу даних
      console.log('Збереження шаблону:', templateId);
      
      // Симуляція збереження
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setModifiedTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
      
      alert('Шаблон успішно збережено!');
    } catch (error) {
      console.error('Помилка збереження:', error);
      alert('Помилка збереження шаблону');
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
    </div>
  );
}
