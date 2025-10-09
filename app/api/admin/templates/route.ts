import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

// Import schema objects dynamically since they are .js files
const desktopSchema = require('@/app/lib/schema').desktopSchema;
const mobileSchema = require('@/app/lib/schema').mobileSchema;
const categoryDesktopSchema = require('@/app/lib/categorySchema').categoryDesktopSchema;
const categoryMobileSchema = require('@/app/lib/categorySchema').categoryMobileSchema;
const heroSchema = require('@/app/lib/heroSchema').heroSchema;
const heroInfoSchema = require('@/app/lib/heroSchema').heroInfoSchema;
const heroInfoMobileSchema = require('@/app/lib/heroSchema').heroInfoMobileSchema;
const articlePageDesktopSchema = require('@/app/lib/articlePageSchema').articlePageDesktopSchema;
const articlePageMobileSchema = require('@/app/lib/articlePageSchema').articlePageMobileSchema;
const headerSchema = require('@/app/lib/headerSchema').headerSchema;
const footerSchema = require('@/app/lib/footerSchema').footerSchema;
const { 
  aboutPageSchema, 
  editorialPolicySchema, 
  advertisingPageSchema, 
  contactsPageSchema, 
  termsOfUsePageSchema 
} = require('@/app/lib/editorialPageSchema');

export interface TemplateSchema {
  id: number;
  template_id: string;
  name: string;
  description: string;
  schema_json: any;
  created_at: string;
  updated_at: string;
}

// Function to ensure the table exists
async function ensureTableExists() {
  try {
    // Try to create the table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS template_schemas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_id VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        schema_json JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_template_id (template_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await executeQuery(createTableQuery);
  } catch (error) {
    console.error('Error ensuring table exists:', error);
    throw error;
  }
}

// Function to ensure default templates exist
async function ensureDefaultTemplates() {
  const defaultTemplates = [
    {
      template_id: 'main-desktop',
      name: 'Головна сторінка (Десктоп)',
      description: 'Схема для десктопної версії головної сторінки',
      schema: desktopSchema
    },
    {
      template_id: 'main-mobile',
      name: 'Головна сторінка (Мобільна)',
      description: 'Схема для мобільної версії головної сторінки',
      schema: mobileSchema
    },
    {
      template_id: 'category-desktop',
      name: 'Сторінка категорії (Десктоп)',
      description: 'Схема для десктопної версії сторінки категорії',
      schema: categoryDesktopSchema
    },
    {
      template_id: 'category-mobile',
      name: 'Сторінка категорії (Мобільна)',
      description: 'Схема для мобільної версії сторінки категорії',
      schema: categoryMobileSchema
    },
    {
      template_id: 'hero',
      name: 'Hero секція',
      description: 'Схема для Hero секції з каруселлю',
      schema: heroSchema
    },
    {
      template_id: 'hero-info-desktop',
      name: 'Hero Info (Десктоп)',
      description: 'Схема для Hero Info секції (десктоп)',
      schema: heroInfoSchema
    },
    {
      template_id: 'hero-info-mobile',
      name: 'Hero Info (Мобільна)',
      description: 'Схема для Hero Info секції (мобільна)',
      schema: heroInfoMobileSchema
    },
    {
      template_id: 'article-desktop',
      name: 'Сторінка статті (Десктоп)',
      description: 'Схема для десктопної версії сторінки статті',
      schema: articlePageDesktopSchema
    },
    {
      template_id: 'article-mobile',
      name: 'Сторінка статті (Мобільна)',
      description: 'Схема для мобільної версії сторінки статті',
      schema: articlePageMobileSchema
    },
    {
      template_id: 'header',
      name: 'Налаштування хедера',
      description: 'Конфігурація хедера: порядок категорій та меню',
      schema: headerSchema
    },
    {
      template_id: 'footer',
      name: 'Налаштування футера',
      description: 'Конфігурація футера: порядок категорій та елементів',
      schema: footerSchema
    },
    {
      template_id: 'about-page',
      name: 'Про редакцію',
      description: 'Шаблон для сторінки "Про редакцію"',
      schema: aboutPageSchema
    },
    {
      template_id: 'editorial-policy',
      name: 'Редакційна політика',
      description: 'Шаблон для сторінки "Редакційна політика"',
      schema: editorialPolicySchema
    },
    {
      template_id: 'advertising-page',
      name: 'Замовити рекламу',
      description: 'Шаблон для сторінки "Замовити рекламу"',
      schema: advertisingPageSchema
    },
    {
      template_id: 'contacts-page',
      name: 'Контакти',
      description: 'Шаблон для сторінки "Контакти"',
      schema: contactsPageSchema
    },
    {
      template_id: 'terms-of-use',
      name: 'Правила використання',
      description: 'Шаблон для сторінки "Правила використання"',
      schema: termsOfUsePageSchema
    }
  ];

  for (const template of defaultTemplates) {
    try {
      // Check if template exists
      const checkQuery = 'SELECT id FROM template_schemas WHERE template_id = ?';
      const [existing] = await executeQuery<{ id: number }>(checkQuery, [template.template_id]);

      if (existing.length === 0) {
        // Create template if it doesn't exist
        const insertQuery = `
          INSERT INTO template_schemas (template_id, name, description, schema_json)
          VALUES (?, ?, ?, ?)
        `;
        await executeQuery(insertQuery, [
          template.template_id,
          template.name,
          template.description,
          JSON.stringify(template.schema)
        ]);
        console.log(`Created default template: ${template.template_id}`);
      }
    } catch (error) {
      console.error(`Error creating template ${template.template_id}:`, error);
    }
  }
}

// Функція для додавання захардкодженого флагу для IN-FOMO реклами
function enforceHardcodedInFomo(schema: any, templateId: string): any {
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

  // Додаємо hardcodedInFomo та showAdvertisement для останнього блоку ColumnNews з CRIME та SPORT категоріями
  const updatedBlocks = schema.blocks.map((block: any) => {
    const isTargetColumnNews = block.type === 'ColumnNews' && 
                                block.categoryId === CRIME_ID && 
                                block.sideCategoryId === SPORT_ID;
    
    if (isTargetColumnNews) {
      return {
        ...block,
        config: {
          ...block.config,
          hardcodedInFomo: true, // Завжди встановлюємо true для цього блоку
          showAdvertisement: true // Завжди показуємо рекламу
        }
      };
    }
    return block;
  });

  return {
    ...schema,
    blocks: updatedBlocks
  };
}

// GET - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    // First, try to create the table if it doesn't exist
    await ensureTableExists();
    
    // Ensure default templates exist
    await ensureDefaultTemplates();

    const query = `
      SELECT id, template_id, name, description, schema_json, created_at, updated_at
      FROM template_schemas
      ORDER BY template_id
    `;

    const [templates] = await executeQuery<TemplateSchema>(query);

    // Додаємо захардкоджений флаг для IN-FOMO реклами в схемах головної сторінки
    const processedTemplates = templates.map((template: TemplateSchema) => {
      let schemaJson = template.schema_json;
      
      // Парсимо JSON якщо це строка
      if (typeof schemaJson === 'string') {
        try {
          schemaJson = JSON.parse(schemaJson);
        } catch (e) {
          console.error(`Failed to parse schema for ${template.template_id}:`, e);
          return template;
        }
      }

      // Додаємо захардкоджений флаг
      const updatedSchema = enforceHardcodedInFomo(schemaJson, template.template_id);

      return {
        ...template,
        schema_json: updatedSchema
      };
    });

    return NextResponse.json({
      success: true,
      data: processedTemplates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST - Create or update a template
export async function POST(request: NextRequest) {
  try {
    // First, ensure the table exists
    await ensureTableExists();
    
    // Ensure default templates exist
    await ensureDefaultTemplates();

    const body = await request.json();
    const { template_id, name, description, schema_json } = body;

    if (!template_id || !name || !schema_json) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: template_id, name, schema_json' },
        { status: 400 }
      );
    }

    // ЗАХИСТ: Автоматично додаємо hardcodedInFomo для потрібного блоку
    // навіть якщо адміністратор спробує його видалити або змінити
    const protectedSchema = enforceHardcodedInFomo(schema_json, template_id);

    // Check if template exists
    const checkQuery = 'SELECT id FROM template_schemas WHERE template_id = ?';
    const [existing] = await executeQuery<{ id: number }>(checkQuery, [template_id]);

    if (existing.length > 0) {
      // Update existing template
      const updateQuery = `
        UPDATE template_schemas 
        SET name = ?, description = ?, schema_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE template_id = ?
      `;
      
      await executeQuery(updateQuery, [name, description, JSON.stringify(protectedSchema), template_id]);
      
      return NextResponse.json({
        success: true,
        message: 'Template updated successfully',
        data: { template_id, name, description, schema_json: protectedSchema }
      });
    } else {
      // Create new template
      const insertQuery = `
        INSERT INTO template_schemas (template_id, name, description, schema_json)
        VALUES (?, ?, ?, ?)
      `;
      
      await executeQuery(insertQuery, [template_id, name, description, JSON.stringify(protectedSchema)]);
      
      return NextResponse.json({
        success: true,
        message: 'Template created successfully',
        data: { template_id, name, description, schema_json: protectedSchema }
      });
    }
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save template' },
      { status: 500 }
    );
  }
}

