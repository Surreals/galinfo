const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTagsToImages() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfo',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔗 Connected to database');

    // Check if tags column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'a_pics' AND COLUMN_NAME = 'tags'
    `, [process.env.DB_NAME || 'galinfo']);

    if (columns.length > 0) {
      console.log('✅ Tags column already exists in a_pics table');
      return;
    }

    // Add tags column to a_pics table
    await connection.execute(`
      ALTER TABLE a_pics 
      ADD COLUMN tags TEXT NULL COMMENT 'Comma-separated tags for the image'
    `);

    console.log('✅ Successfully added tags column to a_pics table');

  } catch (error) {
    console.error('❌ Error adding tags column:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
addTagsToImages()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
