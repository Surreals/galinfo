// Script to add thumburl column to a_videos table
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'galinfo',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function addThumbUrlColumn() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(config);
    
    console.log('📊 Checking if thumburl column exists...');
    
    // Check if column already exists
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM a_videos LIKE 'thumburl'
    `);
    
    if (columns.length > 0) {
      console.log('✅ thumburl column already exists!');
      return;
    }
    
    console.log('➕ Adding thumburl column to a_videos table...');
    
    await connection.execute(`
      ALTER TABLE a_videos 
      ADD COLUMN thumburl VARCHAR(500) AFTER description_deflang
    `);
    
    console.log('✅ thumburl column added successfully!');
    console.log('');
    console.log('📋 Column details:');
    console.log('  - Name: thumburl');
    console.log('  - Type: VARCHAR(500)');
    console.log('  - Nullable: Yes (NULL allowed)');
    console.log('  - Position: After description_deflang');
    console.log('');
    console.log('✨ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
addThumbUrlColumn();

