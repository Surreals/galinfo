import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface EditorialPage {
  id: number;
  page_id: string;
  title: string;
  path: string;
  html_content: string;
  created_at: string;
  updated_at: string;
}

// Function to ensure the table exists
async function ensureTableExists() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS editorial_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        path VARCHAR(255) NOT NULL,
        html_content LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_page_id (page_id),
        INDEX idx_path (path)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await executeQuery(createTableQuery);
  } catch (error) {
    console.error('Error ensuring table exists:', error);
    throw error;
  }
}

// Default HTML content for each page
const defaultPages = [
  {
    page_id: 'about',
    title: 'Про редакцію',
    path: '/about',
    html_content: `
      <h1>ПРО РЕДАКЦІЮ</h1>
      <p><strong>Увага ! Матеріали сайту призначені для осіб старше 21 року (21+)</strong></p>
      
      <h2>Про Агенцію</h2>
      <p>Агенція інформації та аналітики «Гал-інфо» працює в інформаційній сфері Львівської області та України з початку 2005 року. Є зареєстрованим суб'єктом у сфері онлайн-медіа. Рішення Національної ради з питань телебачення та радіомовлення №259 від 01.02.2024. Ідентифікатор медіа R40-02551.</p>
      <p>Основними видами діяльності Агенції є одержання та поширення інформації, надання інформаційних послуг, формування якісного мультимедійного контенту.</p>
      <p>Головну увагу Агенція зосереджує на подіях та явищах в галузі політики, економіки, культури, охорони здоров'я, а також у соціальній, екологічній, міжнародній та інших сферах.</p>
      <p>Діяльність Агенції насамперед спрямована на поширення добірних щоденних новин, передачу нових знань та організацію громадського дискурсу з актуальних суспільних тем.</p>
      <p>У своїй діяльності Гал-інфо керується стандартами новинної журналістики.</p>
      
      <h2>Контактна інформація</h2>
      <p><strong>Телефон редакції:</strong> (093) 77-07-018</p>
      <p><strong>e-mail:</strong> info@galinfo.com.ua</p>
      
      <h3>Адреса для листування:</h3>
      <p>79008, м.Львів<br>
      вул. Гуцульська 9а<br>
      ТзОВ"Агенція інформації та аналітики «Гал-інфо»</p>
      
      <h2>Реєстр журналістських посвідчень АІА "Гал-інфо"</h2>
      <ul>
        <li>LV-G-001-UA - головний редактор Андрій Маринюк</li>
        <li>LV-G-002-UA - журналістка Марічка Твардовська</li>
        <li>LV-G-003-UA - журналістка Вікторія Тимофій</li>
        <li>LV-G-004-UA - журналіст Мирослав Ватащук</li>
        <li>LV-G-010-UA - посвідчення практиканта</li>
        <li>LV-G-011-UA - посвідчення практиканта</li>
        <li>LV-G-012-UA - посвідчення практиканта</li>
        <li>LV-G-013-UA - посвідчення практиканта</li>
      </ul>
      <p>Посвідчення чинні до 01.03.2027</p>
    `
  },
  {
    page_id: 'editorial-policy',
    title: 'Редакційна політика',
    path: '/editorial-policy',
    html_content: `
      <h1>РЕДАКЦІЙНА ПОЛІТИКА</h1>
      <p>Редакційна політика сайту galinfo.com.ua буде додана найближчим часом.</p>
    `
  },
  {
    page_id: 'advertising',
    title: 'Замовити рекламу',
    path: '/advertising',
    html_content: `
      <h1>ЗАМОВИТИ РЕКЛАМУ</h1>
      <p>Інформація про рекламу буде додана найближчим часом.</p>
      <p><strong>Контакти:</strong></p>
      <p>Телефон: (093) 77-07-018</p>
      <p>Email: info@galinfo.com.ua</p>
    `
  },
  {
    page_id: 'contacts',
    title: 'Контакти',
    path: '/contacts',
    html_content: `
      <h1>КОНТАКТИ</h1>
      <h2>Контактна інформація редакції</h2>
      <p><strong>Телефон редакції:</strong> (093) 77-07-018</p>
      <p><strong>e-mail:</strong> info@galinfo.com.ua</p>
      
      <h3>Адреса для листування:</h3>
      <p>79008, м.Львів<br>
      вул. Гуцульська 9а<br>
      ТзОВ"Агенція інформації та аналітики «Гал-інфо»</p>
    `
  },
  {
    page_id: 'terms-of-use',
    title: 'Правила використання',
    path: '/terms-of-use',
    html_content: `
      <h1>ПРАВИЛА ВИКОРИСТАННЯ</h1>
      <p>Правила використання сайту galinfo.com.ua будуть додані найближчим часом.</p>
    `
  }
];

// Function to ensure default pages exist
async function ensureDefaultPages() {
  for (const page of defaultPages) {
    try {
      const checkQuery = 'SELECT id FROM editorial_pages WHERE page_id = ?';
      const [existing] = await executeQuery<{ id: number }>(checkQuery, [page.page_id]);

      if (existing.length === 0) {
        const insertQuery = `
          INSERT INTO editorial_pages (page_id, title, path, html_content)
          VALUES (?, ?, ?, ?)
        `;
        await executeQuery(insertQuery, [
          page.page_id,
          page.title,
          page.path,
          page.html_content.trim()
        ]);
        console.log(`Created default page: ${page.page_id}`);
      }
    } catch (error) {
      console.error(`Error creating page ${page.page_id}:`, error);
    }
  }
}

// GET - Fetch all editorial pages or a specific one
export async function GET(request: NextRequest) {
  try {
    await ensureTableExists();
    await ensureDefaultPages();

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('page_id');

    if (pageId) {
      // Fetch specific page
      const query = `
        SELECT id, page_id, title, path, html_content, created_at, updated_at
        FROM editorial_pages
        WHERE page_id = ?
      `;
      const [pages] = await executeQuery<EditorialPage>(query, [pageId]);

      if (pages.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Page not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: pages[0],
      });
    } else {
      // Fetch all pages
      const query = `
        SELECT id, page_id, title, path, html_content, created_at, updated_at
        FROM editorial_pages
        ORDER BY page_id
      `;
      const [pages] = await executeQuery<EditorialPage>(query);

      return NextResponse.json({
        success: true,
        data: pages,
      });
    }
  } catch (error) {
    console.error('Error fetching editorial pages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch editorial pages' },
      { status: 500 }
    );
  }
}

// POST - Update an editorial page
export async function POST(request: NextRequest) {
  try {
    await ensureTableExists();
    await ensureDefaultPages();

    const body = await request.json();
    const { page_id, html_content } = body;

    if (!page_id || html_content === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: page_id, html_content' },
        { status: 400 }
      );
    }

    // Check if page exists
    const checkQuery = 'SELECT id FROM editorial_pages WHERE page_id = ?';
    const [existing] = await executeQuery<{ id: number }>(checkQuery, [page_id]);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Update page content
    const updateQuery = `
      UPDATE editorial_pages 
      SET html_content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE page_id = ?
    `;
    
    await executeQuery(updateQuery, [html_content, page_id]);
    
    return NextResponse.json({
      success: true,
      message: 'Page updated successfully',
      data: { page_id, html_content }
    });
  } catch (error) {
    console.error('Error saving editorial page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save editorial page' },
      { status: 500 }
    );
  }
}

