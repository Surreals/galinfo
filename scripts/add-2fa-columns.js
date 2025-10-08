/**
 * Migration script to add 2FA columns to a_powerusers table
 * Run this script to add the necessary columns for Two-Factor Authentication
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
  database: process.env.DB_NAME || 'galinfodb_db',
  port: Number(process.env.DB_PORT || 3306),
};

async function add2FAColumns() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database.');
    
    // Check if columns already exist
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'a_powerusers' 
       AND COLUMN_NAME IN ('twofa_enabled', 'twofa_secret', 'backup_codes')`,
      [config.database]
    );
    
    const existingColumns = columns.map(row => row.COLUMN_NAME);
    
    if (existingColumns.length === 3) {
      console.log('✅ All 2FA columns already exist. Nothing to do.');
      return;
    }
    
    console.log('📊 Adding 2FA columns to a_powerusers table...');
    
    // Add columns one by one to avoid errors if some already exist
    if (!existingColumns.includes('twofa_enabled')) {
      await connection.execute(`
        ALTER TABLE a_powerusers 
        ADD COLUMN twofa_enabled TINYINT(1) DEFAULT 0 COMMENT '2FA enabled flag'
      `);
      console.log('✅ Added twofa_enabled column');
    } else {
      console.log('ℹ️  twofa_enabled column already exists');
    }
    
    if (!existingColumns.includes('twofa_secret')) {
      await connection.execute(`
        ALTER TABLE a_powerusers 
        ADD COLUMN twofa_secret VARCHAR(255) DEFAULT NULL COMMENT '2FA secret key'
      `);
      console.log('✅ Added twofa_secret column');
    } else {
      console.log('ℹ️  twofa_secret column already exists');
    }
    
    if (!existingColumns.includes('backup_codes')) {
      await connection.execute(`
        ALTER TABLE a_powerusers 
        ADD COLUMN backup_codes TEXT DEFAULT NULL COMMENT '2FA backup codes (JSON)'
      `);
      console.log('✅ Added backup_codes column');
    } else {
      console.log('ℹ️  backup_codes column already exists');
    }
    
    console.log('✅ 2FA columns migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error adding 2FA columns:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed.');
    }
  }
}

// Run the migration
add2FAColumns()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

