const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupTemplatesTable() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfodb_db',
      port: Number(process.env.DB_PORT || 3306),
      charset: 'utf8mb4'
    });

    console.log('✅ Connected to database');

    // Create templates table
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
    console.log('✅ Template schemas table created successfully');

    // Insert default templates if they don't exist
    const defaultTemplates = [
      {
        template_id: 'main-desktop',
        name: 'Головна сторінка (Десктоп)',
        description: 'Схема для десктопної версії головної сторінки',
        schema_json: JSON.stringify({
          layout: 'desktop',
          sections: ['header', 'hero', 'news', 'footer']
        })
      },
      {
        template_id: 'main-mobile',
        name: 'Головна сторінка (Мобільна)',
        description: 'Схема для мобільної версії головної сторінки',
        schema_json: JSON.stringify({
          layout: 'mobile',
          sections: ['header', 'hero', 'news', 'footer']
        })
      },
      {
        template_id: 'category-desktop',
        name: 'Сторінка категорії (Десктоп)',
        description: 'Схема для десктопної версії сторінки категорії',
        schema_json: JSON.stringify({
          layout: 'desktop',
          sections: ['header', 'breadcrumbs', 'category-content', 'footer']
        })
      },
      {
        template_id: 'category-mobile',
        name: 'Сторінка категорії (Мобільна)',
        description: 'Схема для мобільної версії сторінки категорії',
        schema_json: JSON.stringify({
          layout: 'mobile',
          sections: ['header', 'breadcrumbs', 'category-content', 'footer']
        })
      },
      {
        template_id: 'hero',
        name: 'Hero секція',
        description: 'Схема для Hero секції з каруселлю',
        schema_json: JSON.stringify({
          type: 'hero',
          slides: [],
          navigation: true
        })
      },
      {
        template_id: 'hero-info-desktop',
        name: 'Hero Info (Десктоп)',
        description: 'Схема для Hero Info секції (десктоп)',
        schema_json: JSON.stringify({
          layout: 'desktop',
          type: 'hero-info',
          position: 'right'
        })
      },
      {
        template_id: 'hero-info-mobile',
        name: 'Hero Info (Мобільна)',
        description: 'Схема для Hero Info секції (мобільна)',
        schema_json: JSON.stringify({
          layout: 'mobile',
          type: 'hero-info',
          position: 'bottom'
        })
      },
      {
        template_id: 'article-desktop',
        name: 'Сторінка статті (Десктоп)',
        description: 'Схема для десктопної версії сторінки статті',
        schema_json: JSON.stringify({
          layout: 'desktop',
          sections: ['header', 'breadcrumbs', 'article-content', 'sidebar', 'footer']
        })
      },
      {
        template_id: 'article-mobile',
        name: 'Сторінка статті (Мобільна)',
        description: 'Схема для мобільної версії сторінки статті',
        schema_json: JSON.stringify({
          layout: 'mobile',
          sections: ['header', 'breadcrumbs', 'article-content', 'footer']
        })
      }
    ];

    for (const template of defaultTemplates) {
      const insertQuery = `
        INSERT IGNORE INTO template_schemas (template_id, name, description, schema_json)
        VALUES (?, ?, ?, ?)
      `;
      
      await connection.execute(insertQuery, [
        template.template_id,
        template.name,
        template.description,
        template.schema_json
      ]);
    }

    console.log('✅ Default templates inserted successfully');
    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up templates table:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupTemplatesTable()
  .then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });

