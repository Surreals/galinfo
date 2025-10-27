#!/usr/bin/env node

/**
 * Complete Database Migration Script for GalInfo Project
 * 
 * This script performs all necessary database migrations to set up the project:
 * 
 * TABLES CREATED:
 * 1. advertisements - реклама та банери
 * 2. template_schemas - схеми шаблонів
 * 3. a_videos - таблиця відео
 * 4. a_powerusers - користувачі адмін-панелі (якщо не існує)
 * 
 * COLUMNS ADDED:
 * 1. a_powerusers: twofa_enabled, twofa_secret, backup_codes (2FA підтримка)
 * 2. a_powerusers: role (ролі користувачів)
 * 3. a_news: isProject (маркер проектів)
 * 4. advertisements: placement (позиції реклами)
 * 5. advertisements: content_type, html_content (HTML контент)
 * 6. a_videos: thumburl (мініатюри відео)
 * 7. a_pics: tags (теги зображень)
 * 
 * DEFAULT DATA:
 * - Тестові реклами з різними розташуваннями
 * - Дефолтні схеми шаблонів для десктопу та мобільних
 * 
 * Usage: node scripts/complete-database-migration.js
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env.production') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'galinfo',
  port: Number(process.env.DB_PORT || 3306),
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🚀 GalInfo Complete Database Migration');
    console.log('=====================================');
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database successfully!\n');

    // 1. Create advertisements table
    await createAdvertisementsTable(connection);
    
    // 2. Create template_schemas table
    await createTemplateSchemasTable(connection);
    
    // 3. Create a_videos table
    await createVideosTable(connection);
    
    // 4. Add 2FA columns to a_powerusers
    await add2FAColumns(connection);
    
    // 5. Add role column to a_powerusers
    await addRoleColumn(connection);
    
    // 6. Add isProject column to a_news
    await addIsProjectColumn(connection);
    
    // 7. Add placement column to advertisements
    await addPlacementColumn(connection);
    
    // 8. Add thumburl column to a_videos
    await addThumbUrlColumn(connection);
    
    // 9. Add HTML content columns to advertisements
    await addHtmlContentColumns(connection);
    
    // 10. Add tags column to a_pics
    await addTagsColumn(connection);
    
    // 11. Create a_powerusers table if not exists
    await createPowerUsersTable(connection);
    
    // 12. Setup default data
    await setupDefaultData(connection);
    
    console.log('\n🎉 All migrations completed successfully!');
    console.log('✨ Database is now ready for the GalInfo project!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 Database connection closed.');
    }
  }
}

async function createAdvertisementsTable(connection) {
  console.log('📊 Creating advertisements table...');
  
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS advertisements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      image_url VARCHAR(500),
      link_url VARCHAR(500) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      display_order INT DEFAULT 0,
      click_count INT DEFAULT 0,
      view_count INT DEFAULT 0,
      start_date DATETIME NULL,
      end_date DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_active (is_active),
      INDEX idx_order (display_order),
      INDEX idx_dates (start_date, end_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  console.log('✅ Advertisements table created/verified');
}

async function createTemplateSchemasTable(connection) {
  console.log('📊 Creating template_schemas table...');
  
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS template_schemas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      template_id VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      schema_json JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_template_id (template_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  console.log('✅ Template schemas table created/verified');
}

async function createVideosTable(connection) {
  console.log('📊 Creating a_videos table...');
  
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS a_videos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      title_ua VARCHAR(500),
      title_deflang VARCHAR(500),
      description_ua TEXT,
      description_deflang TEXT,
      thumburl VARCHAR(500),
      duration INT DEFAULT 0,
      file_size BIGINT DEFAULT 0,
      mime_type VARCHAR(100),
      video_type TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_filename (filename),
      INDEX idx_video_type (video_type),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  console.log('✅ a_videos table created/verified');
}

async function add2FAColumns(connection) {
  console.log('📊 Adding 2FA columns to a_powerusers...');
  
  // Check if columns already exist
  const [columns] = await connection.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME = 'a_powerusers' 
    AND COLUMN_NAME IN ('twofa_enabled', 'twofa_secret', 'backup_codes')
  `, [config.database]);
  
  const existingColumns = columns.map(row => row.COLUMN_NAME);
  
  if (existingColumns.length === 3) {
    console.log('✅ All 2FA columns already exist');
    return;
  }
  
  // Add columns one by one
  if (!existingColumns.includes('twofa_enabled')) {
    await connection.execute(`
      ALTER TABLE a_powerusers 
      ADD COLUMN twofa_enabled TINYINT(1) DEFAULT 0 COMMENT '2FA enabled flag'
    `);
    console.log('✅ Added twofa_enabled column');
  }
  
  if (!existingColumns.includes('twofa_secret')) {
    await connection.execute(`
      ALTER TABLE a_powerusers 
      ADD COLUMN twofa_secret VARCHAR(255) DEFAULT NULL COMMENT '2FA secret key'
    `);
    console.log('✅ Added twofa_secret column');
  }
  
  if (!existingColumns.includes('backup_codes')) {
    await connection.execute(`
      ALTER TABLE a_powerusers 
      ADD COLUMN backup_codes TEXT DEFAULT NULL COMMENT '2FA backup codes (JSON)'
    `);
    console.log('✅ Added backup_codes column');
  }
}

async function addRoleColumn(connection) {
  console.log('📊 Adding role column to a_powerusers...');
  
  // Check if role column exists
  const [columns] = await connection.execute(`
    SHOW COLUMNS FROM a_powerusers LIKE 'role'
  `);
  
  if (columns.length > 0) {
    console.log('✅ Role column already exists');
    
    // Update existing roles
    await connection.execute(`
      UPDATE a_powerusers 
      SET role = 'journalist' 
      WHERE role IS NULL OR role = ''
    `);
    
    await connection.execute(`
      UPDATE a_powerusers 
      SET role = 'admin' 
      WHERE uname = 'admin'
    `);
    
    console.log('✅ Updated existing roles');
  } else {
    // Add role column
    await connection.execute(`
      ALTER TABLE a_powerusers 
      ADD COLUMN role VARCHAR(20) DEFAULT 'journalist' 
      AFTER perm
    `);
    
    // Set all users to journalist by default
    await connection.execute(`
      UPDATE a_powerusers 
      SET role = 'journalist' 
      WHERE role IS NULL OR role = ''
    `);
    
    // Set admin role for admin user
    await connection.execute(`
      UPDATE a_powerusers 
      SET role = 'admin' 
      WHERE uname = 'admin'
    `);
    
    console.log('✅ Added role column and set default roles');
  }
}

async function addIsProjectColumn(connection) {
  console.log('📊 Adding isProject column to a_news...');
  
  // Check if column exists
  const [columns] = await connection.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'a_news' AND COLUMN_NAME = 'isProject'
  `, [config.database]);
  
  if (columns.length > 0) {
    console.log('✅ isProject column already exists');
  } else {
    await connection.execute(`
      ALTER TABLE a_news 
      ADD COLUMN isProject TINYINT(1) NOT NULL DEFAULT 0 
      COMMENT 'Позначає, чи є новина проектом'
    `);
    console.log('✅ Added isProject column');
  }
}

async function addPlacementColumn(connection) {
  console.log('📊 Adding placement column to advertisements...');
  
  // Check if column exists
  const [columns] = await connection.execute(`
    SHOW COLUMNS FROM advertisements LIKE 'placement'
  `);
  
  if (columns.length > 0) {
    console.log('✅ Placement column already exists');
  } else {
    await connection.execute(`
      ALTER TABLE advertisements 
      ADD COLUMN placement VARCHAR(50) DEFAULT 'general' AFTER link_url,
      ADD INDEX idx_placement (placement)
    `);
    console.log('✅ Added placement column');
  }
}

async function addThumbUrlColumn(connection) {
  console.log('📊 Adding thumburl column to a_videos...');
  
  // Check if column exists
  const [columns] = await connection.execute(`
    SHOW COLUMNS FROM a_videos LIKE 'thumburl'
  `);
  
  if (columns.length > 0) {
    console.log('✅ thumburl column already exists');
  } else {
    await connection.execute(`
      ALTER TABLE a_videos 
      ADD COLUMN thumburl VARCHAR(500) AFTER description_deflang
    `);
    console.log('✅ Added thumburl column');
  }
}

async function addHtmlContentColumns(connection) {
  console.log('📊 Adding HTML content columns to advertisements...');
  
  // Check if columns exist
  const [columns] = await connection.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME = 'advertisements' 
    AND COLUMN_NAME IN ('content_type', 'html_content')
  `, [config.database]);
  
  const existingColumns = columns.map(row => row.COLUMN_NAME);
  
  // Add content_type column
  if (!existingColumns.includes('content_type')) {
    await connection.execute(`
      ALTER TABLE advertisements 
      ADD COLUMN content_type ENUM('image', 'html') DEFAULT 'image' AFTER link_url
    `);
    console.log('✅ Added content_type column');
  }
  
  // Add html_content column
  if (!existingColumns.includes('html_content')) {
    await connection.execute(`
      ALTER TABLE advertisements 
      ADD COLUMN html_content TEXT NULL AFTER content_type
    `);
    console.log('✅ Added html_content column');
  }
  
  if (existingColumns.length === 2) {
    console.log('✅ HTML content columns already exist');
  }
}

async function addTagsColumn(connection) {
  console.log('📊 Adding tags column to a_pics...');
  
  // Check if column exists
  const [columns] = await connection.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'a_pics' AND COLUMN_NAME = 'tags'
  `, [config.database]);
  
  if (columns.length > 0) {
    console.log('✅ Tags column already exists');
  } else {
    await connection.execute(`
      ALTER TABLE a_pics 
      ADD COLUMN tags TEXT NULL COMMENT 'Comma-separated tags for the image'
    `);
    console.log('✅ Added tags column');
  }
}

async function createPowerUsersTable(connection) {
  console.log('📊 Creating/verifying a_powerusers table...');
  
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS a_powerusers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uname VARCHAR(255) NOT NULL UNIQUE,
      upass VARCHAR(255) NOT NULL,
      uname_ua VARCHAR(255),
      uagency VARCHAR(255),
      perm TEXT,
      role VARCHAR(20) DEFAULT 'journalist',
      active TINYINT(1) DEFAULT 1,
      twofa_enabled TINYINT(1) DEFAULT 0,
      twofa_secret VARCHAR(255) DEFAULT NULL,
      backup_codes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_uname (uname),
      INDEX idx_role (role),
      INDEX idx_active (active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  console.log('✅ a_powerusers table created/verified');
}

async function setupDefaultData(connection) {
  console.log('📊 Setting up default data...');
  
  // Insert default advertisements
  await connection.execute(`
    INSERT IGNORE INTO advertisements (id, title, image_url, link_url, placement, is_active, display_order)
    VALUES 
      (1, 'Тестова реклама 1', '/media/sample-ad.jpg', 'https://example.com', 'adbanner', true, 1),
      (2, 'Тестова реклама 2', '/media/sample-ad2.jpg', 'https://example.com/promo', 'infomo', false, 2),
      (3, 'Тестова реклама Sidebar', '/media/sample-ad3.jpg', 'https://example.com/sidebar', 'sidebar', true, 3)
  `);
  
  // Insert default template schemas
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
    await connection.execute(`
      INSERT IGNORE INTO template_schemas (template_id, name, description, schema_json)
      VALUES (?, ?, ?, ?)
    `, [
      template.template_id,
      template.name,
      template.description,
      template.schema_json
    ]);
  }
  
  console.log('✅ Default data inserted');
}

// Run the migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
