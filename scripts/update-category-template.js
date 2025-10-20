const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function ensureTableExists(connection) {
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
  await connection.execute(createTableQuery);
}

async function upsertCategoryDesktopTemplate(connection) {
  const templateId = 'category-desktop';
  const name = 'Сторінка категорії (Десктоп)';
  const description = 'Схема для десктопної версії сторінки категорії з 4 sidebar категоріями';

  // Try to fetch existing template
  const [rows] = await connection.execute(
    'SELECT id, schema_json FROM template_schemas WHERE template_id = ? LIMIT 1',
    [templateId]
  );

  if (rows.length === 0) {
    console.error('❌ Template "category-desktop" not found. Open /api/admin/templates once to initialize defaults, then re-run this script.');
    process.exit(1);
  }

  const row = rows[0];
  let schema;
  try {
    schema = typeof row.schema_json === 'string' ? JSON.parse(row.schema_json) : row.schema_json;
  } catch (e) {
    console.error('❌ Failed to parse existing schema_json:', e?.message || e);
    process.exit(1);
  }

  // Ensure sidebar exists
  schema.sidebar = schema.sidebar || { blocks: [] };
  schema.sidebar.blocks = Array.isArray(schema.sidebar.blocks) ? schema.sidebar.blocks : [];

  // Helper to count category blocks
  const isCategoryBlock = (b) => b && (b.type === 'NEWS_LIST' || b.type === 'CATEGORY_NEWS');
  const getCategoryBlocks = () => schema.sidebar.blocks.filter(isCategoryBlock);

  const categoryBlocks = getCategoryBlocks();

  if (categoryBlocks.length >= 4) {
    console.log('ℹ️ Sidebar already has 4+ category blocks. No changes needed.');
  } else {
    // Append a separator and a new default NEWS_LIST block (КУЛЬТУРА, id=5)
    // This category is just a default and can be changed later in admin
    schema.sidebar.blocks.push({
      type: 'RIGHT_SEPARATOR',
      config: { show: true }
    });

    schema.sidebar.blocks.push({
      type: 'NEWS_LIST',
      categoryId: 5, // КУЛЬТУРА (can be changed later)
      config: {
        show: true,
        mobileLayout: 'horizontal',
        arrowRightIcon: true,
        title: 'КУЛЬТУРА',
        showImagesAt: [0, 1],
        showMoreButton: true,
        moreButtonUrl: '/culture',
        widthPercent: 100,
        apiParams: { page: 1, limit: 8, lang: '1', approved: true, type: null }
      }
    });

    console.log('✅ Appended 4th category NEWS_LIST block to sidebar.');
  }

  await connection.execute(
    'UPDATE template_schemas SET name = ?, description = ?, schema_json = ?, updated_at = CURRENT_TIMESTAMP WHERE template_id = ?',
    [name, description, JSON.stringify(schema), templateId]
  );
  console.log(`✅ Saved template: ${templateId}`);
}

async function main() {
  let connection;
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfodb_db',
      port: parseInt(process.env.DB_PORT || '3306'),
    };

    console.log('🔌 Connecting to DB...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected');

    await ensureTableExists(connection);
    await upsertCategoryDesktopTemplate(connection);

    console.log('✨ Done! The category-desktop template now has 4 sidebar category blocks.');
  } catch (err) {
    console.error('❌ Error:', err?.message || err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();


